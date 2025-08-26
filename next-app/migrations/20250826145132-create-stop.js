'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Stops', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      routeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Routes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      location: {
        type: Sequelize.GEOMETRY('POINT', 4326), // PostGIS Point data type
        allowNull: false,
      },
      sequence_order: {
        type: Sequelize.INTEGER,
        allowNull: true, // Can be null until optimized
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Stops');
  }
};