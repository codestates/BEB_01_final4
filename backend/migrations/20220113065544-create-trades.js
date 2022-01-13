'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Trades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      token_ids: {
        type: Sequelize.INTEGER
      },
      collectionAddress: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      trade_ca: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      seller: {
        type: Sequelize.STRING
      },
      buyer: {
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
    await queryInterface.dropTable('Trades');
  }
};