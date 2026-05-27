import mongoose from "mongoose";
import Asset from "../models/Asset.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/keeperDB";

const seedData = [
  { name: "Laptop", type: "Electronics", value: 50000, status: "active" },
  { name: "Bike",   type: "Vehicle",     value: 80000, status: "active" },
  { name: "Phone",  type: "Electronics", value: 30000, status: "active" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Asset.deleteMany();
    const inserted = await Asset.insertMany(seedData);
    console.log(`Seeded ${inserted.length} assets 🚀`);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedDB();