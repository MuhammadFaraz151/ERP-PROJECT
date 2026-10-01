const mongoose = require("mongoose")

const SellerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    company: {
        type: String
    },
    totalPurchases: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const SellerModel = mongoose.model("seller", SellerSchema)
module.exports = SellerModel