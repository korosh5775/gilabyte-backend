// models/order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // 👇 این بخش باید اضافه شود 👇
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", // نام مدل کاربر شما (احتمالا User است)
    required: true 
  },
  
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String }, 
  preferredTime: { type: String }, 
  
  serviceTitle: { type: String, required: true }, 
  planName: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'contacted', 'canceled', 'success'], 
    default: 'pending' 
  },
    paymentType: { 
    type: String, 
    enum: ['cash', 'installment'], 
    required: true 
  },
  referralCode: { 
    type: String, 
    trim: true // برای حذف فاصله‌های اضافی احتمالی
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);