import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { EventsModule } from './events/events.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { HappModule } from './modules/happ/happ.module';
import { StampModule } from './modules/stamp/stamp.module';
import { UserStampModule } from './modules/user-stamp/user-stamp.module';
import { NotifModule } from './modules/notif/notif.module';
import { CommentModule } from './modules/comment/comment.module';
import { FriendModule } from './modules/friend/friend.module';
import { TagModule } from './modules/tag/tag.module';
import { MemoModule } from './modules/memo/memo.module';
import { BookModule } from './modules/book/book.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./env/.env.${process.env.NODE_ENV || 'develop'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeORMConfig,
    }),
    HappModule,
    AuthModule,
    EventsModule,
    StampModule,
    UserStampModule,
    NotifModule,
    CommentModule,
    FriendModule,
    TagModule,
    MemoModule,
    BookModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
