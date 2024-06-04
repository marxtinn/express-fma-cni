const route = require("express").Router();

const {
  generateCaptchaCode,
  listUsers,
  userRegister,
  userLogin,
  userEdit,
  userEditIsBlocked,
  userDelete,
} = require("../controllers/userController");

// Set url/route for accessing controller through API hit.

route.get("/captcha", generateCaptchaCode); // params: (URL endpoint, controller function )
route.get("/list", listUsers);
route.post("/register", userRegister);
route.post("/auth", userLogin);
route.patch("/edit", userEdit);
route.patch("/block", userEditIsBlocked);
route.delete("/delete/:uuid", userDelete);

module.exports = route;
