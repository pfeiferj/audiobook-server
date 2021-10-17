import { Sequelize } from 'sequelize';
import Umzug from 'umzug';
import PositionInit from './position.js';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const db = {};

const sequelize = new Sequelize({ dialect: 'sqlite', storage: './db.sqlite' });

const umzug = new Umzug({
  migrations: {
    // indicates the folder containing the migration .js files
    path: path.join(__dirname, '..', '..', 'migrations'),
    pattern: new RegExp('.*\.cjs'),
    // inject sequelize's QueryInterface in the migrations
    params: [
      sequelize.getQueryInterface(),
      Sequelize
    ]
  },
  // indicates that the migration data should be store in the database
  // itself through sequelize. The default configuration creates a table
  // named `SequelizeMeta`.
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize
  }
})

await umzug.up();

db['Position'] = PositionInit(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('done');
