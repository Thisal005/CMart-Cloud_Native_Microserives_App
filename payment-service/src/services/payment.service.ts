import { NotFoundError, ValidationError, AuthorizationError, ConflictError } from 'shared';
import crypto from 'crypto';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { AuthClient } from '../clients/auth.client';
import { OrderClient } from '../clients/order.client';
import { Payment } from '../models/payment.entity';
import { PaymentStatus, PaymentMethod } from '../models/payment';
import { logger } from '../utils/logger';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private paymentGateway: PaymentGateway;
  private authClient: AuthClient;
  private orderClient: OrderClient;

  constructor(
    paymentRepository: PaymentRepository,
    paymentGateway: PaymentGateway,
    authClient: AuthClient,
    orderClient: OrderClient
  ) {
    this.paymentRepository = paymentRepository;
    this.paymentGateway = paymentGateway;
    this.authClient = authClient;
    this.orderClient = orderClient;
  }

  /**
   * Orchestrates the payment checkout flow:
   * 1. Validate order eligibility and ownership via Order Client.
   * 2. Persist a PENDING payment record.
   * 3. Call the payment gateway interface.
   * 4. Transition status to SUCCESS or FAILED in the database.
   * 5. Asynchronously notify the Order Service of the transaction outcome.
   */
  public async processPayment(
    userId: string,
    token: string,
    dto: {
      orderId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      cardNumber: string;
      currency?: string;
    }
  ): Promise<Payment> {
    const { orderId, amount, paymentMethod, cardNumber } = dto;
    const currency = dto.currency || 'USD';

    logger.info('Payment request received', {
      userId,
      amount,
      paymentMethod,
    });

    // 1. Fetch the order details via the REST client to ensure it exists and matches
    const order = await this.orderClient.getOrder(orderId, token);
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    logger.info('Order validated', {
      orderId,
      status: order.status,
    });

    // 2. Validate order ownership
    if (order.userId !== userId) {
      logger.warn('Unauthorized payment attempt: Order ownership mismatch', { userId, orderUserId: order.userId, orderId });
      throw new AuthorizationError('You do not have permission to pay for this order');
    }

    // 3. Verify order eligibility for payment
    // Standard CMart order statuses: PENDING, PAYMENT_PENDING, PAYMENT_FAILED
    const allowedOrderStatuses = ['PENDING', 'PAYMENT_PENDING', 'PAYMENT_FAILED'];
    if (!allowedOrderStatuses.includes(order.status)) {
      throw new ValidationError(`Order is not eligible for payment. Current status: ${order.status}`);
    }

    // 4. Verify charge amount match
    const orderTotal = Number(order.totalAmount);
    const requestAmount = Number(amount);
    if (Math.abs(orderTotal - requestAmount) > 0.005) {
      throw new ValidationError(`Invalid payment amount: requested $${requestAmount}, but order total is $${orderTotal}`);
    }

    // 5. Create the local payment record with status PENDING
    // Generate a temporary transaction reference until the gateway issues one
    const tempTxRef = `TEMP-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const payment = await this.paymentRepository.create({
      orderId,
      userId,
      amount,
      currency,
      paymentMethod,
      transactionReference: tempTxRef,
      gateway: 'MOCK', // Currently using Mock Gateway
      status: PaymentStatus.PENDING,
    });

    // Validate status transition locally and move to PROCESSING before calling gateway
    this.validateStatusTransition(payment.status, PaymentStatus.PROCESSING);
    payment.status = PaymentStatus.PROCESSING;
    await this.paymentRepository.save(payment);

    // 6. Call the Payment Gateway abstraction layer
    let gatewayResult;
    logger.info('Gateway selected', { gateway: payment.gateway, paymentId: payment.id });
    const gatewayStartTime = Date.now();
    try {
      gatewayResult = await this.paymentGateway.processPayment({
        orderId,
        amount,
        paymentMethod,
        cardNumber,
        currency,
        userId,
      });
      const duration = Date.now() - gatewayStartTime;
      logger.info('Gateway response received', {
        service: 'PaymentGateway',
        operation: 'processPayment',
        duration,
        success: gatewayResult.status === 'SUCCESS',
      });
    } catch (gatewayError: any) {
      const duration = Date.now() - gatewayStartTime;
      logger.error('Gateway response received', gatewayError, {
        service: 'PaymentGateway',
        operation: 'processPayment',
        duration,
        success: false,
      });

      this.validateStatusTransition(payment.status, PaymentStatus.FAILED);
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);
      
      try {
        await this.orderClient.updateOrderStatus(orderId, 'PAYMENT_FAILED', token);
      } catch (orderUpdateError) {
        logger.error('Failed to notify Order Service of payment failure post-gateway crash', orderUpdateError as Error, { orderId });
      }

      throw gatewayError;
    }

    // 7. Update status and save based on the gateway response
    const finalStatus = gatewayResult.status === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    
    // Validate status transition locally
    this.validateStatusTransition(payment.status, finalStatus);

    payment.status = finalStatus;
    payment.transactionReference = gatewayResult.transactionId;
    await this.paymentRepository.save(payment);

    logger.info('Payment completed', {
      paymentId: payment.id,
      status: payment.status,
      transactionReference: payment.transactionReference,
    });

    // 8. Update Order Service asynchronously or fail gracefully if Order service is offline
    const orderNextStatus = finalStatus === PaymentStatus.SUCCESS ? 'PAID' : 'PAYMENT_FAILED';
    try {
      await this.orderClient.updateOrderStatus(orderId, orderNextStatus, token);
      logger.info('Order update result', { orderId, status: orderNextStatus, success: true });
    } catch (orderUpdateError: any) {
      logger.error(`Order update result: Failed to update status of order ${orderId} to ${orderNextStatus} after payment completed`, orderUpdateError, {
        orderId,
        paymentId: payment.id,
        success: false,
      });
    }

    return payment;
  }

  /**
   * Fetch single payment record with owner checks.
   */
  public async getPaymentById(id: string, userId: string, userRole: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError(`Payment with ID ${id} not found`);
    }

    // Authorization: User can only view their own payments unless they are an admin
    if (payment.userId !== userId && userRole !== 'ADMIN') {
      logger.warn('Unauthorized payment access attempt', { userId, userRole, paymentId: id, ownerId: payment.userId });
      throw new AuthorizationError('You do not have permission to view this payment');
    }

    return payment;
  }

  /**
   * Fetch payment transaction history for a specific User.
   */
  public async getPaymentsByUserId(targetUserId: string, requesterUserId: string, requesterUserRole: string): Promise<Payment[]> {
    // Authorization: User can only query their own payments unless they are an admin
    if (targetUserId !== requesterUserId && requesterUserRole !== 'ADMIN') {
      logger.warn('Unauthorized user payments query attempt', { requesterUserId, requesterUserRole, targetUserId });
      throw new AuthorizationError('You do not have permission to view other users\' payments');
    }
    return this.paymentRepository.findByUserId(targetUserId);
  }

  /**
   * Fetch payment transaction history for a specific Order.
   */
  public async getPaymentsByOrderId(orderId: string, userId: string, userRole: string, token: string): Promise<Payment[]> {
    // Retrieve the order to perform validation checks
    const order = await this.orderClient.getOrder(orderId, token);
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    // Authorization: User can only query payments of their own order unless they are an admin
    if (order.userId !== userId && userRole !== 'ADMIN') {
      logger.warn('Unauthorized order payment access attempt', { userId, userRole, orderId, ownerId: order.userId });
      throw new AuthorizationError('You do not have permission to view payments for this order');
    }

    return this.paymentRepository.findByOrderId(orderId);
  }

  /**
   * Prepares a refund structure for future gateway integrations.
   * Currently updates local database state to REFUNDED after validating credentials.
   */
  public async refundPayment(id: string, amount: number, requesterUserId: string, requesterUserRole: string): Promise<Payment> {
    logger.info('Refund started', { paymentId: id, amount, requesterUserId });
    try {
      const payment = await this.paymentRepository.findById(id);
      if (!payment) {
        throw new NotFoundError(`Payment with ID ${id} not found`);
      }

      // Authorization: Only administrators or the payment owner can trigger refunds
      if (payment.userId !== requesterUserId && requesterUserRole !== 'ADMIN') {
        logger.warn('Refund authorization failure: Requester is not owner or admin', { requesterUserId, requesterUserRole, paymentId: id, ownerId: payment.userId });
        throw new AuthorizationError('You do not have permission to refund this payment');
      }



      // Check refund amount boundary rules
      if (amount <= 0 || amount > payment.amount) {
        throw new ValidationError(`Invalid refund amount ${amount}. Must be positive and less than or equal to original amount ${payment.amount}.`);
      }

      // Validate status transition: SUCCESS -> REFUNDED
      this.validateStatusTransition(payment.status, PaymentStatus.REFUNDED);

      logger.info('External refund request started (Simulation)', { gateway: payment.gateway, transactionReference: payment.transactionReference });

      // In future integration:
      // const refundResult = await this.paymentGateway.refundPayment({ transactionReference: payment.transactionReference, amount });
      
      payment.status = PaymentStatus.REFUNDED;
      const updatedPayment = await this.paymentRepository.save(payment);

      const refundId = `re_sim_${crypto.randomBytes(8).toString('hex')}`;
      logger.info('Refund completed', { paymentId: id, amount, refundId });

      return updatedPayment;
    } catch (err: any) {
      logger.error('Refund failed', err, { paymentId: id, amount, requesterUserId });
      throw err;
    }
  }

  /**
   * Fetch paginated payments for a specific user with status filtering.
   * Users can only see their own payments; Admins can see all.
   */
  public async getUserPayments(
    userId: string,
    userRole: string,
    filters: { status?: PaymentStatus; targetUserId?: string },
    page = 1,
    limit = 10
  ): Promise<{ data: Payment[]; total: number }> {
    const scopedUserId = userRole === 'ADMIN' ? filters.targetUserId : userId;

    if (userRole !== 'ADMIN' && filters.targetUserId && filters.targetUserId !== userId) {
      logger.warn('Unauthorized user payments pagination query attempt', { userId, userRole, targetUserId: filters.targetUserId });
      throw new AuthorizationError('You do not have permission to view other users\' payments');
    }

    return this.paymentRepository.findWithPagination(
      {
        userId: scopedUserId,
        status: filters.status,
      },
      {
        page,
        limit,
      }
    );
  }

  /**
   * Enforces status transition rules at the service layer level.
   */
  private validateStatusTransition(from: PaymentStatus, to: PaymentStatus): void {
    const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING],
      [PaymentStatus.PROCESSING]: [PaymentStatus.SUCCESS, PaymentStatus.FAILED],
      [PaymentStatus.SUCCESS]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [],
      [PaymentStatus.REFUNDED]: [],
      [PaymentStatus.CANCELLED]: [],
    };

    if (from !== to && !allowedTransitions[from].includes(to)) {
      throw new ConflictError(`Invalid payment status transition from ${from} to ${to}`);
    }
  }
}
export default PaymentService;
