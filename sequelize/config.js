require('dotenv');

module.exports = {
  dialect: 'sqlite',
  storage: process.env.SQLITE_FILE || './db.sqlite',
};
