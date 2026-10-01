const express = require("express");
const InvoiceModel = require("./invoiceSchema");
const CustomerModel = require("../Customer.jsx/customerSchema");
const InventoryModel = require("../Inventory/InventorySchema");

const router = express.Router();

function generateInvoiceNo() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `INV-${year}-${random}`;
}

router.post("/invoice", async (req, res) => {
  try {
    const {
      customer,
      customerName,
      items,
      subtotal,
      discount,
      grandTotal,
      paymentMethod,
      remainingAmount,
      paidAmount,
    } = req.body;

    if (!customer) {
      return res.status(400).send({ success: false, message: "Select a customer" });
    }
    if (!items || items.length === 0) {
      return res.status(400).send({ success: false, message: "Add at least one item" });
    }

    // Validate stock availability for each item
    for (const item of items) {
      const product = await InventoryModel.findById(item.productId);
      if (!product) {
        return res.status(400).send({ 
          success: false, 
          message: `Product not found: ${item.product || item.name}` 
        });
      }
      
      const requestedQty = Number(item.qnt) || 0;
      const availableStock = Number(product.stock) || 0;
      
      if (requestedQty > availableStock) {
        return res.status(400).send({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${requestedQty}` 
        });
      }
    }

    const invoiceNo = generateInvoiceNo();
    const paid = Number(paidAmount) || 0;

    // Calculate grand total using selling prices
    const calculatedGrandTotal = items.reduce((sum, item) => {
      const sellingPrice = Number(item.sellingPrice) || Number(item.price) || 0;
      return sum + (sellingPrice * Number(item.qnt || 0));
    }, 0);

    // Calculate total GST
    const calculatedTotalGST = items.reduce((sum, item) => {
      const unitCost = Number(item.unitCost) || Number(item.price) || 0;
      const gstPercentage = Number(item.gst) || 0;
      const gstAmount = unitCost * (gstPercentage / 100);
      return sum + (gstAmount * Number(item.qnt || 0));
    }, 0);

    const finalGrandTotal = calculatedGrandTotal - Number(discount || 0);

    const invoice = new InvoiceModel({
      invoiceNo,
      customer,
      customerName,
      items: items.map(item => ({
        ...item,
        price: Number(item.sellingPrice) || Number(item.price) || 0,
        unitCost: Number(item.unitCost) || 0,
        gst: item.gst || 0,
        gstAmount: item.gstAmount || 0
      })),
      subtotal: calculatedGrandTotal - calculatedTotalGST,
      totalGST: calculatedTotalGST,
      discount,
      grandTotal: finalGrandTotal,
      paidAmount: paid,
      remainingAmount: finalGrandTotal - paid,
      paymentMethod,
      status: (finalGrandTotal - paid) > 0 ? "Pending" : "Paid",
    });

    await invoice.save();

    // Deduct stock from inventory for each item
    for (const item of items) {
      const requestedQty = Number(item.qnt) || 0;
      if (requestedQty > 0) {
        await InventoryModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -requestedQty } }
        );
      }
    }

    // Update customer business amount and remaining amount
    await CustomerModel.findOneAndUpdate(
      { _id: customer },
      { 
        $inc: { 
          business: finalGrandTotal,
          remainingAmount: finalGrandTotal - paid 
        } 
      }
    );

    res.status(201).send({
      success: true,
      message: "Invoice generated successfully",
      invoice,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;