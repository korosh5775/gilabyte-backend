const Ticket = require("../../../models/ticket");
const { triggerSmsEvent } = require("../../../utils/smsEventTrigger");


const replyTicket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ success: false, message: "متن پیام الزامی است." });

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) return res.status(404).json({ success: false, message: "تیکت یافت نشد." });
    if (ticket.status === 'closed') return res.status(400).json({ success: false, message: "تیکت بسته شده است." });

    const stringTicketId = String(ticketId);

    // 🟢 ۱. بررسی اینکه آیا کسی (ادمین) هم‌اکنون درون روم این تیکت در سوکت حضور دارد یا خیر
    let isAdminInRoom = false;
    if (req.io) {
      const room = req.io.sockets.adapter.rooms.get(stringTicketId);
      // اگر تعداد افراد حاضر در روم بیشتر از ۱ نفر باشد (یا کلاینت دیگری جز کاربر در روم باشد)
      if (room && room.size > 1) {
        isAdminInRoom = true;
      }
    }

    const newMessage = { senderType: 'user', senderId: userId, text };
    ticket.messages.push(newMessage);

    ticket.status = 'open'; 
    
    // 🟢 ۲. فقط در صورتی بج ادمین روشن شود که ادمین در روم چت حضور نداشته باشد!
    ticket.hasUnreadAdminMessage = !isAdminInRoom; 
    ticket.hasUnreadUserMessage = false; 
    
    await ticket.save();

    const savedMessage = ticket.messages[ticket.messages.length - 1];

    if (req.io) {
      req.io.to(stringTicketId).emit("newMessage", savedMessage);
      
      if (!isAdminInRoom) {
        req.io.emit("new_user_message", { 
          userId: ticket.userId, 
          ticketId: stringTicketId 
        });

        // 🟢 ارسال پیامک به ادمین در صورت عدم حضور در چت
        const adminPhone = process.env.ADMIN_PHONE_NUMBER || "09120000000";
        triggerSmsEvent("TICKET_REPLY_ADMIN", adminPhone, { ticketId: stringTicketId });
      }
    }

    return res.status(200).json({ success: true, message: "پیام ارسال شد.", data: ticket });
  } catch (error) {
    next(error);
  }
};

module.exports = replyTicket;