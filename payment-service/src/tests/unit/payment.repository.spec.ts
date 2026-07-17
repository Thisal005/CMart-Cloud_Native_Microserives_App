import { PaymentRepository } from '../../repositories/payment.repository';
import { Payment } from '../../models/payment.entity';
import { PaymentStatus, PaymentMethod } from '../../models/payment';
import { AppDataSource } from '../../config/data-source';

jest.mock('../../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('PaymentRepository Unit Tests', () => {
  let mockTypeormRepository: any;
  let paymentRepository: PaymentRepository;

  beforeEach(() => {
    mockTypeormRepository = {
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation(async (payment) => payment),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepository);

    paymentRepository = new PaymentRepository();
  });

  it('should create a payment instance', () => {
    const data = { orderId: 'order-1', amount: 100 };
    const result = paymentRepository.createInstance(data);
    expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(data);
  });

  it('should save a payment entity', async () => {
    const payment = new Payment();
    const result = await paymentRepository.save(payment);
    expect(mockTypeormRepository.save).toHaveBeenCalledWith(payment);
    expect(result).toBe(payment);
  });

  it('should create and persist a payment', async () => {
    const data = { orderId: 'order-1', amount: 100 };
    const result = await paymentRepository.create(data);
    expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
    expect(mockTypeormRepository.save).toHaveBeenCalledWith(data);
    expect(result).toEqual(data);
  });

  it('should find payment by ID', async () => {
    const payment = { id: 'id-123' };
    mockTypeormRepository.findOne.mockResolvedValue(payment);

    const result = await paymentRepository.findById('id-123');
    expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { id: 'id-123' } });
    expect(result).toBe(payment);
  });

  it('should find payment by transaction reference', async () => {
    const payment = { transactionReference: 'TX-REF' };
    mockTypeormRepository.findOne.mockResolvedValue(payment);

    const result = await paymentRepository.findByTransactionReference('TX-REF');
    expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { transactionReference: 'TX-REF' } });
    expect(result).toBe(payment);
  });

  it('should find payments by order ID', async () => {
    const payments = [{ orderId: 'order-123' }];
    mockTypeormRepository.find.mockResolvedValue(payments);

    const result = await paymentRepository.findByOrderId('order-123');
    expect(mockTypeormRepository.find).toHaveBeenCalledWith({
      where: { orderId: 'order-123' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toBe(payments);
  });

  it('should update payment status', async () => {
    const payment = { id: 'pay-1', status: PaymentStatus.PENDING };
    mockTypeormRepository.findOne.mockResolvedValue(payment);
    mockTypeormRepository.save.mockResolvedValue({ ...payment, status: PaymentStatus.SUCCESS });

    const result = await paymentRepository.updateStatus('pay-1', PaymentStatus.SUCCESS);
    expect(result.status).toBe(PaymentStatus.SUCCESS);
  });

  it('should throw an error when updating status of a non-existent payment', async () => {
    mockTypeormRepository.findOne.mockResolvedValue(null);

    await expect(
      paymentRepository.updateStatus('non-existent', PaymentStatus.SUCCESS)
    ).rejects.toThrow('Payment with ID non-existent not found');
  });

  it('should paginate results using QueryBuilder', async () => {
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([['payment-1', 'payment-2'], 2]),
    };

    mockTypeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const result = await paymentRepository.findWithPagination(
      { userId: 'user-1', status: PaymentStatus.SUCCESS },
      { page: 2, limit: 5 }
    );

    expect(mockTypeormRepository.createQueryBuilder).toHaveBeenCalledWith('payment');
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.userId = :userId', { userId: 'user-1' });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('payment.status = :status', { status: PaymentStatus.SUCCESS });
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    expect(result).toEqual({ data: ['payment-1', 'payment-2'], total: 2 });
  });
});
