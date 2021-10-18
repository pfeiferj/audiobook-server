import express from 'express';
import fs from 'fs';
import util from 'util';
import { exec as nodeExec } from 'child_process';
import cors from 'cors';
import path from 'path';
import {db} from './models/index.js';
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
  const posResults = await db.Position.findAll({where:{book:req.query.filename}, order:[['updatedAt', 'DESC']]});
  res.send(posResults)
});

app.post('/book/position', async (req, res) => {
  const position = {
    book: req.body.filename,
    position: req.body.position,
  }

  const finalPosition = req.body.updates
    ? await db.Position.update(position,{where:{ id: req.body.updates }})
    : await db.Position.create(position);

  res.send(finalPosition);
});

app.get('/book', function(req, res) {
  // heavily based on https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6
  const book = req.query.filename;
  const bookPath = getBookPath(book);
  const stat = fs.statSync(bookPath)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(bookPath, {start, end})
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
  const book = req.query.filename;
  const bookPath = getBookPath(book);
  const metadata = await getMetadata(bookPath);
  res.send(metadata);
});

app.get('/book/cover', async (req, res) => {
  const book = req.query.filename;
  const bookPath = getBookPath(book);
  const cover = await getCoverArt(bookPath);
  res.send(cover);
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
  for(const bookPath of bookFiles) {
    const bookMetadata = await getMetadata(getBookPath(bookPath));
    const title = get(bookMetadata, "format.tags.title", bookPath);
    books.push({
      title,
      path: bookPath,
      metadata: bookMetadata
    });
  }
  return books;
}

function getBookPath(filename) {
  const bookPath = path.join('books', filename)
  if(!bookPath.startsWith('books' + path.sep)){
    throw new Error('Book path not in books directory');
  }
  return bookPath;
}

async function getMetadata(path) {
  const {stdout} = await exec(`ffprobe -i "${path}" -print_format json -show_chapters -show_format -loglevel quiet`)
  const metadata = JSON.parse(stdout);
  return metadata;
}

async function getCoverArt(path) {
  const {stdout} = await exec(`ffmpeg -i "${path}" -an -f singlejpeg -hide_banner -loglevel quiet -`, { encoding: "binary" })
  const file = Buffer.from(stdout, "binary")
  return file;
}
