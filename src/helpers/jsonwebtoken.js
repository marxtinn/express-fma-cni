const jwt = require("jsonwebtoken");

module.exports = {
  createToken: (payload, exp = "24h") =>
    jwt.sign(payload, process.env.JWT_SECRET_TOKEN, {
      expiresIn: exp,
    }),
  extractToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).send({
        success: false,
        message: "No token provided.",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Token format is invalid.",
      });
    }
    req.token = token;
    next();
  },
  readToken: (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, (error, decrypt) => {
      if (error) {
        console.log(error);
        return res.status(401).send({
          success: false,
          message: "Authentication Failed.",
        });
      }
      req.decrypt = decrypt;
      next();
    });
  },
};
