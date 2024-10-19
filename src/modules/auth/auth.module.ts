import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Notif } from '@/entities/notif.entity';
import { Stamp } from '@/entities/stamp.entity';
import { Friend } from '@/entities/friend.entity';
import { UserStamp } from '@/entities/user-stamp.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from '@/middlewares/multerS3.middleware';
import { Happ } from '@/entities/happ.entity';
import { UserStampService } from '../user-stamp/user-stamp.service';
import { Tag } from '@/entities/tag.entity';
import { TagService } from '../tag/tag.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET_KEY,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      }),
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return multerOptionsFactory(configService, 'user');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Happ,
      Notif,
      Stamp,
      UserStamp,
      Friend,
      Tag,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ConfigService,
    UserStampService,
    TagService,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
