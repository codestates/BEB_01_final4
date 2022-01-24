'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GGanbu_members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      memberAddress: {
        type: Sequelize.STRING
      },
      gganbuAddress: {
        type: Sequelize.STRING
      },
      staking_value: {
        type: Sequelize.FLOAT
      },
      staking_ratio: {
        type: Sequelize.FLOAT
      },
      my_rewards: {
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
    await queryInterface.dropTable('GGanbu_members');
  }
};