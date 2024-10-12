import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeORMConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST') || process.env.DB_HOST,
    port: configService.get<number>('DB_PORT') || Number(process.env.DB_PORT),
    username:
      configService.get<string>('DB_USERNAME') || process.env.DB_USERNAME,
    password:
      configService.get<string>('DB_PASSWORD') || process.env.DB_PASSWORD,
    database:
      configService.get<string>('DB_DATABASE') || process.env.DB_DATABASE,
    synchronize:
      configService.get<boolean>('DB_SYNC') || Boolean(process.env.DB_SYNC), // Set to false in production
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    logging: true,
    keepConnectionAlive: true, // for hotloading
  };
};
