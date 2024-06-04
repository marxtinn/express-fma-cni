const route = require("express").Router();

const {
  fetchAllPositions,
  fetchPositions,
  createPosition,
  editPostion,
  deletePosition,
} = require("../controllers/positionController");
const { extractToken, readToken } = require("../helpers/jsonwebtoken");

route.get("/allpositions", extractToken, readToken, fetchAllPositions);
route.get("/positionlist", extractToken, readToken, fetchPositions);
route.post("/add", createPosition);
route.patch("/edit", editPostion);
route.delete("/delete/:uuid", deletePosition);

module.exports = route;
