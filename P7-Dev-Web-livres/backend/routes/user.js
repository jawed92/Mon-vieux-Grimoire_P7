const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const userMiddleware = require("../middleware/userMiddleware");

router.post(
	"/signup",
	userMiddleware.emailChecker,
	userMiddleware.passwordCrypter,
	userController.signup
);
router.post("/login", userController.login);

module.exports = router;
