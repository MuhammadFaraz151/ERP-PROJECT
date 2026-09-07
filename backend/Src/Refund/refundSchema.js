const mongoose = require("mongoose")

const RefundSchema = mongoose.Schema({
    invoiceNo: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
    },
    items: [
        {
            productId: String,
            name: String,
            refundedQty: Number,
            refundAmount: Number,
            gstAmount: Number,
            originalPrice: Number,
            customPrice: Number,
        }
    ],
    totalRefundAmount: {
        type: Number,
        required: true,
    },
    totalGSTRefunded: {
        type: Number,
        default: 0,
    },
    refundDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: "Processed",
    }
}, { timestamps: true })

const RefundModel = mongoose.model("refund", RefundSchema)
module.exports = RefundModel
