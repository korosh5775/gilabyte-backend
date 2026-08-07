// controllers/admin/tickets/getAllTickets.js
const Ticket = require("../../../models/ticket");

const getAllTickets = async (req, res, next) => {
  try {
    const { status } = req.query; // ادمین می‌تواند فیلتر کند: ?status=open

    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await Ticket.find(filter)
      .populate("userId", "fullName phoneNumber") // 🟢 جادوی کار: نام و شماره کاربر ضمیمه می‌شود
      .sort({ updatedAt: -1 }); // جدیدترین تغییرات در بالا قرار می‌گیرند

    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};
module.exports = getAllTickets;