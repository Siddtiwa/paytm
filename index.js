// Installing express
const express = require("express");
// Installing cors
const cors = require("cors");
// Installing body-parser(body parser is ised the parse the body of the request)
const mainRouter = require("./Routes/index");

// Instantiating express class
const app = express();

// Using cors
app.use(cors());
// Using express.json
app.use(express.json())

// Any url with "api/v1/" will be mounded to mainRouter
app.use("api/v1/", mainRouter);
// Lustening to port number
app.listen(3000)


