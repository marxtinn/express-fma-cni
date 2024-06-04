const sequelize = require("sequelize");
const { join } = require("path");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
const { createToken } = require("../helpers/jsonwebtoken");
const fs = require("fs");
const { log } = require("console");

module.exports = {
  // Fetch Building locations
  fetchLocations: async (req, res, next) => {
    try {
      let { page, size, sortby, order } = req.query;
      if (!page) {
        page = 0;
      }
      if (!size) {
        size = 5;
      }
      if (!sortby) {
        sortby = "name";
      }
      if (!order) {
        order = "ASC";
      }

      const fetchData = await model.locations.findAndCountAll({
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
  fetchLocationOptions: async (req, res, next) => {
    try {
      const locations = await model.locations.findAll({
        attributes: [
          ["id", "value"],
          ["name", "label"],
        ],
      });
      return res.status(200).send({
        success: true,
        message: "Fetched all locations successfully.",
        data: locations,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
