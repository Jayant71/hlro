'use strict';
/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Stops', [
      {
        id: '77777777-7777-7777-7777-777777777777',
        routeId: '55555555-5555-5555-5555-555555555555',
        address: '789 South St, City',
        location: { type: 'Point', coordinates: [77.5950, 12.9720], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        sequence_order: 1,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        routeId: '55555555-5555-5555-5555-555555555555',
        address: '1010 East St, City',
        location: { type: 'Point', coordinates: [77.5960, 12.9730], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        sequence_order: 2,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Stops', null, {});
  }
};