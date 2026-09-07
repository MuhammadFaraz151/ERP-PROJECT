const express=require("express")
const Customer = require("./customerSchema")

const router=express.Router()


router.delete("/deleteCustomer", async (req, res) => {
    try {
        const { _id } = req.body || {}

        if (!_id) {
            return res.status(400).send({ message: "id not found" })
        }

        const customer = await Customer.findOneAndDelete({_id })
        if (!customer) {
            return res.status(400).send({ message: "no customer" })
        }
        res.send("deleted")
    } catch (error) {
        console.log(error)
        return res.status(400).send({ message: "something went wrong" })
    }
})

module.exports=router