'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Collections.init({
    is_created: DataTypes.BOOLEAN,
    contractAddress: DataTypes.STRING,
    ownerAddress: DataTypes.STRING,
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    description: DataTypes.STRING,
    image_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Collections',
  });
  return Collections;
};