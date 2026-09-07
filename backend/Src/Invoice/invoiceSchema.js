const mongoose = require("mongoose")

const InvoiceSchema = mongoose.Schema({
    invoiceNo: {
        type: String,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
    },
    customerName: {
        type: String,
    },
    items: [
        {
            name: String,
            qty: Number,
            price: Number,
            gst: Number,
            gstAmount: Number,
            productId: String,
        }
    ],
    subtotal: {
        type: Number,
    },
    totalGST: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
    },
    grandTotal: {
        type: Number,
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    remainingAmount: {
        type: Number,
        default: 0,
    },
    paymentMethod: {
        type: String,
    },
    status: {
        type: String,
        default: "Paid",
    },
    refunds: [
        {
            refundDate: Date,
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
            totalRefundAmount: Number,
            totalGSTRefunded: Number,
        }
    ],
    totalRefunded: {
        type: Number,
        default: 0,
    },
    totalGSTRefunded: {
        type: Number,
        default: 0,
    },
    hasRefund: {
        type: Boolean,
        default: false,
    },


}, { timestamps: true })

const InvoiceModel = mongoose.model("invoice", InvoiceSchema)
module.exports = InvoiceModel