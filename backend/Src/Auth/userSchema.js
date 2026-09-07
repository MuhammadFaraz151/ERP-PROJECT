const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "admin",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true })

const UserModel = mongoose.model("user", UserSchema)
module.exports = UserModel
