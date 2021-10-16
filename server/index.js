const express = require('express')
const fs = require('fs')
const app = express()
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cors = require('cors');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded())
const port = 3001

const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'myProject';
const path = require('path');

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const positions = db.collection('positions');

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.get('/position', async (req, res) => {
    const posResults = await positions.find({book:req.query.book}).sort('timestamp',-1).toArray();
    res.send(posResults)
  });

  app.post('/position', async (req, res) => {
    const position = {
      book: req.body.book,
      position: req.body.position,
      timestamp: new Date().getTime()
    }

    req.body.updates
      ? await positions.updateOne({ book: position.book, timestamp: position.updates }, { $set: position })
      : await positions.insertOne(position);

    /*
     * {
     *   position: seconds or ms?
     *   book: path?
     *   updates: timestamp
     * }
     */
    res.send(position);
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

  return 'done.';
}

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

main()
  .then(console.log)
  .catch(console.error)
