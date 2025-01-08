import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Roles } from '../types/user.types';
import { Types } from '../types/user.types';
import { ClientProfile } from '../../clients/entities/client.entity';
import { Alert } from '../../alerts/entities/alert.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Transaction } from 'src/transactions/entities/transactions.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  types: Types;

  @Column({ default: 'user' })
  role: Roles;

  @Column({ nullable: true })
  refreshToken?: string;

  @OneToOne(() => Wallet, { cascade: true })
  @JoinColumn()
  wallet: Wallet;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Invoice, (invoices) => invoices.user)
  invoices: Invoice;

  @OneToMany(() => ClientProfile, (clientProfile) => clientProfile.user, {
    cascade: true,
  })
  clientProfiles: ClientProfile[];

  @OneToMany(() => Alert, (alert) => alert.user, { cascade: true })
  alerts: Alert[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
