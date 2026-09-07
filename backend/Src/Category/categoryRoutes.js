const express = require("express");
const CategoryModel = require("./categorySchema");

const router = express.Router();

// Get all categories
router.get("/allCategories", async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).send(categories);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Add new category
router.post("/category", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ success: false, message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await CategoryModel.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(400).send({ success: false, message: "Category already exists" });
    }

    const category = new CategoryModel({
      name: name.toLowerCase()
    });

    await category.save();

    res.status(201).send({
      success: true,
      message: "Category added successfully",
      category,
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

// Update category
router.put("/updateCategory", async (req, res) => {
  try {
    const { _id, name } = req.body;

    if (!_id) {
      return res.status(400).send({ success: false, message: "Category ID is required" });
    }
    if (!name) {
      return res.status(400).send({ success: false, message: "Category name is required" });
    }

    // Check if category name already exists (excluding current category)
    const existingCategory = await CategoryModel.findOne({ 
      name: name.toLowerCase(),
      _id: { $ne: _id }
    });
    if (existingCategory) {
      return res.status(400).send({ success: false, message: "Category name already exists" });
    }

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      _id,
      { name: name.toLowerCase() },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).send({ success: false, message: "Category not found" });
    }

    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
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

// Delete category
router.delete("/deleteCategory", async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).send({ success: false, message: "Category ID is required" });
    }

    const deletedCategory = await CategoryModel.findByIdAndDelete(_id);

    if (!deletedCategory) {
      return res.status(404).send({ success: false, message: "Category not found" });
    }

    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
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

module.exports = router;