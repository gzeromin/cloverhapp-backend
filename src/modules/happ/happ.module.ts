import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HappController } from './happ.controller';
import { HappService } from './happ.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { EventsModule } from '@/events/events.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from '@/middlewares/multerS3.middleware';
import { Happ } from '@/entities/Happ.entity';
import { Tag } from '@/entities/tag.entity';
import { Comment } from '@/entities/comment.entity';
import { UserStamp } from '@/entities/user-stamp.entity';
import { Stamp } from '@/entities/stamp.entity';
import { Book } from '@/entities/book.entity';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return multerOptionsFactory(configService, 'happ');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Happ, Tag, UserStamp, Stamp, Comment, Book]),
    AuthModule,
    EventsModule,
  ],
  controllers: [HappController],
  providers: [HappService, ConfigService],
})
export class HappModule {}
