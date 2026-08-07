// controllers/admin/tickets/replyTicketAdmin.js
const Ticket = require("../../../models/ticket");

const replyTicketAdmin = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { ticketId } = req.params;
    const { text } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: "تیکت یافت نشد." });

    const newMessage = { senderType: 'admin', senderId: adminId, text };
    ticket.messages.push(newMessage);

    ticket.status = 'answered'; 
    ticket.hasUnreadUserMessage = true;   // کاربر باید این رو بخونه
    ticket.hasUnreadAdminMessage = false; // ادمین خودش پیام داده
    await ticket.save();

    console.log(`🚀 [Backend] شلیک پیام زنده به اتاق تیکت: ${ticketId}`);
    // ۱. این کد پیام رو به داخل صفحه چت می‌فرسته (توجه کنید به .to(ticketId) )
    req.io.to(ticketId).emit("newMessage", newMessage);
    
    console.log(`🚀 [Backend] شلیک نوتیفیکیشن کلی برای روشن شدن بجِ کاربر: ${ticket.userId}`);
    // ۲. این کد باعث روشن شدن بج (پاکت نامه) میشه
    req.io.emit("new_ticket_reply", { userId: ticket.userId });

    return res.status(200).json({ success: true, message: "پاسخ ارسال شد.", data: ticket });
  } catch (error) {
    next(error);
  }
};
module.exports = replyTicketAdmin;