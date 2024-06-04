"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init(
    {
      uuid: DataTypes.STRING,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      photo_url: DataTypes.STRING,
      join_date: DataTypes.DATEONLY,
      position_id: DataTypes.INTEGER,
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      is_blocked: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "users",
    }
  );
  users.associate = (models) => {
    users.belongsTo(models.positions, { foreignKey: "position_id" });
  };
  return users;
};
