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
    ticket.hasUnreadUserMessage = true;  // 🔴 ثبت پیام خوانده‌نشده برای کاربر
    ticket.hasUnreadAdminMessage = false; 
    await ticket.save();

    const savedMessage = ticket.messages[ticket.messages.length - 1];

    // ۱. ارسال پیام زنده به داخل اتاق چت
    req.io.to(ticketId).emit("newMessage", savedMessage);
    
    // 🟢 ۲. ارسال ticketId به همراه userId برای آپدیت دقیق لیست و بج پاکت نامه
    req.io.emit("new_ticket_reply", { userId: ticket.userId, ticketId: ticket._id });

    // بررسی حضور کاربر در چت
    let isUserInRoom = false;
    if (req.io) {
      const room = req.io.sockets.adapter.rooms.get(String(ticketId));
      if (room && room.size > 0) { // حداقل یک نفر در اتاق هست، فرض می‌کنیم کاربر است
        isUserInRoom = true;
      }
    }

    if (!isUserInRoom) {
      const User = require("../../../models/user"); // اضافه کردن مدل کاربر
      const userDoc = await User.findById(ticket.userId);
      if (userDoc && userDoc.phone) {
        const { triggerSmsEvent } = require("../../../../utils/smsEventTrigger");
        triggerSmsEvent("TICKET_REPLY_USER", userDoc.phone, { ticketId: ticket._id });
      }
    }

    return res.status(200).json({ success: true, message: "پاسخ ارسال شد.", data: ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = replyTicketAdmin;