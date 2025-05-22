const express = require("express");
const router = express.Router();
// const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));
//  learingin router.route  ==> note remove path from sub apis
// router.get("/signup", userController.renderSignupForm);
// router.post("/signup", wrapAsync(userController.signup));


router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);


router.get("/logout", userController.logout);

module.exports = router;
