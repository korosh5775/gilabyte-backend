// controllers/user/tickets/createTicket.js
const Ticket = require("../../../models/ticket");

const createTicket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { subject, text } = req.body;

    if (!subject || !text) {
      return res.status(400).json({ success: false, message: "موضوع و متن تیکت الزامی است." });
    }

    const newTicket = await Ticket.create({
      userId,
      subject,
      status: 'open',
      messages: [{
        senderType: 'user',
        senderId: userId,
        text
      }]
    });

    // 🟢 ارسال پیامک به ادمین (چون تیکت جدید است و کسی در اتاق نیست)
    const { triggerSmsEvent } = require("../../../../utils/smsEventTrigger");
    // اگر شماره ادمین در فایل .env تعریف شده است از آن استفاده کنید، یا شماره ثابت را جایگزین کنید
    const adminPhone = process.env.ADMIN_PHONE_NUMBER || "09120000000"; 
    triggerSmsEvent("NEW_TICKET_ADMIN", adminPhone, { ticketId: newTicket._id, subject });

    return res.status(201).json({ success: true, message: "تیکت شما با موفقیت ثبت شد.", data: newTicket });
  } catch (error) {
    next(error);
  }
};
module.exports = createTicket;