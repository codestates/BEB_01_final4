'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GGanbu_members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  GGanbu_members.init({
    memberAddress: DataTypes.STRING,
    gganbuAddress: DataTypes.STRING,
    staking_value: DataTypes.FLOAT,
    staking_ratio: DataTypes.FLOAT,
    my_rewards: DataTypes.FLOAT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'GGanbu_members',
  });
  return GGanbu_members;
};