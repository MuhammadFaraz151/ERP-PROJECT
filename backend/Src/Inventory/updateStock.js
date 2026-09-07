const express = require("express")
const Product = require("./InventorySchema")

const router = express.Router()

router.put("/updateStock", async (req, res) => {
    try {
        const {
            _id,
        stock,
        } = req.body

        if (!_id) {
            return res.status(400).send({ message: "product not found" })
        }

        const data = await Product.findOne({ _id })

        if (!data) {
            return res.status(404).send({ message: "product not found" })
        }

        if (stock) {
            if (stock < 0) {
                return res.status(400).send({ message: "invalid stock quantity" })
            }

            // Allow stock to go to 0, but prevent it from going negative
            const newStock = data.stock - stock;
            if (newStock < 0) {
                return res.status(401).send({ message: "not enough stock" })
            }
            
            data.stock = newStock
        }

        // Keep product even when stock is 0 (don't delete)
        await data.save()

        res.status(200).send({ message: "Product updated" })

    } catch (error) {
        return res.status(401).send({
            message: "Failed to update product: " + error.message
        })
    }
})

module.exports = router