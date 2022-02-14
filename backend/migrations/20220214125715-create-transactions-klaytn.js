'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions_klaytns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      to: {
        type: Sequelize.STRING
      },
      blockHash: {
        type: Sequelize.STRING
      },
      blockNumber: {
        type: Sequelize.STRING
      },
      contractAddress: {
        type: Sequelize.STRING
      },
      from: {
        type: Sequelize.STRING
      },
      gas: {
        type: Sequelize.STRING
      },
      gasPrice: {
        type: Sequelize.STRING
      },
      gasUsed: {
        type: Sequelize.STRING
      },
      hash: {
        type: Sequelize.STRING
      },
      input: {
        type: Sequelize.TEXT
      },
      logs: {
        type: Sequelize.TEXT
      },
      logsBloom: {
        type: Sequelize.TEXT
      },
      nonce: {
        type: Sequelize.STRING
      },
      senderTxHash: {
        type: Sequelize.STRING
      },
      signatures: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      transactionHash: {
        type: Sequelize.STRING
      },
      transactionIndex: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      typeInt: {
        type: Sequelize.INTEGER
      },
      value: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions_klaytns');
  }
};