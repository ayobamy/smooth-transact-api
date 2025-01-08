import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as https from 'https';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaystackService {
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = configService.get<string>('secretKey');
  }

  private async makeRequest(
    options: https.RequestOptions,
    data?: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const paystackRequest = https.request(options, (paystackRes) => {
        let responseData = '';

        paystackRes.on('data', (chunk) => {
          responseData += chunk;
        });

        paystackRes.on('end', () => {
          try {
            const responseJson = JSON.parse(responseData);
            resolve(responseJson);
          } catch (error) {
            reject(
              new HttpException(
                'Invalid Paystack response',
                HttpStatus.BAD_REQUEST,
              ),
            );
          }
        });
      });

      paystackRequest.on('error', (error) => {
        reject(
          new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      });

      if (data) {
        paystackRequest.write(JSON.stringify(data));
      }

      paystackRequest.end();
    });
  }

  async initiatePayment(email: string, amount: number): Promise<any> {
    const data = { email, amount };

    const options: https.RequestOptions = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.secretKey}`,
      },
    };

    return this.makeRequest(options, data);
  }

  async verifyPayment(reference: string): Promise<any> {
    const options: https.RequestOptions = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    };
    return this.makeRequest(options);
  }

  async getPaymentLinkFromReference(reference: string): Promise<string> {
    try {
      const paymentDetails = await this.verifyPayment(reference);

      // Handle various Paystack response structures
      const authorization =
        paymentDetails.data?.authorization || paymentDetails.authorization;

      if (!authorization) {
        throw new HttpException(
          'Invalid Paystack response structure',
          HttpStatus.BAD_REQUEST,
        );
      }

      return authorization.authorization_url;
    } catch (error) {
      throw new HttpException(
        'Error retrieving payment link from Paystack reference',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async processPaymentVerification(reference: string): Promise<any> {
    try {
      const paymentDetails = await this.verifyPayment(reference);

      if (paymentDetails.status === 'success') {
        return paymentDetails;
      } else {
        throw new HttpException(
          'Payment verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Error verifying payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBankList(): Promise<any> {
    const options: https.RequestOptions = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/bank',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    };

    try {
      return await this.makeRequest(options);
    } catch (error) {
      throw new HttpException(
        'Error fetching bank list from Paystack',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resolveAccountNumber(
    accountNumber: string,
    bankCode: string,
  ): Promise<any> {
    const options: https.RequestOptions = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    };

    try {
      const response = await this.makeRequest(options);
      if (response.status && response.status === true && response.data) {
        return response.data;
      } else {
        throw new HttpException(
          'Error resolving account number on Paystack',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to resolve and save account details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBankCode(bankName: string): Promise<string> {
    const options: https.RequestOptions = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/bank',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    };

    try {
      const response = await this.makeRequest(options);
      const bankList = response.data || [];
      const selectedBank = bankList.find(
        (bank: { name: string }) =>
          bank.name.toLowerCase() === bankName.toLowerCase(),
      );

      if (!selectedBank) {
        throw new HttpException('Bank not found', HttpStatus.NOT_FOUND);
      }

      return selectedBank.code;
    } catch (error) {
      throw new HttpException(
        'Error fetching bank list from Paystack',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
