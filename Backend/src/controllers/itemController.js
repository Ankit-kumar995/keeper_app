import Item from "../models/item.js";
import mongoose from "mongoose";

// ================= USER ID RESOLVER HELPER =================
// यह फ़ंक्शन सुरक्षा सुनिश्चित करता है ताकि मिडलवेयर में आईडी का नाम चाहे जो भी हो, 
// यह अपने आप सही यूज़र आईडी निकाल ले।
const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.userId;
};

// ================= DATE HELPER FUNCTION =================
// यह फ़ंक्शन खाली डेट इनपुट्स ("") को सुरक्षित रूप से null में बदलता है ताकि Mongoose CastError न दे
const parseDateInput = (dateVal) => {
  if (dateVal === undefined) return undefined;
  if (dateVal === "" || dateVal === null) return null; // खाली इनपुट्स को null में बदलें
  const parsedDate = new Date(dateVal);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid Date Format");
  }
  return parsedDate;
};

// ================= GET ALL ITEMS =================
export const getItems = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User session not found." });
    }

    const { search, category, expiryStatus } = req.query;

    let query = {
      userId: userId,
    };

    // Search
    if (search) {
      query.itemName = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Warranty filter
    const now = new Date();

    if (expiryStatus === "expired") {
      query.warrantyExpiry = { $lt: now };
    } else if (expiryStatus === "expiring_soon") {
      const soon = new Date();
      soon.setDate(now.getDate() + 30);
      query.warrantyExpiry = { $gte: now, $lte: soon };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(query),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getItems Error:", error);
    res.status(500).json({ message: "Failed to retrieve items" });
  }
};

// ================= CREATE ITEM =================
export const createItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User session not found." });
    }

    const {
      itemName,
      brand,
      category,
      purchaseDate,
      warrantyExpiry,
      nextServiceDate,
      notes,
    } = req.body;

    if (!itemName || !category) {
      return res.status(400).json({
        success: false,
        message: "itemName aur category zaroori hain",
      });
    }

    // सुरक्षित तरीके से डेट्स को वैलिडेट और पार्स करें
    let parsedPurchaseDate, parsedWarrantyExpiry, parsedNextServiceDate;
    try {
      parsedPurchaseDate = parseDateInput(purchaseDate);
      parsedWarrantyExpiry = parseDateInput(warrantyExpiry);
      parsedNextServiceDate = parseDateInput(nextServiceDate);
    } catch (dateError) {
      return res.status(400).json({ success: false, message: "Date format galat hai" });
    }

    let documents = [];

    if (req.files) {
      const fileKeys = ["warrantyCard", "invoice", "productImage"];

      for (const key of fileKeys) {
        if (req.files[key]) {
          const file = req.files[key][0];
          const rawPath = file.path || file.filename || file.originalname || "";
          const fileUrl = rawPath.replace(/\\/g, "/"); 

          documents.push({
            name: key,
            url: fileUrl,
            originalName: file.originalname,
          });
        }
      }
    }

    const newItem = await Item.create({
      userId: userId,
      itemName,
      brand,
      category,
      purchaseDate: parsedPurchaseDate,
      warrantyExpiry: parsedWarrantyExpiry,
      nextServiceDate: parsedNextServiceDate,
      notes,
      documents,
    });

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("createItem Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create item",
    });
  }
};

// ================= GET SINGLE ITEM =================
export const getItemById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User session not found." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findOne({
      _id: req.params.id,
      userId: userId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("getItemById Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE ITEM =================
export const updateItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User session not found." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const {
      itemName,
      brand,
      category,
      purchaseDate,
      warrantyExpiry,
      nextServiceDate,
      notes,
    } = req.body;

    const item = await Item.findOne({
      _id: req.params.id,
      userId: userId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    let updatedDocs = Array.isArray(item.documents) ? [...item.documents] : [];

    if (req.files) {
      const fileKeys = ["warrantyCard", "invoice", "productImage"];

      for (const key of fileKeys) {
        if (req.files[key]) {
          const file = req.files[key][0];
          const rawPath = file.path || file.filename || file.originalname || "";
          const fileUrl = rawPath.replace(/\\/g, "/");

          updatedDocs = updatedDocs.filter((doc) => doc.name !== key);
          updatedDocs.push({
            name: key,
            url: fileUrl,
            originalName: file.originalname,
          });
        }
      }
    }

    const updateData = {};
    if (itemName !== undefined) updateData.itemName = itemName;
    if (brand !== undefined) updateData.brand = brand;
    if (category !== undefined) updateData.category = category;
    if (notes !== undefined) updateData.notes = notes;

    try {
      if (purchaseDate !== undefined) updateData.purchaseDate = parseDateInput(purchaseDate);
      if (warrantyExpiry !== undefined) updateData.warrantyExpiry = parseDateInput(warrantyExpiry);
      if (nextServiceDate !== undefined) updateData.nextServiceDate = parseDateInput(nextServiceDate);
    } catch (dateError) {
      return res.status(400).json({ success: false, message: "Date format galat hai" });
    }

    updateData.documents = updatedDocs;

    const updatedItem = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("updateItem Error Details:", error);
    res.status(500).json({ message: "Failed to update item" });
  }
};

// ================= DELETE ITEM =================
export const deleteItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User session not found." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: userId,
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("deleteItem Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};