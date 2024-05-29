const express = require("express")
const { authmiddleware } = require("../middleware")
const { Account } = require("../db")
const { default:mongoose } = require("mongoose");


const router = express.Router();

router.get("/balance", authmiddleware, async (res, req) => {
    try{
        const account = await Account.findOne({userID: req.userID})
        if(!account){
            return res.status(404).json({
                message: "No account found for the requested user"
            })
        }
        res.json({ balance: Account.balance})
    }
    catch(error){
        console.log(error)
        res.json({
            message: "Internal server error"
        })
    }
})

router.post("/transfer", authmiddleware, async(res, req) => {
    try{
        const mongooseSession = mongoose.startSession()
        mongooseSession.startTransaction()
        const {amount, to} = req.body

        const account = await Account.findOne({ userID:Account.userID }).session(mongooseSession)

        if(!account){
            await mongooseSession.abortTransaction();
            return res.status(400).json({
                message: "No account/user found"
            })
        }
        if(account.balance < amount){
            await mongooseSession.abortTransaction();
            return res.status(400).json({
                message: "Insufficient balance"
            })
        }

        const toAccount = Account.findOne({ userID:to }).session(mongooseSession)
        if(!toAccount){
            await mongooseSession.abortTransaction()
            return res.status(400).json({
                message:"User not found"
            })
        }

        await Account.updateOne({userID:req.userID}, {$inc: {balance: -amount}}).session(mongooseSession)
        await Account.updateOne({userID:to}, {$inc: {balance: amount}}).session(mongooseSession)

        await mongooseSession.commitTransaction()
        res.json({
            message: "Transaction Successful"
        })
    }
    catch(error){
        console.log()
    }
})
module.exports = router