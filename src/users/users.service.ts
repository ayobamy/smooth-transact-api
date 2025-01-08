// user.service
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import {
  CreatePersonalUserDto,
  CreateBusinessUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private walletService: WalletService,
  ) {}

  async create(
    createUserDto: CreatePersonalUserDto | CreateBusinessUserDto,
  ): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);

    const savedUser = await this.usersRepository.save(newUser);

    const newWallet = await this.walletService.createWallet(savedUser.id);

    savedUser.wallet = newWallet;

    await this.usersRepository.save(savedUser);

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { email: email } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: ['wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async stats(): Promise<{ NumberOfUsers: number }> {
    const NumberOfUsers = await this.usersRepository.count();
    return { NumberOfUsers };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
