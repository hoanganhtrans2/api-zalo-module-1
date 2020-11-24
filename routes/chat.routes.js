const express = require("express");
const app = express();
var router = express.Router();
var chatController = require("../controller/chat.controller");

router.post("/getRom", chatController.getRomChat);
router.post("/getMessageFromRoom", chatController.getMessageFromRoom);

module.exports = router;
