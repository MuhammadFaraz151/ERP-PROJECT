const express=require("express")
const InvoiceModel=require("./invoiceSchema")

const router=express.Router()


 router.get("/getInvoices", async (req, res) => {
  try {
    const invoices=await InvoiceModel.find().populate('customer', 'name')
  
    res.status(201).send(invoices);

  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/getInvoice/:invoiceNo", async (req, res) => {
  try {
    const invoice = await InvoiceModel.findOne({ invoiceNo: req.params.invoiceNo });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
});


module.exports=router