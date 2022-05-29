import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Position } from './models/position.model';

@Module({
  imports: [SequelizeModule.forFeature([Position])],
  controllers: [BooksController],
  providers: [BooksService, FfmpegService],
})
export class BooksModule {}
