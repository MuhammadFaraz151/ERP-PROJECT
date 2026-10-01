const mongoose = require("mongoose")

const PurchaseSchema = mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller',
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'inventory'
            },
            name: {
                type: String,
                required: true
            },
            category: {
                type: String
            },
            quantity: {
                type: Number,
                required: true
            },
            stock: {
                type: Number,
                default: 0
            },
            unitCost: {
                type: Number,
                required: true
            },
            totalCost: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String
    },
    status: {
        type: String,
        default: "Pending"
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const PurchaseModel = mongoose.model("purchase", PurchaseSchema)
module.exports = PurchaseModel