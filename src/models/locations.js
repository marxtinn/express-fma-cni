"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class locations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  locations.init(
    {
      uuid: DataTypes.STRING,
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      province: DataTypes.STRING,
      country: DataTypes.STRING,
      postal_code: DataTypes.STRING,
      longitude: DataTypes.FLOAT,
      latitude: DataTypes.FLOAT,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "locations",
    }
  );
  locations.associate = (models) => {
    locations.hasMany(models.checkpoints, { foreignKey: "location_id" });
  };
  return locations;
};
