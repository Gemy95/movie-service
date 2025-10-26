import { AppModule } from '@App/app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  const port = Number(configService.get('app.port') ?? process.env.SERVER_PORT);

  app.enableCors();
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('/api');

  await app.listen(port, () => {
    Logger.log(`🚀 Server is running on http://localhost:${port}`);
  });
}
bootstrap();
