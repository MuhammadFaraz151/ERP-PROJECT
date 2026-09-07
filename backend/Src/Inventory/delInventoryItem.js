const express=require("express")
const Product = require("./InventorySchema")

const router=express.Router()


router.delete("/deleteItem", async (req, res) => {
    try {
        const { _id } = req.body || {}

        if (!_id) {
            return res.status(400).send({ message: "id not found" })
        }

        const products = await Product.findOneAndDelete({_id })
        if (!products) {
            return res.status(400).send({ message: "no product" })
        }
        res.send("deleted")
    } catch (error) {
        console.log(error)
        return res.status(400).send({ message: "something went wrong" })
    }
})

module.exports=router