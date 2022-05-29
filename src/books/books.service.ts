import { Injectable, StreamableFile } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { join, sep } from 'path';
import { createReadStream, readdir, unlink } from 'fs';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
import { promisify } from 'util';
import { Express, Request } from 'express';
import { Position } from './models/position.model';

import * as fs from 'fs';
import {
  Range,
  ContentDoesNotExistError,
  ContentProvider,
  createPartialContentHandler,
} from 'express-partial-content';
import { InjectModel } from '@nestjs/sequelize';

const statAsync = promisify(fs.stat);
const existsAsync = promisify(fs.exists);

export const fileContentProvider: ContentProvider = async (req: Request) => {
  // Read file name from route params.
  const fileName = req.params?.filename ?? '';
  const file = getSafeBookPath(fileName);
  if (!(await existsAsync(file)) || !fileName.length) {
    throw new ContentDoesNotExistError(`File doesn't exist: ${file}`);
  }
  const stats = await statAsync(file);
  const totalSize = stats.size;
  const mimeType = 'application/octet-stream';
  const getStream = (range?: Range) => {
    if (!range) {
      // Request if for complete content.
      return fs.createReadStream(file);
    }
    // Partial content request.
    const { start, end } = range;
    return fs.createReadStream(file, { start, end });
  };
  return {
    fileName,
    totalSize,
    mimeType,
    getStream,
  };
};

const readdirPromise = promisify(readdir);
const unlinkPromise = promisify(unlink);

const BOOKS_DIR = join(process.cwd(), 'books');
const NO_COVER = join(process.cwd(), 'src', 'noCover.png');

function getSafeBookPath(filename: string) {
  const bookPath = join(process.cwd(), 'books', filename);
  if (!bookPath.startsWith(process.cwd() + sep + 'books' + sep)) {
    throw new Error('Book path not in books directory');
  }
  return bookPath;
}

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Position)
    private readonly positionModel: typeof Position,
    private readonly ffmpegService: FfmpegService,
  ) {}

  create(createBookDto, file: Express.Multer.File) {
    return 'This action adds a new book';
  }

  async findAll() {
    const books = await readdirPromise(BOOKS_DIR);
    return books;
  }

  findOne(filename: string): StreamableFile {
    const safePath = getSafeBookPath(filename);
    const file = createReadStream(safePath);
    return new StreamableFile(file);
  }

  partialFileProvider = createPartialContentHandler(
    fileContentProvider,
    console,
  );

  update(filename: string, updateBookDto: UpdateBookDto) {
    return `This action updates a #${filename} book`;
  }

  async remove(filename: string) {
    await unlinkPromise(filename);
    return `${filename} was deleted.`;
  }

  async chapters(filename: string): Promise<string> {
    const { getMetadata } = this.ffmpegService;

    const safeBookPath = getSafeBookPath(filename);
    const metadata = await getMetadata(safeBookPath);

    if (metadata.chapters) {
      let vtt = 'WEBVTT';
      for (const chapter of metadata.chapters) {
        vtt += `\n\n${chapter.start_time} --> ${chapter.end_time}`;
        vtt += `\n${chapter.tags.title}`;
      }
      return vtt;
    }

    return '';
  }

  async metadata(filename: string) {
    const { getMetadata } = this.ffmpegService;
    const safeBookPath = getSafeBookPath(filename);
    const metadata = await getMetadata(safeBookPath);
    return metadata;
  }

  //update positions
  async updatePositions(filename: string, positions: any[]) {
    const savedPositions = await this.positionModel.findAll({
      where: { book: filename },
    });
    for (const position of positions) {
      const savedPosition = savedPositions.find(
        (savedPosition) => savedPosition.id === position.id,
      );
      if (
        savedPosition &&
        savedPosition.createdAt.getTime() ==
          new Date(position?.createdAt).getTime()
      ) {
        await savedPosition.update({
          position: position,
        });
      } else {
        await this.positionModel.create({
          position: position.position,
          book: filename,
          timestamp: position.timestamp,
        });
      }
    }
    // TODO: do not do two extra queries
    const updatedPositions = await this.positionModel.findAll({
      where: { book: filename },
    });

    if (updatedPositions.length > 30) {
      for (const position of updatedPositions) {
        if (position.createdAt < Date.now() - 24 * 60 * 60 * 1000) {
          await position.destroy();
        }
      }
    }

    const finalPositions = await this.positionModel.findAll({
      where: { book: filename },
    });
    return finalPositions;
  }

  async cover(filename: string) {
    const { getCoverArt } = this.ffmpegService;

    const safeBookPath = getSafeBookPath(filename);
    try {
      const cover = await getCoverArt(safeBookPath);
      return new StreamableFile(cover);
    } catch (e) {
      const file = createReadStream(NO_COVER);
      return new StreamableFile(file);
    }
  }
}
