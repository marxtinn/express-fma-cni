const { join } = require("path");
// require("dotenv").config({ path: join(__dirname, "../.env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 2000;
const app = express();
app.use(express.json());
app.use(cors());
app.use("/", express.static(__dirname + "/public"));

//#region API ROUTES
const userRouter = require("./src/routers/userRouter");
const positionRouter = require("./src/routers/positionRouter");
const locationRouter = require("./src/routers/locationRouter");
const checkpointRouter = require("./src/routers/checkpointRouter");
// ===========================
// NOTE : Add your routes here
app.use("/api/user", userRouter);
app.use("/api/positions", positionRouter);
app.use("/api/locations", locationRouter);
app.use("/api/checkpoints", checkpointRouter);

app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
  res.status(200).json({
    message: "Hello, User !",
  });
});

// ===========================

// not found
app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err);
    res.status(500).send(err);
  } else {
    next();
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});
