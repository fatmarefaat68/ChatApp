const Message = require("../models/Message");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
// const bcrypt = require("bcrypt");

const getAllMessages = async (req, res) => {
  const { userId } = req.params;
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const ourUserId = userData.userId;

      const messagess = await Message.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] },
      }).sort({ createdAt: 1 });

      // console.log(messagess);
      res.json(messagess);
    });
  } else {
    //unauthorized
    res.status(401).json("no token");
  }
};

module.exports = { getAllMessages };
