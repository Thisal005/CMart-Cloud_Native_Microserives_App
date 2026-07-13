import { Transaction } from '../model/transaction';
import crypto from 'crypto';

export class TransactionRepository {
  private transactions: Transaction[] = [];

  public async findById(transactionId: string): Promise<Transaction | undefined> {
    return this.transactions.find((tx) => tx.transactionId === transactionId);
  }

  public async create(txData: Omit<Transaction, 'transactionId' | 'createdAt'>): Promise<Transaction> {
    const newTx: Transaction = {
      transactionId: `TX-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      ...txData,
      createdAt: new Date(),
    };
    this.transactions.push(newTx);
    return newTx;
  }
}
