const route = require("express").Router();

const {
  fetchLocations,
  fetchLocationOptions,
} = require("../controllers/locationController");

route.get("/all-locations", fetchLocations);
route.get("/location-options", fetchLocationOptions);

module.exports = route;
