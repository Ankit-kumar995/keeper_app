import Item from "../models/item.js";

class ItemService {
  // 1. Naya item create karne ke liye
  async createItem(title, content, userId) {
    return await Item.create({
      title,
      content,
      user: userId,
    });
  }

  // 2. User ke saare items fetch karne ke liye
  async getItemsByUserId(userId) {
    return await Item.find({ user: userId });
  }

  // 3. Ek single item ID se dhoondhne ke liye
  async getItemById(itemId) {
    return await Item.findById(itemId);
  }

  // 4. Item ko update karne ke liye
  async updateItem(itemId, updateData) {
    return await Item.findByIdAndUpdate(itemId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // 5. Item delete karne ke liye
  async deleteItem(itemId) {
    return await Item.findByIdAndDelete(itemId);
  }
}

export default new ItemService();