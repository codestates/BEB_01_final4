'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions_klaytn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Transactions_klaytn.init({
    to: DataTypes.STRING,
    blockHash: DataTypes.STRING,
    blockNumber: DataTypes.STRING,
    contractAddress: DataTypes.STRING,
    from: DataTypes.STRING,
    gas: DataTypes.STRING,
    gasPrice: DataTypes.STRING,
    gasUsed: DataTypes.STRING,
    hash: DataTypes.STRING,
    input: DataTypes.TEXT,
    logs: DataTypes.TEXT,
    logsBloom: DataTypes.TEXT,
    nonce: DataTypes.STRING,
    senderTxHash: DataTypes.STRING,
    signatures: DataTypes.TEXT,
    status: DataTypes.STRING,
    transactionHash: DataTypes.STRING,
    transactionIndex: DataTypes.STRING,
    type: DataTypes.STRING,
    typeInt: DataTypes.INTEGER,
    value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transactions_klaytn',
  });
  return Transactions_klaytn;
};