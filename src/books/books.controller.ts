import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookDto } from './dto/create-book.dto';

@Controller({
  path: 'books',
  version: '1',
})
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.booksService.create(createBookDto, file);
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':filename')
  findOne(@Req() req: Request, @Res() res: Response) {
    this.booksService.partialFileProvider(req, res);
  }

  @Get(':filename/cover')
  getCover(@Param('filename') filename: string) {
    return this.booksService.cover(filename);
  }

  @Get(':filename/chapters.vtt')
  getChapters(@Param('filename') filename: string) {
    return this.booksService.chapters(filename);
  }

  @Patch(':filename')
  update(
    @Param('filename') filename: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(filename, updateBookDto);
  }

  @Delete(':filename')
  remove(@Param('filename') filename: string) {
    return this.booksService.remove(filename);
  }
}
