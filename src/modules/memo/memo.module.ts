import { Module } from '@nestjs/common';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memo } from '@/entities/memo.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '@/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Memo, User]), AuthModule],
  controllers: [MemoController],
  providers: [MemoService],
})
export class MemoModule {}
