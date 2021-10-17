import express from 'express';
import fs from 'fs';
import util from 'util';
import { exec as nodeExec } from 'child_process';
import cors from 'cors';
import path from 'path';
import {db} from './models/index.js';
console.log('started')

const app = express()
const exec = util.promisify(nodeExec);

app.use(cors());
app.use(express.json())
app.use(express.urlencoded())
const port = 3001


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/position', async (req, res) => {
  const posResults = await db.Position.findAll({where:{book:req.query.book}, order:[['updatedAt', 'DESC']]});
  res.send(posResults)
});

app.post('/position', async (req, res) => {
  const position = {
    book: req.body.book,
    position: req.body.position,
  }

  const finalPosition = req.body.updates
    ? await db.Position.update(position,{where:{ id: req.body.updates }})
    : await db.Position.create(position);

  res.send(finalPosition);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

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

app.use('/', express.static('../client/build'));

function getBookPath(filename) {
  const bookPath = path.join('assets', filename)
  if(!bookPath.startsWith('assets' + path.sep)){
    throw new Error('Book path not in assets directory');
  }
  return bookPath;
}

async function getMetadata(path) {
  const {stdout} = await exec(`ffprobe -i "${path}" -print_format json -show_chapters -show_format -loglevel error`)
  const metadata = JSON.parse(stdout);
  return metadata;
}

async function getCoverArt(path) {
  const {stdout} = await exec(`ffmpeg -i "${path}" -an -f singlejpeg -hide_banner -loglevel error -`, { encoding: "binary" })
  const file = Buffer.from(stdout, "binary")
  return file;
}
