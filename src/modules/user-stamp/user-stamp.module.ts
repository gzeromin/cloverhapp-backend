import { Module } from '@nestjs/common';
import { UserStampController } from './user-stamp.controller';
import { UserStampService } from './user-stamp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStamp } from '@/entities/user-stamp.entity';
import { User } from '@/entities/user.entity';
import { Stamp } from '@/entities/stamp.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { Tag } from '@/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserStamp, User, Stamp, Tag]),
    AuthModule,
  ],
  controllers: [UserStampController],
  providers: [UserStampService],
})
export class UserStampModule {}
