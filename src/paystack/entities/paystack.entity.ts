import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transactions.entity';

@Entity()
export class PayStack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string;

  @Column()
  transactionId: string;

  @OneToOne(() => Transaction, { cascade: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
