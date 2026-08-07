const Ticket = require("../../../models/ticket");

const markTicketAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;

    await Ticket.findOneAndUpdate(
      { _id: ticketId, userId },
      { $set: { hasUnreadUserMessage: false } }
    );

    // 🟢 شلیک ایونت به فرانت تا بج در همان لحظه بدون رفرش خاموش شود
    if (req.io) {
      req.io.emit("ticket_marked_as_read", { userId, ticketId });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = markTicketAsRead;