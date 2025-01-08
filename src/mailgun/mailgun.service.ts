import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Mailgen from 'mailgen';
import { google } from 'googleapis';

@Injectable()
export class MailgunService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly refreshToken: string;
  private readonly userMail: string;
  private readonly oauth2Client: any;

  constructor(private configService: ConfigService) {
    this.clientId = configService.get<string>('mail_client_id');
    this.clientSecret = configService.get<string>('mail_client_secret');
    this.refreshToken = configService.get<string>('mail_refresh_token');
    this.userMail = configService.get<string>('user_mail');

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.refreshToken,
    );
    this.oauth2Client.setCredentials({ refresh_token: this.refreshToken });
  }

  async sendWelcomeEmail(to: string, username: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accessToken = await this.oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      auth: {
        type: 'OAuth2',
        user: this.userMail,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken,
      },
    });
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Smooth Transact',
        link: 'https://smooth-transact.netlify.app',
        logo: './../src/mailgun/assets/Logo.png',
      },
    });

    const emailContent = {
      body: {
        name: username,
        intro: 'Welcome to Smooth Transact!',
        action: {
          instructions: 'To get started, Sign in to your Account',
          button: {
            color: '#0096FF',
            text: 'Sign in',
            link: 'https://smooth-transact.netlify.app/auth/login',
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };

    const emailHtml = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Ahmed from Smooth Transact <contact@ahmedolawale.me>',
      to: to,
      subject: 'Welcome to Smooth Transact',
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.response;
  }

  async sendPasswordResetEmail(to: string, username: string, otp: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accessToken = await this.oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      auth: {
        type: 'OAuth2',
        user: this.userMail,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken,
      },
    });

    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Smooth Transact',
        link: 'https://smooth-transact.netlify.app',
        logo: '../../src/mailgun/assets/Logo.png',
      },
    });

    const emailContent = {
      body: {
        name: username,
        intro:
          'You have received this email because a password reset request for your account was received.',
        action: {
          instructions: 'Enter the OTP below to reset your password:',
          button: {
            color: '#0096FF',
            text: otp,
            link: '',
          },
        },
        outro:
          'If you did not request a password reset, no further action is required on your part.',
      },
    };

    const emailHtml = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Ahmed from Smooth Transact <contact@ahmedolawale.me>',
      to: to,
      subject: 'Password Reset Request from Smooth Transact',
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.response;
  }

  async sendInvoicePaymentEmail(
    to: string,
    username: string,
    description: string,
    amount: string,
    paymentLink: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accessToken = await this.oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      auth: {
        type: 'OAuth2',
        user: this.userMail,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken,
      },
    });

    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Smooth Transact',
        link: 'https://smooth-transact.netlify.app',
        logo: '../../src/mailgun/assets/Logo.png',
      },
    });

    const emailContent = {
      body: {
        name: username,
        dictionary: {
          Description: description,
          Amount: amount,
        },
        action: [
          {
            instructions:
              'You received this email because you have an unpaid invoice with the details above:',
            button: {
              text: 'Invoice Details Above 🔼',
              link: '',
            },
          },
          {
            instructions: 'Click on the link below to pay for the invoice',
            button: {
              text: 'Pay for Invoice',
              link: paymentLink,
            },
          },
        ],
      },
    };

    const emailHtml = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Ahmed from Smooth Transact <contact@ahmedolawale.me>',
      to: to,
      subject: 'Invoice Payment Request from Smooth Transact',
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.response;
  }
}
