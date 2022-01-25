'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DAO_wallets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      daoAddress: {
        type: Sequelize.STRING
      },
      balance: {
        type: Sequelize.FLOAT
      },
      isActive: {
        type: Sequelize.BOOLEAN
      },
      description: {
        type: Sequelize.TEXT
      },
      rewards: {
        type: Sequelize.FLOAT
      },
      status: {
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
    await queryInterface.dropTable('DAO_wallets');
  }
};