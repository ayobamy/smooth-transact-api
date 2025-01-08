import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications])],
})
export class NotificationServiceModule {}
