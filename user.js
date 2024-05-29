const express = require("express");
// Installing zod for schema validation 
const Zod = require("zod");
// Importing the user database
const { User } = require("../db");
// Importing the jwt token
const jwt = require("jsonwebtoken");
// Importing the secret
const { JWT_SECRET } = require("../config");
// Importing the authentication middleware
const { authmiddleware } = require("../middleware");

// Instantiating the express router
const router = express.Router();

// Creating the schema validation
const signupSchema = Zod.object({
    username: Zod.string().email(),
    password: Zod.string(),
    firstName: Zod.string(),
    lastName: Zod.string()
});

router.post("/signup", async (req, res) => {
    // Validate the data against the zod schema
    const { success, error } = signupSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs",
            errors: error.errors
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username
    });

    if (existingUser) {
        return res.status(409).json({
            message: "Email already taken"
        });
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    const userID = user._id;

    const token = jwt.sign({ userID }, JWT_SECRET);

    res.status(201).json({
        message: "User created successfully",
        token: token
    });
});

router.post("/signin", async (req, res) => {
    const user = await User.findOne({ username: req.body.email });
    if (user == null) {
        return res.status(400).json({
            message: "User not found"
        });
    } else {
        const isPasswordValid = await user.validatePassword(req.body.password);
        if (isPasswordValid) {
            const userID = user._id;
            const token = jwt.sign({ userID }, JWT_SECRET);
            return res.status(200).json({
                message: "User logged in successfully",
                token: token
            });
        } else {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }
    }
});

const updateBody = Zod.object({
    password: Zod.string().optional(),
    firstName: Zod.string().optional(),
    lastName: Zod.string().optional()
});

router.put("/", authmiddleware, async (req, res) => {
    const { success, error } = updateBody.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs",
            errors: error.errors
        });
    }

    await User.updateOne({ _id: req.userID }, req.body);

    res.json({
        message: "Updated successfully"
    });
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: { $regex: filter, $options: 'i' }
        }, {
            lastName: { $regex: filter, $options: 'i' }
        }]
    });

    res.json({
        users: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            id: user._id
        }))
    });
});

module.exports = router;
