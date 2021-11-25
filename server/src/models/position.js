import Sequelize from 'sequelize';
const { Model } = Sequelize;

export default (sequelize, DataTypes) => {
  class Position extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static attributeNames = {
      id: 'id',
      updatedAt: 'updatedAt',
      createdAt: 'createdAt',
      book: 'book',
      position: 'position',
    }
  };
  Position.init({
    book: DataTypes.STRING,
    position: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Position',
  });
  return Position;
};
