const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Replace with your actual MongoDB connection string
mongoose.connect("mongodb+srv://siddhanttiwari247:zYhdvWeOv8pdJS1A@cluster0.i6c1i.mongodb.net/");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    password_hash: {
        type: String,
        required: true
    }
});

userSchema.methods.createHash = async function(plainTextPassword){
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
}

userSchema.methods.validate = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
}

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = {
    User,
    Account
};
