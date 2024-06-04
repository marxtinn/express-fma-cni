"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class positions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  positions.init(
    {
      uuid: DataTypes.STRING,
      name: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "positions",
    }
  );
  positions.associate = (models) => {
    positions.hasMany(models.users, { foreignKey: "position_id" });
  };
  return positions;
};
