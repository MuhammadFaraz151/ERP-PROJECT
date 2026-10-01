const express = require("express")
const PurchaseModel = require("./purchaseSchema")
const SellerModel = require("./sellerSchema")
const ProductModel = require("../Inventory/InventorySchema")

const router = express.Router()

// Add new purchase
router.post("/purchase", async (req, res) => {
  try {
    const {
      seller,
      sellerName,
      items,
      totalAmount,
      paidAmount,
      paymentMethod
    } = req.body;

    if (!seller || !sellerName) {
      return res.status(400).send({
        success: false,
        message: "Seller information required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).send({
        success: false,
        message: "At least one item required",
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.name) {
        return res.status(400).send({
          success: false,
          message: "Item name is required",
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).send({
          success: false,
          message: "Item quantity must be greater than 0",
        });
      }
      if (!item.unitCost || item.unitCost < 0) {
        return res.status(400).send({
          success: false,
          message: "Item unit cost must be greater than or equal to 0",
        });
      }
      // Category is optional, so no validation needed
    }

    const remainingAmount = totalAmount - (paidAmount || 0);
    const status = remainingAmount === 0 ? "Paid" : "Pending";

    const purchase = new PurchaseModel({
      seller,
      sellerName,
      items,
      totalAmount,
      paidAmount: paidAmount || 0,
      remainingAmount,
      paymentMethod: paymentMethod || "Cash",
      status
    });

    await purchase.save();

    // Update seller total purchases
    const sellerData = await SellerModel.findById(seller);
    if (sellerData) {
      sellerData.totalPurchases = (sellerData.totalPurchases || 0) + totalAmount;
      sellerData.remainingAmount = (sellerData.remainingAmount || 0) + remainingAmount;
      await sellerData.save();
    }

    // Update product stock
    for (const item of items) {
      const stockToAdd = item.stock !== undefined ? item.stock : item.quantity;
      if (item.productId) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          product.stock = (product.stock || 0) + stockToAdd;
          product.unitCost = item.unitCost; // Update unit cost
          if (item.category) {
            product.category = item.category; // Update category if provided
          }
          await product.save();
        }
      } else if (item.name) {
        // Handle manual product entry - create or update product
        let product = await ProductModel.findOne({ name: item.name });
        if (product) {
          product.stock = (product.stock || 0) + stockToAdd;
          product.unitCost = item.unitCost; // Update unit cost
          if (item.category) {
            product.category = item.category; // Update category if provided
          }
          await product.save();
        } else {
          // Create new product with manual entry
          const newProduct = new ProductModel({
            name: item.name,
            category: item.category || 'Uncategorized',
            unitCost: item.unitCost,
            sellingPrice: 0, // Set selling price to 0
            stock: stockToAdd,
            GST: 0
          });
          await newProduct.save();
        }
      }
    }

    res.status(201).send({
      success: true,
      message: "Purchase added successfully",
      purchase,
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

// Get all purchases
router.get("/allPurchases", async (req, res) => {
  try {
    const purchases = await PurchaseModel.find()
      .populate('seller', 'name phone company')
      .sort({ createdAt: -1 });
    res.status(200).send(purchases);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get single purchase
router.get("/getPurchase/:id", async (req, res) => {
  try {
    const purchase = await PurchaseModel.findById(req.params.id)
      .populate('seller', 'name phone company');
    if (!purchase) {
      return res.status(404).send({ message: "Purchase not found" });
    }
    res.status(200).send(purchase);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Pay remaining amount for purchase
router.put("/payPurchaseRemaining", async (req, res) => {
  try {
    const {
      purchaseId,
      paymentAmount
    } = req.body;

    if (!purchaseId || !paymentAmount) {
      return res.status(400).send({ message: "Purchase ID and payment amount required" });
    }

    const purchase = await PurchaseModel.findById(purchaseId);
    if (!purchase) {
      return res.status(404).send({ message: "Purchase not found" });
    }

    if (paymentAmount > purchase.remainingAmount) {
      return res.status(400).send({ message: "Payment cannot exceed remaining amount" });
    }

    purchase.paidAmount = purchase.paidAmount + paymentAmount;
    purchase.remainingAmount = purchase.remainingAmount - paymentAmount;
    purchase.status = purchase.remainingAmount === 0 ? "Paid" : "Pending";

    await purchase.save();

    // Update seller remaining amount
    const seller = await SellerModel.findById(purchase.seller);
    if (seller) {
      seller.remainingAmount = (seller.remainingAmount || 0) - paymentAmount;
      await seller.save();
    }

    res.status(200).send({
      success: true,
      message: "Payment recorded successfully",
      purchase,
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

// Delete purchase
router.delete("/deletePurchase", async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).send({ message: "Purchase ID required" });
    }

    const purchase = await PurchaseModel.findById(_id);
    if (!purchase) {
      return res.status(404).send({ message: "Purchase not found" });
    }

    // Reverse stock changes
    for (const item of purchase.items) {
      const stockToSubtract = item.stock !== undefined ? item.stock : item.quantity;
      if (item.productId) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - stockToSubtract);
          await product.save();
        }
      } else if (item.name) {
        // Handle manual product entry reversal
        const product = await ProductModel.findOne({ name: item.name });
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - stockToSubtract);
          await product.save();
        }
      }
    }

    // Update seller totals
    const seller = await SellerModel.findById(purchase.seller);
    if (seller) {
      seller.totalPurchases = Math.max(0, (seller.totalPurchases || 0) - purchase.totalAmount);
      seller.remainingAmount = Math.max(0, (seller.remainingAmount || 0) - purchase.remainingAmount);
      await seller.save();
    }

    await PurchaseModel.findByIdAndDelete(_id);

    res.status(200).send({
      success: true,
      message: "Purchase deleted successfully",
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