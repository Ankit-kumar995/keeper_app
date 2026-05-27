import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  profilePic: { type: String },
  
  // 1. ADDED: password field to store hashed passwords for normal registrations
  password:   { type: String }, 
  
  // 2. UPDATED: Removed required: true and added sparse: true
  // 'sparse: true' ensures that multiple users can have undefined/null googleId without duplicate errors
  googleId:   { type: String, unique: true, sparse: true }, 
}, { timestamps: true });

export default mongoose.model("User", UserSchema);