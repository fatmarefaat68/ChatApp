const express = require("express");
const router = express.Router();
const {
  Register,
  Profile,
  Login,
  getAllPeople,
  Logout,
} = require("../controllers/userController");

router.post("/register", Register);

router.post("/login", Login);

router.get("/profile", Profile);

router.get("/people", getAllPeople);

router.post("/logout", Logout);

module.exports = router;
