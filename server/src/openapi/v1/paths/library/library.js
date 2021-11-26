import yaml from 'js-yaml';
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const library = yaml.load(fs.readFileSync(join(__dirname, 'library.yml'), 'utf8'))

export default {
  ...library,
}
