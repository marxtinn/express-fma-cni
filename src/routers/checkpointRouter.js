const route = require("express").Router();

const {
  fetchCheckpoints,
  editCheckpoint,
  deleteCheckpoint,
  createCheckpoint,
} = require("../controllers/checkpointController");

route.get("/all-checkpoints", fetchCheckpoints);
route.post("/create", createCheckpoint);
route.patch("/edit", editCheckpoint);
route.delete("/delete/:uuid", deleteCheckpoint);

module.exports = route;
