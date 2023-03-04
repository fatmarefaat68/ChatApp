const express = require("express");
const router = express.Router();
const { getAllMessages } = require("../controllers/messageController");

router.get("/messages/:userId", getAllMessages);

module.exports = router;
