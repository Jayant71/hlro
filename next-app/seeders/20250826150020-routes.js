'use strict';
/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Routes', [
      {
        id: '55555555-5555-5555-5555-555555555555',
        userId: '11111111-1111-1111-1111-111111111111',
        depotId: '33333333-3333-3333-3333-333333333333',
        route_date: new Date('2025-08-27'),
        optimized_geometry: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        userId: '22222222-2222-2222-2222-222222222222',
        depotId: '44444444-4444-4444-4444-444444444444',
        route_date: new Date('2025-08-28'),
        optimized_geometry: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Routes', null, {});
  }
};