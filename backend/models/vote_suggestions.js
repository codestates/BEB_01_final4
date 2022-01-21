'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vote_suggestions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Vote_suggestions.init({
    orgAddress: DataTypes.STRING,
    option: DataTypes.STRING,
    type: DataTypes.STRING,
    targetAddress: DataTypes.STRING,
    targetTokenId: DataTypes.STRING,
    totalAccept: DataTypes.INTEGER,
    totalReject: DataTypes.INTEGER,
    totalAcceptRatio: DataTypes.FLOAT,
    totalRejectRatio: DataTypes.FLOAT,
    suggestedAt: DataTypes.DATE,
    status: DataTypes.STRING,
    isValid: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Vote_suggestions',
  });
  return Vote_suggestions;
};