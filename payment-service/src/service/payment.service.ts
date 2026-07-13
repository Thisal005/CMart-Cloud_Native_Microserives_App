import { PaymentRequestDto, PaymentResponseDto } from '../dto/payment.dto';
import { TransactionRepository } from '../repository/transaction.repository';

export class PaymentService {
  private transactionRepository: TransactionRepository;

  constructor(transactionRepository: TransactionRepository) {
    this.transactionRepository = transactionRepository;
  }

  public async processPayment(dto: PaymentRequestDto): Promise<PaymentResponseDto> {
    const { orderId, amount, paymentMethod, cardNumber } = dto;

    if (!orderId || amount === undefined || !paymentMethod || !cardNumber) {
      throw new Error('Missing payment details: orderId, amount, paymentMethod, and cardNumber are required');
    }

    // Business Logic Simulation
    // If the card ends with '9999' or the price is exactly 999.99, we simulate a decline.
    const isDeclined = cardNumber.endsWith('9999') || amount === 999.99;
    const status = isDeclined ? 'FAILED' : 'SUCCESS';
    const message = isDeclined 
      ? 'Card was declined by issuing bank (simulated failure)' 
      : 'Payment processed successfully (simulated success)';

    const transaction = await this.transactionRepository.create({
      orderId,
      amount,
      paymentMethod,
      status,
    });

    return {
      transactionId: transaction.transactionId,
      orderId: transaction.orderId,
      status: transaction.status,
      message,
      createdAt: transaction.createdAt,
    };
  }
}
