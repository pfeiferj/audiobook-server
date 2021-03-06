import { Injectable, StreamableFile, Inject } from '@nestjs/common';
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
    @Inject(Position)
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

  async updatePositions(filename: string, positions: any[]) {
    for (const position of positions) {
      if (position.id) {
        const dbPosition = await this.positionModel
          .query()
          .findById(position.id);
        if (dbPosition.timestamp < position.timestamp) {
          await this.positionModel
            .query()
            .patchAndFetchById(position.id, position);
        }
      } else {
        const newPosition = new Position();
        newPosition.client_id = position.client_id;
        newPosition.position = position.position;
        newPosition.book = filename;
        newPosition.timestamp = position.timestamp;
        await this.positionModel.query().insert(position);
      }
    }
    const updatedPositions = await this.positionModel.query().where({
      book: filename,
    });

    const finalPositions = [];
    if (updatedPositions.length > 30) {
      for (const position of updatedPositions) {
        if (position.created_at < Date.now() - 24 * 60 * 60 * 1000) {
          await this.positionModel.query().deleteById(position.id);
        } else {
          finalPositions.push(position);
        }
      }
    } else {
      finalPositions.push(...updatedPositions);
    }

    return finalPositions.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getPositions(filename: string) {
    const positions = await this.positionModel.query().where({
      book: filename,
    });
    return positions;
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
