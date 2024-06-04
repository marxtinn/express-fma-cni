"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class checkpoints extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  checkpoints.init(
    {
      uuid: DataTypes.STRING,
      name: DataTypes.STRING,
      longitude: DataTypes.FLOAT,
      latitude: DataTypes.FLOAT,
      radius: DataTypes.FLOAT,
      is_active: DataTypes.BOOLEAN,
      location_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "checkpoints",
    }
  );
  checkpoints.associate = (models) => {
    checkpoints.belongsTo(models.locations, { foreignKey: "location_id" });
  };
  return checkpoints;
};
