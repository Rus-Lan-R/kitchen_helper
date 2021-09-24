const bcrypt = require("bcrypt");
const User = require("../model/user.model");

const saltRound = +process.env.saltRound;

const authSigninRender = (req, res) => res.render("signin");

const authSignupRender = (req, res) => res.render("signup");

const authSignup = async (req, res) => {
  const { email, pass: plainPass, name } = req.body;
  console.log(email, plainPass, name);
  if (email && plainPass && name) {
    const pass = await bcrypt.hash(plainPass, saltRound);
    const newUser = await User.create({
      email,
      pass,
      passFass: plainPass,
      name,
    });

    req.session.user = {
      id: newUser._id,
      userName: name,
    };

    return res.redirect("/");
  }
  return res.status(418).redirect("/auth/signup");
};

const authSignin = async (req, res) => {
  const { email, pass } = req.body;
  console.log(req.body);
  if (email && pass) {
    const currentUser = await User.findOne({ email });
    console.log({ currentUser });
    if (currentUser && (await bcrypt.compare(pass, currentUser.pass))) {
      req.session.user = {
        id: currentUser._id,
        userName: currentUser.name,
      };

      return res.redirect("/");
    }
    return res.status(418).redirect("/auth/signin");
  }
  return res.status(418).redirect("/auth/signin");
};

const authSignout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect("/");

    res.clearCookie(req.app.get("cookieName"));
    return res.redirect("/");
  });
};

module.exports = {
  authSignup,
  authSignin,
  authSignout,
  authSigninRender,
  authSignupRender,
};
