const sequelize = require("sequelize");
const { join } = require("path");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
const { createToken } = require("../helpers/jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { generate } = require("../helpers/generateCaptcha");
let salt = bcrypt.genSaltSync(10);

module.exports = {
  // Generate new account
  userRegister: async (req, res, next) => {
    const ormTransaction = await model.sequelize.transaction();
    try {
      const { name, email, password, phone, join_date, position_id } = req.body;

      // Check if required fields are missing
      if (
        !name ||
        !email ||
        !password ||
        !phone ||
        !join_date ||
        !position_id
      ) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message:
            "Please provide all required fields: name, email, password, phone, join_date, position_id",
        });
      }

      const checkExistingUser = await model.users.findOne({
        where: { email: email },
      });

      if (checkExistingUser) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Account already exists.",
        });
      } else {
        let uniqueUuid;
        let isUnique = false;

        // Generate and check for unique UUID
        while (!isUnique) {
          uniqueUuid = uuidv4();
          const existingUserWithUuid = await model.users.findOne({
            where: { uuid: uniqueUuid },
          });
          if (!existingUserWithUuid) {
            isUnique = true;
          }
        }

        const register = await model.users.create(
          {
            uuid: uniqueUuid,
            name,
            email,
            password: bcrypt.hashSync(password, salt),
            phone,
            join_date,
            position_id,
          },
          {
            transaction: ormTransaction,
          }
        );
        await ormTransaction.commit();
        return res.status(200).send({
          success: true,
          message: "Account created.",
          data: register,
        });
      }
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },
  // Generate Captcha
  generateCaptchaCode: async (req, res, next) => {
    try {
      const captcha = generate();
      return res.status(200).send({
        success: true,
        message: "Captcha successfully generated.",
        data: captcha,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  // Login
  userLogin: async (req, res, next) => {
    try {
      const getUser = await model.users.findAll({
        where: { email: req.body.email },
      });

      if (getUser.length === 0) {
        return res.status(404).send({
          success: false,
          message: "Account not found.",
        });
      }

      const user = getUser[0].dataValues;

      if (user.password !== "NULL") {
        const checkPassword = bcrypt.compareSync(
          req.body.password,
          user.password
        );
        if (checkPassword) {
          if (!user.is_blocked) {
            const {
              id,
              uuid,
              name,
              email,
              phone,
              join_date,
              position_id,
              is_blocked,
            } = user;
            const token = createToken({ id, is_blocked }, "24h");
            return res.status(200).send({
              success: true,
              message: "Login successful.",
              token,
              uuid,
              name,
              email,
              phone,
              join_date,
              position_id,
              is_blocked,
            });
          }
        } else {
          return res.status(400).send({
            success: false,
            message: "Wrong credentials.",
          });
        }
      } else {
        return res.status(400).send({
          success: false,
          message: "Wrong credentials.",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  // Keep User Logged In
  keepUserLoggedIn: async (req, res, next) => {
    try {
      const getUser = await model.users.findAll({
        where: {
          id: req.decrypt.id,
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  // Pagination
  listUsers: async (req, res, next) => {
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

      const fetchUsers = await model.users.findAndCountAll({
        offset: parseInt(page * size),
        limit: parseInt(size),
        include: [
          {
            model: model.positions,
            attributes: ["name", "id"],
          },
        ],
      });
      return res.status(200).send({
        data: fetchUsers.rows,
        totalPages: Math.ceil(fetchUsers.count / size),
        datanum: fetchUsers.count,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  // Edit User
  userEdit: async (req, res, next) => {
    const ormTransaction = await model.sequelize.transaction();
    try {
      const { uuid, name, email, password, phone, position_id } = req.body;

      // Check if UUID is provided
      if (!uuid) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "UUID is required.",
        });
      }

      // Check if required fields are missing
      if (!name && !email && !password && !phone && !position_id) {
        await ormTransaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Please provide at least one field to update.",
        });
      }

      // Find the user by UUID
      const user = await model.users.findOne({
        where: { uuid: uuid },
      });

      if (!user) {
        await ormTransaction.rollback();
        return res.status(404).send({
          success: false,
          message: "User not found.",
        });
      }

      // Update user details
      const updatedUser = {
        name: name || user.name,
        email: email || user.email,
        password: password ? bcrypt.hashSync(password, salt) : user.password,
        phone: phone || user.phone,
        position_id: position_id || user.position_id,
      };

      await user.update(updatedUser, {
        transaction: ormTransaction,
      });

      await ormTransaction.commit();
      return res.status(200).send({
        success: true,
        message: "User details updated successfully.",
        data: user,
      });
    } catch (error) {
      await ormTransaction.rollback();
      console.log(error);
      next(error);
    }
  },
  userEditIsBlocked: async (req, res, next) => {
    try {
      const getUser = await model.users.findOne({
        where: {
          uuid: req.body.uuid,
        },
      });
      if (getUser.dataValues.is_blocked === false) {
        await model.users.update(
          { is_blocked: true },
          {
            where: {
              uuid: getUser.dataValues.uuid,
            },
          }
        );
      } else {
        await model.users.update(
          { is_blocked: false },
          { where: { uuid: getUser.dataValues.uuid } }
        );
      }
      res.status(200).send({
        success: true,
        data: getUser,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  userDelete: async (req, res, next) => {
    try {
      const getUser = await model.users.findOne({
        where: {
          uuid: req.params.uuid,
        },
      });
      await getUser.destroy({
        where: { uuid: getUser.dataValues.uuid },
      });
      return res.status(200).send({
        success: true,
        message: "User deleted.",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
