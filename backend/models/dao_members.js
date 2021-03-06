'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DAO_members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  DAO_members.init({
    memberAddress: DataTypes.STRING,
    daoAddress: DataTypes.STRING,
    staking_value: DataTypes.FLOAT,
    staking_ratio: DataTypes.FLOAT,
    my_rewards: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DAO_members',
  });
  return DAO_members;
};