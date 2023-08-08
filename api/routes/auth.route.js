const Router = require("express").Router();

const {
  signUp,
  login,
  logout,
  protect,
} = require("../controllers/auth.controller");

Router.post("/signup", signUp);
Router.post("/login", login);
Router.get("/logout", logout);
Router.get("/123", protect);

module.exports = Router;
