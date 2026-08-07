// controllers/user/tickets/replyTicket.js
const Ticket = require("../../../models/ticket");

const replyTicket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ success: false, message: "متن پیام الزامی است." });

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) return res.status(404).json({ success: false, message: "تیکت یافت نشد." });
    if (ticket.status === 'closed') return res.status(400).json({ success: false, message: "تیکت بسته شده است." });

    const newMessage = { senderType: 'user', senderId: userId, text };
    ticket.messages.push(newMessage);

    ticket.status = 'open'; 
    ticket.hasUnreadAdminMessage = true;  // ادمین باید این رو بخونه
    ticket.hasUnreadUserMessage = false; 
    
    await ticket.save();

    const savedMessage = ticket.messages[ticket.messages.length - 1];

    // 🟢 ۱. شلیک پیام زنده به اتاقِ همین تیکت (تا ادمین بدون رفرش پیام رو ببینه)
req.io.to(ticketId).emit("newMessage", savedMessage);
    
    // 🟢 ۲. شلیک رویداد برای آپدیت شدن بج‌های لیست تیکت‌های ادمین
    req.io.emit("new_ticket_reply", { userId: ticket.userId });

    return res.status(200).json({ success: true, message: "پیام ارسال شد.", data: ticket });
  } catch (error) {
    next(error);
  }
};
module.exports = replyTicket;