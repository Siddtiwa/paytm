// Install express
const express = require("express");
// Importing user route
const userRouter = require("./user");
// Importing account route
const accountRouter = require("./account")

//  Importing express Router
const router = express.Router();

// Mounding the url begining with "/user" to userRoter
router.use("/user", userRouter);
// Mounding the url begining with "/account" to accountRouter
router.use("/account", accountRouter)

// Exporting the express Router
module.exports = router;