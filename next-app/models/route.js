'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Route extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Route.belongsTo(models.User, { foreignKey: 'userId' });
    Route.belongsTo(models.Depot, { foreignKey: 'depotId' });
    Route.hasMany(models.Stop, { foreignKey: 'routeId' });
    }
  }
  Route.init({
    route_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Route',
  });
  return Route;
};