import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

class Balance {
  @Column({
    type: 'decimal',
    default: 0,
    transformer: { to: (value) => value, from: (value) => parseFloat(value) },
  })
  amount: number;
}

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  walletId: string;

  @Column(() => Balance)
  balance: Balance;
}
