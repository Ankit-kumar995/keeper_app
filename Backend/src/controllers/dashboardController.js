import Item from "../models/item.js";

// ================= USER ID RESOLVER HELPER =================
// यह फ़ंक्शन सुरक्षा सुनिश्चित करता है ताकि मिडलवेयर में आईडी का नाम चाहे जो भी हो, 
// यह अपने आप सही यूज़र आईडी निकाल ले।
const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.userId;
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User session not found." });
    }

    const now = new Date();

    // अब यह केवल लॉगिन किए हुए यूज़र की आईडी से ही फ़िल्टर करेगा
    const totalItems = await Item.countDocuments({ userId });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcomingReminders = await Item.find({
      userId,
      $or: [
        { warrantyExpiry: { $gte: now, $lte: thirtyDaysFromNow } },
        { nextServiceDate: { $gte: now, $lte: thirtyDaysFromNow } }
      ]
    }).sort({ warrantyExpiry: 1, nextServiceDate: 1 });

    const recentlyUploaded = await Item.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalItems,
      upcomingReminders,
      recentlyUploaded
    });
  } catch (error) {
    console.error("getDashboardSummary Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};