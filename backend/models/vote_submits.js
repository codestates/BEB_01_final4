'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vote_submits extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Vote_submits.init({
    suggestion_id: DataTypes.INTEGER,
    memberAddress: DataTypes.STRING,
    vote: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Vote_submits',
  });
  return Vote_submits;
};