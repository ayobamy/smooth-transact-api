// invoices/invoices.service.ts
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dtos/invoice.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { PaystackService } from '../paystack/paystack.service';
import { ClientsService } from 'src/clients/clients.service';
import { Transaction } from 'src/transactions/entities/transactions.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { ClientProfile } from 'src/clients/entities/client.entity';
import { CreateClientProfileDto } from 'src/clients/dto/create-client.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    private readonly paystackService: PaystackService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,
    private readonly clientsService: ClientsService,
    private readonly walletService: WalletService,
  ) {}

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
    clientId: string | null,
    createClientDto?: CreateClientProfileDto,
  ): Promise<{
    invoice: Invoice;
    transaction: Transaction;
    clientDetails: ClientProfile;
  }> {
    try {
      let client: ClientProfile;

      if (clientId) {
        client = await this.clientsService.getClientByIdAndUserId(
          clientId,
          userId,
        );
      } else if (createClientDto) {
        const existingClient =
          await this.clientsService.getClientByEmailAndUserId(
            createClientDto.email,
            userId,
          );

        if (existingClient) {
          throw new ConflictException('Client profile already exists');
        }
        const newClient = await this.clientsService.createClientProfile(
          userId,
          createClientDto,
        );

        client = newClient;
        clientId = newClient.id;
      }

      const { description, amount, dueDate } = createInvoiceDto;

      const newAmount = amount * 100;

      const newInvoice = this.invoiceRepository.create({
        description,
        amount: newAmount,
        dueDate: new Date(dueDate),
        status: 'unpaid',
        user: { id: userId },
        client: { id: client.id },
      } as DeepPartial<Invoice>);

      const savedInvoice = await this.invoiceRepository.save(newInvoice);

      const transaction = await this.transactionsService.createTransaction(
        {
          invoiceId: savedInvoice.id,
          amount: savedInvoice.amount,
          status: 'pending',
        },
        userId,
        clientId,
      );

      return { invoice: savedInvoice, transaction, clientDetails: client };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to create invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getInvoiceDetails(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['user'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async markInvoiceAsPaid(invoiceId: string): Promise<{ invoice: Invoice }> {
    const invoice = await this.getInvoiceDetails(invoiceId);

    const paymentDetails = await this.paystackService.verifyPayment(
      invoice.paymentReference,
    );

    if (paymentDetails.data.status === 'success') {
      const { reference, amount } = paymentDetails.data;

      invoice.status = 'paid';
      invoice.paymentReference = reference;
      invoice.amount = amount;

      const updatedInvoice = await this.invoiceRepository.save(invoice);

      await this.transactionsService.updateTransactionStatus(
        invoiceId,
        'success',
      );

      await this.walletService.updateWalletBalance(invoice.user.id, amount);

      return { invoice: updatedInvoice };
    } else {
      throw new HttpException(
        'Payment verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async generatePaystackLink(invoiceId: string): Promise<string> {
    const invoice = await this.getInvoiceDetails(invoiceId);

    if (invoice.paymentReference) {
      return this.paystackService.getPaymentLinkFromReference(
        invoice.paymentReference,
      );
    }

    try {
      const paymentResponse = await this.paystackService.initiatePayment(
        invoice.user.email,
        invoice.amount,
      );

      invoice.paymentReference = paymentResponse.data.reference;
      await this.invoiceRepository.save(invoice);

      return paymentResponse.data.authorization_url;
    } catch (error) {
      throw new HttpException(
        'Error generating Paystack link',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private extractReferenceFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}
