import bookPaths from './book/book.js';
import libraryPaths from './library/library.js';

export default {
  ...bookPaths,
  ...libraryPaths,
}
