import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transactions.entity';
import { Alert } from '../../alerts/entities/alert.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'unpaid' })
  status: string;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @ManyToOne(() => User, (user) => user.invoices)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.invoice, {
    cascade: true,
  })
  transactions: Transaction[];

  @OneToMany(() => Alert, (alert) => alert.invoice, { cascade: true })
  alerts: Alert[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
