'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Transactions.init({
    input_name: DataTypes.STRING,
    input_params_name: DataTypes.STRING,
    input_params_value: DataTypes.STRING,
    hash: DataTypes.STRING,
    nonce: DataTypes.INTEGER,
    blockHash: DataTypes.STRING,
    blockNumber: DataTypes.INTEGER,
    transactionIndex: DataTypes.INTEGER,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    value: DataTypes.STRING,
    gas: DataTypes.INTEGER,
    gasPrice: DataTypes.STRING,
    input: DataTypes.TEXT,
    v: DataTypes.STRING,
    r: DataTypes.STRING,
    s: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};