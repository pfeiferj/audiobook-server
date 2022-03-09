const path = require('path');
const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const get = require('lodash/get.js');
const ffmpeg = import('../../utils/ffmpeg.js');

const DEFAULT_FILE_RANGE_SIZE = 1024 * 1024; // 1 MB


function getSafeBookPath(filename) {
  const bookPath = path.join('books', filename)
  if (!bookPath.startsWith('books' + path.sep)) {
    throw new Error('Book path not in books directory');
  }
  return bookPath;
}

module.exports = {
  getBook: async function(req, res) {
    const { getAudioCodec } = await ffmpeg;
    // heavily based on https://betterprogramming.pub/video-stream-with-node-js-and-html5-320b3191a6b6
    const book = get(req, "query.filename", "");
    const safeBookPath = getSafeBookPath(book);
    const fileStat = await stat(safeBookPath)
    const fileSize = fileStat.size
    const range = get(req, "headers.range", "bytes=0-")

    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : Math.min(start + DEFAULT_FILE_RANGE_SIZE, fileSize - 1)
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(safeBookPath, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': `audio/${await getAudioCodec(safeBookPath)}`,
    }
    res.writeHead(206, head);
    file.pipe(res);
  },
  getBookDownload: async function(req, res) {
    const { getAudioCodec } = await ffmpeg;
    const book = get(req, "query.filename", "");
    const safeBookPath = getSafeBookPath(book);
    const file = fs.createReadStream(safeBookPath)
    const head = {
      'Content-Type': `audio/${await getAudioCodec(safeBookPath)}`,
    }
    res.writeHead(200, head);
    file.pipe(res);
  }
}
