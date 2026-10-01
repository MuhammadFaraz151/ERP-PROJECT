const express = require("express")
const SellerModel = require("./sellerSchema")

const router = express.Router()

// Add new seller
router.post("/seller", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      company
    } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Enter name",
      });
    }

    const seller = new SellerModel({
      name,
      phone: phone ? Number(phone) : undefined,
      email: email || undefined,
      address: address || undefined,
      company: company || undefined
    });

    await seller.save();

    res.status(201).send({
      success: true,
      message: "Seller added successfully",
      seller,
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

// Get all sellers
router.get("/allSellers", async (req, res) => {
  try {
    const sellers = await SellerModel.find().sort({ createdAt: -1 });
    res.status(200).send(sellers);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get single seller
router.get("/getSeller/:id", async (req, res) => {
  try {
    const seller = await SellerModel.findById(req.params.id);
    if (!seller) {
      return res.status(404).send({ message: "Seller not found" });
    }
    res.status(200).send(seller);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update seller
router.put("/updateSeller", async (req, res) => {
  try {
    const {
      _id,
      name,
      phone,
      email,
      address,
      company
    } = req.body;

    if (!_id) {
      return res.status(400).send({ message: "Seller ID required" });
    }

    const seller = await SellerModel.findById(_id);
    if (!seller) {
      return res.status(404).send({ message: "Seller not found" });
    }

    if (name) seller.name = name;
    if (phone !== undefined) seller.phone = Number(phone);
    if (email !== undefined) seller.email = email;
    if (address !== undefined) seller.address = address;
    if (company !== undefined) seller.company = company;

    await seller.save();

    res.status(200).send({
      success: true,
      message: "Seller updated successfully",
      seller,
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

// Delete seller
router.delete("/deleteSeller", async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).send({ message: "Seller ID required" });
    }

    const seller = await SellerModel.findById(_id);
    if (!seller) {
      return res.status(404).send({ message: "Seller not found" });
    }

    await SellerModel.findByIdAndDelete(_id);

    res.status(200).send({
      success: true,
      message: "Seller deleted successfully",
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

// Update seller total purchases and remaining amount
router.put("/updateSellerPurchases", async (req, res) => {
  try {
    const {
      _id,
      totalPurchases,
      remainingAmount
    } = req.body;

    if (!_id) {
      return res.status(400).send({ message: "Seller ID required" });
    }

    const seller = await SellerModel.findById(_id);
    if (!seller) {
      return res.status(404).send({ message: "Seller not found" });
    }

    if (totalPurchases !== undefined) seller.totalPurchases = Number(totalPurchases);
    if (remainingAmount !== undefined) seller.remainingAmount = Number(remainingAmount);

    await seller.save();

    res.status(200).send({
      success: true,
      message: "Seller purchases updated successfully",
      seller,
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

module.exports = router