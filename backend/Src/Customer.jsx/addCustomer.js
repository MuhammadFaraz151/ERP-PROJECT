const express=require("express")
const CustomerModel=require("./customerSchema")

const router=express.Router()


 router.post("/customer", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
    } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Enter name",
      });
    }

  
     if (!address) {
      return res.status(400).send({
        success: false,
        message: "Enter address",
      });
    }

    const customer = new CustomerModel({
      name,
      phone: phone ? Number(phone) : undefined,
      email: email || undefined,
      address,
    });

    await customer.save();

    res.status(201).send({
      success: true,
      message: "Customer added successfully",
      customer,
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


module.exports=router