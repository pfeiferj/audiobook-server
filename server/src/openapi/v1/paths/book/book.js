import yaml from 'js-yaml';
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const book = yaml.load(fs.readFileSync(join(__dirname, 'book.yml'), 'utf8'))
const cover = yaml.load(fs.readFileSync(join(__dirname, 'cover.yml'), 'utf8'))
const metadata = yaml.load(fs.readFileSync(join(__dirname, 'metadata.yml'), 'utf8'))
const position = yaml.load(fs.readFileSync(join(__dirname, 'position.yml'), 'utf8'))

export default {
  ...book,
  ...cover,
  ...metadata,
  ...position,
}

