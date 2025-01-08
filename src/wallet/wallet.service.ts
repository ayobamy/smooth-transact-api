// wallet.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { generateUniqueWalletId } from 'src/utils/generateRandom';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      walletId: generateUniqueWalletId(10),
      balance: { amount: 0 },
      user: { id: userId },
    });

    return this.walletRepository.save(wallet);
  }

  async updateWalletBalance(userId: string, amount: number): Promise<void> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!wallet) {
        await this.createWallet(userId);

        const newWallet = await this.walletRepository.findOne({
          where: { user: { id: userId } },
        });

        if (!newWallet) {
          throw new NotFoundException('User wallet not found');
        }

        newWallet.balance.amount += amount / 100;

        await this.walletRepository.save(newWallet);
        console.log('Wallet balance updated successfully');
      } else {
        wallet.balance.amount += amount / 100;

        await this.walletRepository.save(wallet);
        console.log('Wallet balance updated successfully');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update wallet balance');
    }
  }

  async getWalletBalance(userId: string): Promise<number> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!wallet) {
        throw new NotFoundException('User wallet not found');
      }

      return wallet.balance.amount;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve wallet balance');
    }
  }

  async getWalletDetails(userId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!wallet) {
        throw new NotFoundException('User wallet not found');
      }

      return wallet;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to retrieve wallet details');
    }
  }
}
