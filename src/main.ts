import { VersioningType,ValidationPipe, ExecutionContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, Config } from './app.module';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(helmet());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Audiobook Server')
    .setDescription('A server for streaming audiobooks.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService: ConfigService<Config> = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
