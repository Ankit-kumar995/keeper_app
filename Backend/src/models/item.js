import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemName:        { type: String, required: true },
  brand:           { type: String },
  category:        { type: String, required: true },
  purchaseDate:    { type: Date },
  warrantyExpiry:  { type: Date },
  nextServiceDate: { type: Date },
  notes:           { type: String },
  documents: [
    {
      name: { type: String },
      url:  { type: String },
    }
  ],
}, { timestamps: true });

export default mongoose.model("Item", ItemSchema);