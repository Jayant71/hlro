'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Depot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Depot.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      
    }
  }
  Depot.init({
    name: DataTypes.STRING,
    address: DataTypes.TEXT,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Depot',
  });
  return Depot;
};