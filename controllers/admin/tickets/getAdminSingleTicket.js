// controllers/admin/tickets/getAdminSingleTicket.js
const Ticket = require("../../../models/ticket");

const getAdminSingleTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate("userId", "fullName phoneNumber"); // ادمین باید بداند با چه کسی حرف می‌زند

    if (!ticket) {
      return res.status(404).json({ success: false, message: "تیکت یافت نشد." });
    }

    // 🟢 اگر تیکت پیام خوانده‌نشده برای ادمین دارد، آن را خوانده‌شده اعلام می‌کنیم
    if (ticket.hasUnreadAdminMessage) {
      ticket.hasUnreadAdminMessage = false;
      await ticket.save();
    }

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = getAdminSingleTicket;