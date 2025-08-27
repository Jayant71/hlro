'use strict';
/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Depots', [
      {
        id: '33333333-3333-3333-3333-333333333333',
        userId: '11111111-1111-1111-1111-111111111111',
        name: 'Central Depot',
        address: '123 Main St, City',
        location: { type: 'Point', coordinates: [77.5946, 12.9716], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        userId: '22222222-2222-2222-2222-222222222222',
        name: 'North Depot',
        address: '456 North Ave, City',
        location: { type: 'Point', coordinates: [77.6000, 12.9800], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Depots', null, {});
  }
};