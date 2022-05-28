'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      name: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      isAdmin: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      isActive: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      password: {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
