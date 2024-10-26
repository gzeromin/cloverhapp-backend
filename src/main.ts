import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { BadRequestFilter } from './filters/exception.filter';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalFilters(new BadRequestFilter());
  app.use(cookieParser());

  const port = process.env.SERVER_PORT;

  // frontend와의 원활한 소통을 위한 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use('/api', express.static('api'));

  // Swagger API 설정
  const config = new DocumentBuilder()
    .setTitle('Happtamp API')
    .setDescription('Document for Happtamp Backend Apis')
    .setVersion('0.0')
    .addTag('')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
bootstrap();
