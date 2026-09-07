const express = require("express");
const InvoiceModel = require("./invoiceSchema");
const CustomerModel = require("../Customer.jsx/customerSchema");

const router = express.Router();

router.post("/payRemaining", async (req, res) => {
  try {
    const { invoiceId, paymentAmount } = req.body;

    if (!invoiceId) {
      return res.status(400).send({ success: false, message: "Invoice ID is required" });
    }
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).send({ success: false, message: "Valid payment amount is required" });
    }

    // Find the invoice
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) {
      return res.status(404).send({ success: false, message: "Invoice not found" });
    }

    // Check if payment amount exceeds remaining amount
    if (paymentAmount > invoice.remainingAmount) {
      return res.status(400).send({ 
        success: false, 
        message: `Payment amount cannot exceed remaining amount of ${invoice.remainingAmount}` 
      });
    }

    // Calculate new amounts
    const newPaidAmount = Number(invoice.paidAmount) + Number(paymentAmount);
    const newRemainingAmount = Number(invoice.remainingAmount) - Number(paymentAmount);
    const newStatus = newRemainingAmount === 0 ? "Paid" : "Pending";

    // Update invoice
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      invoiceId,
      {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus
      },
      { new: true }
    );

    // Update customer remaining amount (decrease by payment amount)
    await CustomerModel.findOneAndUpdate(
      { _id: invoice.customer },
      { $inc: { remainingAmount: -Number(paymentAmount) } }
    );

    res.status(200).send({
      success: true,
      message: "Payment recorded successfully",
      invoice: updatedInvoice
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