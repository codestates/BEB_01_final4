'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trades extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Trades.init({
    token_ids: DataTypes.INTEGER,
    collectionAddress: DataTypes.STRING,
    status: DataTypes.STRING,
    trade_ca: DataTypes.STRING,
    price: DataTypes.FLOAT,
    seller: DataTypes.STRING,
    buyer: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Trades',
  });
  return Trades;
};