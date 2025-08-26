'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stop extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       Stop.belongsTo(models.Route, { foreignKey: 'routeId' });
    }
  }
  Stop.init({
    address: DataTypes.TEXT,
    sequence_order: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Stop',
  });
  return Stop;
};