// controllers/admin/tickets/toggleTicketStatus.js
const Ticket = require("../../../models/ticket");

const toggleTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body; // 'open' یا 'closed'

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: "وضعیت نامعتبر است." });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $set: { status: status } },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ success: false, message: "تیکت یافت نشد." });

    return res.status(200).json({ 
      success: true, 
      message: `تیکت با موفقیت ${status === 'open' ? 'باز' : 'بسته'} شد.`, 
      data: ticket 
    });
  } catch (error) {
    next(error);
  }
};
module.exports = toggleTicketStatus;