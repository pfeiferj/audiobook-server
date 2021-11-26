const path = require('path');
const get = require('lodash/get.js');
const ffmpeg = import('../../utils/ffmpeg.js');

function getSafeBookPath(filename) {
  const bookPath = path.join('books', filename)
  if (!bookPath.startsWith('books' + path.sep)) {
    throw new Error('Book path not in books directory');
  }
  return bookPath;
}

module.exports = {
  getBookMetadata: async (req, res) => {
    const { getMetadata } = await ffmpeg;

    const book = get(req, "query.filename", "");
    const safeBookPath = getSafeBookPath(book);
    const metadata = await getMetadata(safeBookPath);
    res.send(metadata);
  },
}
