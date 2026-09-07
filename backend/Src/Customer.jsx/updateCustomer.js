const express = require("express")
const Customer = require("./customerSchema")

const router = express.Router()

router.put("/updateCustomer", async (req, res) => {
    try {
        const { _id, name, phone, email, address,business } = req.body

        if (!_id) {
            return res.status(400).send({ message: "customer not found" })
        }
        const data = await Customer.findOne({ _id })
        if (!data) {
            return res.status(400).send({ message: "customer not found" })
        }

        if (name) {
            data.name = name
        }
        if (phone !== undefined && phone !== "") {
            data.phone = Number(phone)
        }
        if (email !== undefined && email !== "") {
            data.email = email
        }
        if (address) {
            data.address = address
        }
         if (business) {
            data.business = business
        }

        await data.save()

        res.status(200).send({ message: "Customer updated" })
    } catch (error) {
        return res.status(400).send({ message: "Failed to update customer: " + error.message })
    }
})

module.exports = router