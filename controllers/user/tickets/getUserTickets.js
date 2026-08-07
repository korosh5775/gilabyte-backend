// controllers/user/tickets/getUserTickets.js
const Ticket = require("../../../models/ticket");

const getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // نیازی به populate نیست، چون کاربر خودش می‌داند کیست!
    // فقط فیلدهای ضروری را می‌فرستیم تا API سبک بماند
    const tickets = await Ticket.find({ userId })
      .select("subject status updatedAt") 
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};
module.exports = getUserTickets;