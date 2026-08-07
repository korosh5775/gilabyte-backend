// controllers/user/tickets/getSingleTicket.js
const Ticket = require("../../../models/ticket");

const getSingleTicket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;

    // 🟢 امنیت: کاربر فقط می‌تواند تیکتی را ببیند که userId آن با آی‌دی خودش برابر است
    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) return res.status(404).json({ success: false, message: "تیکت یافت نشد یا شما دسترسی ندارید." });

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};
module.exports = getSingleTicket;