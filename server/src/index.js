import express from 'express';
import fs from 'fs';
import util from 'util';
import { exec as nodeExec } from 'child_process';
import cors from 'cors';
import path from 'path';
import { db } from './models/index.js';
import get from 'lodash/get.js';

const app = express()
const exec = util.promisify(nodeExec);

app.use(cors());
app.use(express.json())
app.use(express.urlencoded())
const port = 3001


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/book/position', async (req, res) => {
  const { updatedAt } = db.Position.attributeNames;
  const bookFilename = get(req, "query.filename", "");
  const posResults = await db.Position.findAll({ where: { book: bookFilename }, order: [[updatedAt, 'DESC']] });
  res.send(posResults)
});

app.post('/book/position', async (req, res) => {
  const { book, position, id } = db.Position.attributeNames;
  const bookFilename = get(req, "body.filename", "")

  const bookPosition = get(req, "body.position", 0)
  const updatePositionId = get(req, "body.updates", 0)

  const position = {
    [book]: bookFilename,
    [position]: bookPosition,
  }

  const finalPosition = updatePositionId
    ? await db.Position.update(position, { where: { [id]: updatePositionId } })
    : await db.Position.create(position);

  res.send(finalPosition);
});

app.get('/book', function(req, res) {
  // heavily based on https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6
  const book = req.query.filename;
  const bookPath = getSafeBookPath(book);
  const stat = fs.statSync(bookPath)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize - 1
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(bookPath, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/m4a',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/m4a',
    }
    res.writeHead(200, head)
    fs.createReadStream(bookPath).pipe(res)
  }
});

app.get('/book/metadata', async (req, res) => {
  const book = get(req, "query.filename", "");
  const safeBookPath = getSafeBookPath(book);
  const metadata = await getMetadata(safeBookPath);
  res.send(metadata);
});

app.get('/book/cover', async (req, res) => {
  const book = get(req, "query.filename", "");
  const safeBookPath = getSafeBookPath(book);
  try {
    const cover = await getCoverArt(safeBookPath);
    res.send(cover);
  } catch (e) {
    res.send();
  }
});

app.get('/books', async (req, res) => {
  res.send(await getBooks());
});

app.use('/', express.static('../client/build'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

async function getBooks() {
  const bookFiles = fs.readdirSync('books').filter(path => path !== '.gitignore');
  const books = [];
  for (const bookPath of bookFiles) {
    const bookMetadata = await getMetadata(getSafeBookPath(bookPath));
    const title = get(bookMetadata, "format.tags.title", bookPath);
    books.push({
      title,
      path: bookPath,
      metadata: bookMetadata
    });
  }
  return books;
}

function getSafeBookPath(filename) {
  const bookPath = path.join('books', filename)
  if (!bookPath.startsWith('books' + path.sep)) {
    throw new Error('Book path not in books directory');
  }
  return bookPath;
}

async function getMetadata(path) {
  const { stdout } = await exec(`ffprobe -i "${path}" -print_format json -show_chapters -show_format -loglevel quiet`)
  const metadata = JSON.parse(stdout);
  return metadata;
}

async function getCoverArt(path) {
  const { stdout } = await exec(`ffmpeg -i "${path}" -an -f singlejpeg -hide_banner -loglevel quiet -`, { encoding: "binary" })
  const file = Buffer.from(stdout, "binary")
  return file;
}
