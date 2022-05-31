import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SetupModule } from './setup/setup.module';
import { FfmpegService } from './ffmpeg/ffmpeg.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as Joi from 'joi';
import { ObjectionModule } from '@willsoto/nestjs-objection';

export interface Config {
  NODE_ENV: string;
  PORT: number;
  BCRYPT_ROUNDS: number;
  THROTTLER_TTL: number;
  THROTTLER_LIMIT: number;
  SQLITE_FILE: string;
}

const joiValidation = Joi.object<Config>({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(8080),
  BCRYPT_ROUNDS: Joi.number().default(11),
  THROTTLER_TTL: Joi.number().default(60),
  THROTTLER_LIMIT: Joi.number().default(30),
  SQLITE_FILE: Joi.string().default('./db.sqlite'),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: joiValidation,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/v1/*'],
    }),
    ObjectionModule.register({
      config: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
          filename: './example.sqlite',
        },
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: async (configService: ConfigService<Config>) => ({
        ttl: configService.get('THROTTLER_TTL'),
        limit: configService.get('THROTTLER_LIMIT'),
      }),
      inject: [ConfigService],
    }),
    BooksModule,
    UsersModule,
    AuthModule,
    HealthModule,
    SetupModule,
  ],
  controllers: [AppController],
  providers: [AppService, FfmpegService],
})
export class AppModule {}
