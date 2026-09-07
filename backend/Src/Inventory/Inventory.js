const express=require("express")
const InventoryModel=require("./InventorySchema")
const CategoryModel=require("../Category/categorySchema")

const router=express.Router()


 router.post("/inventory", async (req, res) => {
  try {
    const {
      name,
      category,
       sellingPrice,
      unitCost,
      stock,
      expiryDate,
      GST,
    } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Enter name",
      });
    }

    if (!category) {
      return res.status(400).send({
        success: false,
        message: "Enter category",
      });
    }

    // Check if category exists in categories collection
    const existingCategory = await CategoryModel.findOne({ name: category.toLowerCase() });
    if (!existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category does not exist. Please add this category first in the Categories tab.",
      });
    }

    if (!sellingPrice) {
      return res.status(400).send({
        success: false,
        message: "Enter selling price",
      });
    }
     if (!unitCost) {
      return res.status(400).send({
        success: false,
        message: "Enter unit cost",
      });
    }

    if (!stock) {
      return res.status(400).send({
        success: false,
        message: "Enter stock",
      });
    }
     if (!GST) {
      return res.status(400).send({
        success: false,
        message: "Enter GST",
      });
    }

    const inventory = new InventoryModel({
      name,
      category,
      unitCost,
      sellingPrice,
      stock,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      GST
    });

    await inventory.save();

    res.status(201).send({
      success: true,
      message: "Inventory added successfully",
      inventory,
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