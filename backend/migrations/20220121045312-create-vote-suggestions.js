'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Vote_suggestions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orgAddress: {
        type: Sequelize.STRING
      },
      option: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      targetAddress: {
        type: Sequelize.STRING
      },
      targetTokenId: {
        type: Sequelize.STRING
      },
      totalAccept: {
        type: Sequelize.INTEGER
      },
      totalReject: {
        type: Sequelize.INTEGER
      },
      totalAcceptRatio: {
        type: Sequelize.FLOAT
      },
      totalRejectRatio: {
        type: Sequelize.FLOAT
      },
      suggestedAt: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      isValid: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('Vote_suggestions');
  }
};