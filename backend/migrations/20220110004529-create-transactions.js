'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      input_name: {
        type: Sequelize.STRING
      },
      input_params_name: {
        type: Sequelize.STRING
      },
      input_params_value: {
        type: Sequelize.STRING
      },
      hash: {
        type: Sequelize.STRING
      },
      nonce: {
        type: Sequelize.INTEGER
      },
      blockHash: {
        type: Sequelize.STRING
      },
      blockNumber: {
        type: Sequelize.INTEGER
      },
      transactionIndex: {
        type: Sequelize.INTEGER
      },
      from: {
        type: Sequelize.STRING
      },
      to: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.STRING
      },
      gas: {
        type: Sequelize.INTEGER
      },
      gasPrice: {
        type: Sequelize.STRING
      },
      input: {
        type: Sequelize.TEXT
      },
      v: {
        type: Sequelize.STRING
      },
      r: {
        type: Sequelize.STRING
      },
      s: {
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
    await queryInterface.dropTable('Transactions');
  }
};