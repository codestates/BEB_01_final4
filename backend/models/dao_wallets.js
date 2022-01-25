'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DAO_wallets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  DAO_wallets.init({
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    daoAddress: DataTypes.STRING,
    balance: DataTypes.FLOAT,
    isActive: DataTypes.BOOLEAN,
    description: DataTypes.TEXT,
    rewards: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DAO_wallets',
  });
  return DAO_wallets;
};