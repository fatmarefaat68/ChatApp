const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwtSecret = process.env.JWT_SECRET;

const getAllPeople = async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
};

const Register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const bcryptSalt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = new User({
      username,
      password: hashedPassword,
    });
    createdUser.save();
    jwt.sign(
      {
        userId: createdUser._id,
        username,
      },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(200)
          .json({ id: createdUser._id, username });
      }
    );
  } catch (err) {
    console.log(err.message);
  }
};

const Login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (foundUser && passOk) {
      jwt.sign(
        {
          userId: foundUser._id,
          username,
        },
        jwtSecret,
        {},
        (err, token) => {
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(200)
            .json({
              id: foundUser._id,
              username,
            });
        }
      );
    }
  } catch (err) {
    console.log(err.message);
  }
};

const Profile = async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    //unauthorized
    res.status(401).json("no token");
  }
};

const Logout = async (req, res) => {
  res
    .cookie("token", "", { sameSite: "none", secure: true })
    .status(200)
    .json("ok");
};

module.exports = { Register, Profile, Logout, Login, getAllPeople };
