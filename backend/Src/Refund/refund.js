const express = require('express');
const router = express.Router();
const InvoiceModel = require('../Invoice/invoiceSchema');
const InventoryModel = require('../Inventory/InventorySchema');
const RefundModel = require('./refundSchema');
const CustomerModel = require('../Customer.jsx/customerSchema');

// Process refund
router.post('/processRefund', async (req, res) => {
    try {
        const { invoiceNo, items, customPrices, refundAmount, customerName } = req.body;

        // Get the invoice
        const invoice = await InvoiceModel.findOne({ invoiceNo });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check if invoice has already been refunded to prevent double refunds
        if (invoice.hasRefund && invoice.refunds && invoice.refunds.length > 0) {
            // Check if trying to refund items that were already refunded
            for (const [itemIndex, refundedQty] of Object.entries(items)) {
                if (refundedQty > 0) {
                    const index = parseInt(itemIndex);
                    const invoiceItem = invoice.items[index];
                    if (invoiceItem) {
                        // Check if this item was already refunded
                        const alreadyRefunded = invoice.refunds.some(refund => 
                            refund.items.some(refItem => refItem.productId === invoiceItem.productId)
                        );
                        if (alreadyRefunded) {
                            return res.status(400).json({ 
                                message: 'This item has already been refunded. Cannot refund the same item twice.' 
                            });
                        }
                    }
                }
            }
        }

        // Process each refunded item (items is an object with index as key)
        const refundItems = [];
        
        for (const [itemIndex, refundedQty] of Object.entries(items)) {
            if (refundedQty > 0) {
                const index = parseInt(itemIndex);
                const invoiceItem = invoice.items[index];
                if (invoiceItem) {
                    // Update stock in inventory
                    const product = await InventoryModel.findById(invoiceItem.productId);
                    if (product) {
                        const qtyToAdd = Number(refundedQty);
                        console.log(`Updating stock for ${product.name}: current stock = ${product.stock}, adding ${qtyToAdd}, type = ${typeof qtyToAdd}`);
                        product.stock = Number(product.stock) + qtyToAdd;
                        await product.save();
                        console.log(`New stock for ${product.name}: ${product.stock}`);
                    } else {
                        console.log(`Product not found with ID: ${invoiceItem.productId}`);
                    }

                    // Use custom price if provided, otherwise use original price
                    const customPrice = customPrices && customPrices[itemIndex] ? Number(customPrices[itemIndex]) : invoiceItem.price;
                    const priceAmount = customPrice * refundedQty;
                    const gstAmount = (invoiceItem.gstAmount || 0) * refundedQty;
                    const itemRefundAmount = priceAmount; // Only refund the price, not GST
                    
                    console.log(`Refund calculation for ${invoiceItem.name}: originalPrice=${invoiceItem.price}, customPrice=${customPrice}, qty=${refundedQty}, refundAmount=${priceAmount}`);
                    
                    refundItems.push({
                        productId: invoiceItem.productId,
                        name: invoiceItem.name,
                        refundedQty: Number(refundedQty),
                        refundAmount: itemRefundAmount,
                        gstAmount: gstAmount,
                        originalPrice: invoiceItem.price,
                        customPrice: customPrice
                    });
                }
            }
        }

        // Create refund record
        const refund = new RefundModel({
            invoiceNo,
            customerName,
            items: refundItems,
            totalRefundAmount: refundAmount,
            totalGSTRefunded: 0, // GST is not refunded
            status: 'Processed'
        });

        await refund.save();

        // Update invoice with refund details
        if (!invoice.refunds) {
            invoice.refunds = [];
        }
        
        invoice.refunds.push({
            refundDate: new Date(),
            items: refundItems,
            totalRefundAmount: refundAmount,
            totalGSTRefunded: 0
        });

        invoice.totalRefunded = (invoice.totalRefunded || 0) + refundAmount;
        invoice.totalGSTRefunded = 0; // GST is not refunded
        invoice.hasRefund = true;
        
        // Store original values before updating
        const originalRemainingAmount = invoice.remainingAmount || 0;

        // Update invoice totals to reflect refund - only reduce grand total, not GST
        // Prevent grand total from going negative
        const newGrandTotal = invoice.grandTotal - refundAmount;
        invoice.grandTotal = Math.max(0, newGrandTotal);

        // Update remaining amount when refund is processed
        // If refund reduces the total, also reduce remaining amount
        if (invoice.remainingAmount > 0) {
            const newRemainingAmount = invoice.remainingAmount - refundAmount;
            invoice.remainingAmount = Math.max(0, newRemainingAmount);
        }

        // Don't reduce totalGST since GST is not being refunded
        // Prevent paid amount from going negative
        const newPaidAmount = invoice.paidAmount - refundAmount;
        invoice.paidAmount = Math.max(0, newPaidAmount);

        // Update status if grand total becomes 0
        if (invoice.grandTotal === 0) {
            invoice.status = 'Refunded';
        }

        // Check if this is a full refund (all items refunded)
        let allItemsRefunded = true;
        for (const invoiceItem of invoice.items) {
            const totalRefundedForItem = refundItems.reduce((sum, refItem) => {
                return sum + (refItem.productId === invoiceItem.productId ? refItem.refundedQty : 0);
            }, 0);

            if (totalRefundedForItem < invoiceItem.qty) {
                allItemsRefunded = false;
                break;
            }
        }

        // Update customer's business and remaining amounts
        if (invoice.customer) {
            // Always reduce business by refund amount (reduction in sales)
            // Reduce remaining amount by refund amount, but don't go below 0
            const remainingAmountReduction = Math.min(refundAmount, originalRemainingAmount);

            await CustomerModel.findByIdAndUpdate(
                invoice.customer,
                {
                    $inc: {
                        business: -refundAmount,
                        remainingAmount: -remainingAmountReduction
                    }
                }
            );
        }

        await invoice.save();

        res.json({ 
            message: 'Refund processed successfully', 
            refund,
            stockUpdated: true,
            invoiceUpdated: true
        });
    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({ message: 'Error processing refund', error: error.message });
    }
});

// Get all refunds
router.get('/allRefunds', async (req, res) => {
    try {
        const refunds = await RefundModel.find().sort({ createdAt: -1 });
        res.json(refunds);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching refunds', error: error.message });
    }
});

module.exports = router;
