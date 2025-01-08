// transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateTransactionDto } from './dtos/transactions.dto';
import { Transaction } from './entities/transactions.entity';
import { WalletService } from '../wallet/wallet.service';
import { UsersService } from 'src/users/users.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,

    private invoicesService: InvoicesService,
    private walletService: WalletService,
    private usersService: UsersService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    userId: string,
    clientId: string | null,
  ): Promise<Transaction> {
    try {
      const { invoiceId, amount, status } = createTransactionDto;

      const invoiceDetails =
        await this.invoicesService.getInvoiceDetails(invoiceId);

      const clientEmail = invoiceDetails.user.email;

      const user = await this.usersService.findByEmail(clientEmail);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newTransaction = this.transactionRepository.create({
        invoice: invoiceDetails,
        amount,
        status,
        user: { id: userId },
        client: clientId ? { id: clientId } : null,
      } as DeepPartial<Transaction>);

      await this.transactionRepository.save(newTransaction);

      return newTransaction;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create transaction');
    }
  }

  async updateTransactionStatus(
    invoiceId: string,
    status: string,
  ): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { invoiceId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      transaction.status = status;

      return await this.transactionRepository.save(transaction);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update transaction status');
    }
  }
}
