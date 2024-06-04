const sequelize = require("sequelize");
const { join } = require("path");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
const { createToken } = require("../helpers/jsonwebtoken");
const fs = require("fs");

module.exports = {
  fetchCheckpoints: async (req, res, next) => {
    try {
      let { page, size, sortby, order } = req.query;
      if (!page) {
        page = 0;
      }
      if (!size) {
        size = 4;
      }
      if (!sortby) {
        sortby = "name";
      }
      if (!order) {
        order = "ASC";
      }

      const fetchData = await model.checkpoints.findAndCountAll({
        offset: parseInt(page * size),
        limit: parseInt(size),
        include: [
          {
            model: model.locations,
            attributes: ["name"],
          },
        ],
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
  createCheckpoint: async (req, res, next) => {
    const ormTransaction = await model.sequelize.transaction();
    try {
      const { name, location_id } = req.body;

      // Check if required fields are missing
      if (!name || !location_id) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Please provide all required fields.",
        });
      }

      const checkExistingCheckpoint = await model.checkpoints.findOne({
        where: { name: name },
      });

      if (checkExistingCheckpoint) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Checkpoint with that name already exists.",
        });
      } else {
        const createCheckpoint = await model.checkpoints.create(
          {
            uuid: uuidv4(),
            name: name,
            location_id: location_id,
            is_active: 1,
          },
          {
            transaction: ormTransaction,
          }
        );
        await ormTransaction.commit();
        return res.status(200).send({
          success: true,
          message: "Checkpoint created.",
          data: createCheckpoint,
        });
      }
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },
  editCheckpoint: async (req, res, next) => {
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

      const checkpoint = await model.checkpoints.findOne({
        where: { uuid: uuid },
      });

      if (!checkpoint) {
        await ormTransaction.rollback();
        return res.status(404).send({
          success: false,
          message: "Checkpoint not found",
        });
      }

      const updatedCheckpoint = {
        name: name || checkpoint.name,
      };

      await checkpoint.update(updatedCheckpoint, {
        transaction: ormTransaction,
      });
      return res.status(200).send({
        success: true,
        message: "Checkpoint uopdated succesfully.",
        data: checkpoint,
      });
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },
  deleteCheckpoint: async (req, res, next) => {
    try {
      const getCheckpoint = await model.checkpoints.findOne({
        where: {
          uuid: req.params.uuid,
        },
      });
      await getCheckpoint.destroy({
        where: { uuid: getCheckpoint.dataValues.uuid },
      });
      return res.status(200).send({
        success: true,
        message: "Checkpoint deleted",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
