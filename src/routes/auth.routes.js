const { Router } = require("express");
const router = Router();

const {
	authSignup,
	authSignin,
	authSignout,
	authSigninRender,
	authSignupRender,
} = require("../controller/auth.controller");

router.route("/signup").get(authSignupRender).post(authSignup);

router.route("/signin").get(authSigninRender).post(authSignin);

router.route("/signout").get(authSignout);

module.exports = router;
