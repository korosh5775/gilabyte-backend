// controllers/user/tickets/closeTicket.js
const Ticket = require("../../../models/ticket");

const closeTicket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, userId },
      { $set: { status: 'closed' } },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ success: false, message: "تیکت یافت نشد." });

    return res.status(200).json({ success: true, message: "تیکت با موفقیت بسته شد." });
  } catch (error) {
    next(error);
  }
};
module.exports = closeTicket;