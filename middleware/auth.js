const jwt = require("jsonwebtoken");
const User = require("../models/user");

require("dotenv").config();

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "UnAuthorizedx" });
    }
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const userDetails = await User.findByPk(user.user_id);
    if (!userDetails) {
      console.log('userDetails can"t be fetched@authenticate:auth.js');
      return res.status(404).json({ error: "User UnAuthorized" });
    }
    req.user = userDetails;
    console.log("userDetails fetched and authenticated@authenticate:auth.js");
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server Error" });
  }
};
