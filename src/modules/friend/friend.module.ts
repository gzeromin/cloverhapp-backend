import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { Friend } from '@/entities/friend.entity';
import { Notif } from '@/entities/notif.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User, Notif]), AuthModule],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
