import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  type:   { type: String, required: true },
  value:  { type: Number, required: true },
  status: { type: String, default: "active" },
}, { timestamps: true });

export default mongoose.model("Asset", assetSchema);