import { Module } from '@nestjs/common';
import { MailgunService } from './mailgun.service';

@Module({
  providers: [MailgunService],
  controllers: [],
  exports: [MailgunService],
})
export class MailgunModule {}
