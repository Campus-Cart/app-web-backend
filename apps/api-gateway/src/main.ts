/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle(process.env.APP_NAME)
    .setDescription(process.env.APP_DESCRIPTION)
    .setVersion(process.env.APP_VERSION)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
  });

  try {
    SwaggerModule.setup('v1/docs', app, document, {
      swaggerOptions: {
        baseUrl: '/v1',
      },
    });
  } catch (err) {
    this.logger.error(err);
  }

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(
    process.env.APP_SERVER_LISTEN_PORT
  );
  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);
}
bootstrap();
