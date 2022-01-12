'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NFTs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  NFTs.init({
    is_minted: DataTypes.BOOLEAN,
    token_ids: DataTypes.INTEGER,
    ownerAddress: DataTypes.STRING,
    creatorAddress: DataTypes.STRING,
    tokenURI: DataTypes.STRING,
    contractAddress: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    traits: DataTypes.TEXT,
    imageURI: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'NFTs',
  });
  return NFTs;
};