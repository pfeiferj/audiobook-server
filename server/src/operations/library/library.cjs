const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const ffmpeg = import('../../utils/ffmpeg.js');
const path = require('path');
const get = require('lodash/get.js');

function getSafeBookPath(filename) {
  const bookPath = path.join('books', filename)
  if (!bookPath.startsWith('books' + path.sep)) {
    throw new Error('Book path not in books directory');
  }
  return bookPath;
}

async function getBooks() {
  const { getMetadata } = await ffmpeg;

  const bookFiles = (await readdir('books')).filter(path => path !== '.gitignore');
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

module.exports = {
  getLibrary: async (req, res) => {
    res.send(await getBooks());
  }
}
