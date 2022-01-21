'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GGanbu_wallets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  GGanbu_wallets.init({
    type: DataTypes.STRING,
    gganbuAddress: DataTypes.STRING,
    nft_collectionAddress: DataTypes.STRING,
    nft_token_ids: DataTypes.INTEGER,
    balance: DataTypes.FLOAT,
    isActive: DataTypes.BOOLEAN,
    description: DataTypes.TEXT,
    rewards: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'GGanbu_wallets',
  });
  return GGanbu_wallets;
};