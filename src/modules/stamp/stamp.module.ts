import { Module } from '@nestjs/common';
import { StampController } from './stamp.controller';
import { StampService } from './stamp.service';
import { Stamp } from '@/entities/stamp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from '@/middlewares/multerS3.middleware';
import { Tag } from '@/entities/tag.entity';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return multerOptionsFactory(configService, 'stamp');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Stamp, Tag]),
    AuthModule,
  ],
  controllers: [StampController],
  providers: [StampService],
})
export class StampModule {}
