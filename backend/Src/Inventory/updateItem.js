const express = require("express")
const Product = require("./InventorySchema")
const CategoryModel = require("../Category/categorySchema")

const router = express.Router()

router.put("/updateItem", async (req, res) => {
    try {
        const {       _id,name,
      category,
       sellingPrice,
      unitCost,
      stock,
      GST,
      expiryDate, } = req.body

            if(!_id){
                  return res.status(400).send({ message: "product not found" })
            }
        const data = await Product.findOne({ _id })
        if (!data) {
            return res.status(400).send({ message: "product not found" })
        }

        // Check if category exists when category is being updated
        if(category && category !== data.category) {
            const existingCategory = await CategoryModel.findOne({ name: category.toLowerCase() });
            if (!existingCategory) {
                return res.status(400).send({ message: "Category does not exist. Please add this category first in the Categories tab." })
            }
        }

        if(name){
         data.name = name
       }
        if(category){
         data.category = category
       }
        if(sellingPrice){
         data.sellingPrice=sellingPrice
       }
        if(unitCost){
         data.unitCost = unitCost
       }
       
        if(stock){
         data.stock=stock
       }
         if(GST){
         data.GST=GST
       }
        if(expiryDate !== undefined && expiryDate !== ""){
         data.expiryDate = new Date(expiryDate)
       }
       
        await data.save()

        res.status(200).send({ message: "Product updated" })
    } catch (error) {
        return res.status(400).send({ message: "Failed to update product: " + error.message })
    }
})

module.exports = router