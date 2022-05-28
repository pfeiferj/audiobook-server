import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService, FfmpegService],
})
export class BooksModule {}
