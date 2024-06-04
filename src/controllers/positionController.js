const sequelize = require("sequelize");
const { join } = require("path");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
const bcrypt = require("bcrypt");
const { createToken } = require("../helpers/jsonwebtoken");
const fs = require("fs");

module.exports = {
  fetchAllPositions: async (req, res, next) => {
    try {
      const positions = await model.positions.findAll({
        attributes: [
          ["id", "value"],
          ["name", "label"],
        ],
      });
      return res.status(200).send({
        success: true,
        message: "Fetched all positions successfully.",
        data: positions,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  fetchPositions: async (req, res, next) => {
    try {
      let { page, size, sortby, order } = req.query;
      if (!page) {
        page = 0;
      }
      if (!size) {
        size = 8;
      }
      if (!sortby) {
        sortby = "name";
      }
      if (!order) {
        order = "ASC";
      }
      const fetchData = await model.positions.findAndCountAll({
        offset: parseInt(page * size),
        limit: parseInt(size),
      });
      return res.status(200).send({
        data: fetchData.rows,
        totalPages: Math.ceil(fetchData.count / size),
        datanum: fetchData.count,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  createPosition: async (req, res, next) => {
    const ormTransaction = await model.sequelize.transaction();
    try {
      const { name } = req.body;

      // Check if required fields are missing
      if (!name || !created_by || !updated_by) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Please provide all required fields.",
        });
      }

      const checkExistingPosition = await model.positions.findOne({
        where: { name: name },
      });

      if (checkExistingPosition) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Position already exists.",
        });
      } else {
        const createPosition = await model.positions.create(
          {
            uuid: uuidv4(),
            name: name,
          },
          { transaction: ormTransaction }
        );
        await ormTransaction.commit();
        return res.status(200).send({
          success: true,
          message: "Position created.",
          data: createPosition,
        });
      }
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },
  editPostion: async (req, res, next) => {
    const ormTransaction = await model.sequelize.transaction();
    try {
      const { name, uuid } = req.body;

      // Check if UUID is provided
      if (!uuid) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "UUID is required.",
        });
      }

      // Check if required fields are missing
      if (!name) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Please provide the fields to update.",
        });
      }

      const position = await model.positions.findOne({
        where: { uuid: uuid },
      });

      if (!position) {
        await ormTransaction.rollback();
        return res.status(404).send({
          success: false,
          message: "Position not found",
        });
      }

      const updatedPosition = {
        name: name || position.name,
      };

      await position.update(updatedPosition, {
        transaction: ormTransaction,
      });

      await ormTransaction.commit();
      return res.status(200).send({
        success: true,
        message: "Position updated successfully",
        data: position,
      });
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },
  deletePosition: async (req, res, next) => {
    try {
      const getPosition = await model.positions.findOne({
        where: {
          uuid: req.params.uuid,
        },
      });
      await getPosition.destroy({
        where: { uuid: getPosition.dataValues.uuid },
      });
      return res.status(200).send({
        success: true,
        message: "Position deleted",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
