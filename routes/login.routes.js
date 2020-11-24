const express = require("express");
const app = express();
var router = express.Router();
var loginController = require("../controller/login.controller");

router.post("/login", loginController.login);

module.exports = router;
