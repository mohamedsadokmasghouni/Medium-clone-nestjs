import { ValidationPipe } from '@nestjs/common';
import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new BackendValidationPipe())
  app.useGlobalPipes(new BackendValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
