'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Rents.init({
    token_ids: DataTypes.INTEGER,
    collectionAddress: DataTypes.STRING,
    status: DataTypes.STRING,
    price: DataTypes.FLOAT,
    owner: DataTypes.STRING,
    renter: DataTypes.STRING,
    rent_period: DataTypes.INTEGER,
    lendHash: DataTypes.STRING,
    rentHash: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Rents',
  });
  return Rents;
};