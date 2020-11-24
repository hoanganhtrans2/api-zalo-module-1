const express = require("express");
const app = express();
var router = express.Router();
var friendController = require("../controller/friend.controller");

router.post("/getListFriends", friendController.getListFriends);
router.post(
  "/getListFriendsInvitations",
  friendController.getListFriendsInvitations
);
router.post("/acceptfriendrequest", friendController.acceptFriendRequest);
router.post("/deletefriend", friendController.deleteFriend);
router.post("/sendfriendinvitions", friendController.sendFriendInvitatios);
router.post("/denyfriendrequest", friendController.denyFriendRequest);
router.post("/finduser", friendController.findUser);

module.exports = router;
