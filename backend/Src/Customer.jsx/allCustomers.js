const express=require("express")
const CustomerModel=require("./customerSchema")

const router=express.Router()


 router.get("/allCustomer", async (req, res) => {
  try {
    const customers=await CustomerModel.find()
  
    res.status(201).send(customers);

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