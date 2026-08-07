const Ticket = require("../../../models/ticket");

const markTicketAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;

    // 👇 تغییر مهم: hasUnreadUserMessage باید false بشه (چون کاربر الان پیام رو خوند)
    await Ticket.findOneAndUpdate(
      { _id: ticketId, userId },
      { $set: { hasUnreadUserMessage: false } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
module.exports = markTicketAsRead;