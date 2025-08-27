'use strict';
/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'testuser@example.com',
        password_hash: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'admin@example.com',
        password_hash: 'hashedpassword2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};