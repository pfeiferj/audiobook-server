const get = require('lodash/get.js');
const models = import('../../models/index.js');

module.exports = {
  updateBookPosition: async (req, res) => {
    const { db } = await models;
    const { book, position, id } = db.Position.attributeNames;
    const bookFilename = get(req, "body.filename", "")

    const bookPosition = get(req, "body.position", 0)
    const updatePositionId = get(req, "body.updates", 0)

    const positionData = {
      [book]: bookFilename,
      [position]: bookPosition,
    }

    let finalPosition = {};
    if (updatePositionId) {
      const updateId = await db.Position.update(positionData, { where: { [id]: updatePositionId } })
      finalPosition = await db.Position.findOne({ where: { [id]: updateId[0] } });
    } else {
      finalPosition = await db.Position.create(positionData);
    }

    res.send(JSON.stringify(finalPosition));
  },
  getBookPositions: async (req, res) => {
    const { db } = await models;
    const { updatedAt } = db.Position.attributeNames;
    const bookFilename = get(req, "query.filename", "");
    const posResults = await db.Position.findAll({ where: { book: bookFilename }, order: [[updatedAt, 'DESC']] });
    res.send(JSON.stringify(posResults))
  },
}
