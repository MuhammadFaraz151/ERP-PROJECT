const mongoose = require("mongoose")


const CustomerSchema = mongoose.Schema({
    name: {
        type: String
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
    business:{
        type:Number,
        default:0
    },
    remainingAmount:{
        type:Number,
        default:0
    }

}, { timestamps: true })

const CustomerModel = mongoose.model("customer", CustomerSchema)
module.exports = CustomerModel