import { Module } from '@nestjs/common';
import { NotifController } from './notif.controller';
import { NotifService } from './notif.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { Notif } from '@/entities/notif.entity';
import { Friend } from '@/entities/friend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notif]), AuthModule],
  controllers: [NotifController],
  providers: [NotifService],
})
export class NotifModule {}
