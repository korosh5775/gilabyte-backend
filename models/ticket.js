// models/ticket.js
const mongoose = require("mongoose");

// اسکیما برای هر پیام داخل تیکت
const messageSchema = new mongoose.Schema({
  senderType: { 
    type: String, 
    enum: ['user', 'admin'], 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  }
}, { timestamps: true }); // تاریخ ایجاد هر پیام را خودش ثبت می‌کند

// اسکیما اصلی تیکت
const ticketSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'answered', 'closed'], // open: منتظر پاسخ شما | answered: شما پاسخ دادید | closed: بسته شده
    default: 'open' 
  },
  // 🟢 فیلد جدید: آیا کاربر جواب ادمین را دیده است؟
  hasUnreadAdminMessage: { 
    type: Boolean, 
    default: false 
  },
  messages: [messageSchema] // آرایه‌ای از پیام‌ها
}, { timestamps: true }); // تاریخ ایجاد تیکت و آخرین تغییر وضعیت (updatedAt) را ثبت می‌کند

module.exports = mongoose.model("Ticket", ticketSchema);