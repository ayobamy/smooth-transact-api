import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Notifications } from '../../notification-service/entities/notification.entity';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'payment_due', 'new_invoice', etc.

  @Column()
  message: string;

  @Column({ nullable: true })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.alerts)
  invoice: Invoice;

  @ManyToOne(() => User, (user) => user.alerts)
  user: User;

  @OneToMany(() => Notifications, (notification) => notification.alerts, {
    cascade: true,
  })
  notifications: Notification[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
