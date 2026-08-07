// controllers/user/tickets/getUserTickets.js
const Ticket = require("../../../models/ticket");

const getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 🟢 اضافه شدن hasUnreadUserMessage به لیست فیلدهای انتخابی
    const tickets = await Ticket.find({ userId })
      .select("subject status hasUnreadUserMessage updatedAt") 
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

module.exports = getUserTickets;