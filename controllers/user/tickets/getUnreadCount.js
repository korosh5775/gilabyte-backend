// controllers/user/tickets/getUnreadCount.js
const Ticket = require("../../../models/ticket");

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // فقط می‌خواهیم بشماریم چندتا تیکت "answered" (پاسخ‌داده‌شده توسط ادمین) برای این کاربر وجود دارد
    const count = await Ticket.countDocuments({ 
      userId, 
      status: 'answered' 
    });

    return res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
module.exports = getUnreadCount;