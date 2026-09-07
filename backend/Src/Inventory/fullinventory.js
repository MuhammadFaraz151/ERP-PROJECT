const express=require("express")
const InventoryModel=require("./InventorySchema")

const router=express.Router()


 router.get("/allInventory", async (req, res) => {
  try {
    const products=await InventoryModel.find()
  
    res.status(201).send(products);

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