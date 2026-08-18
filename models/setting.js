const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  bankCard: {
    cardNumber: { type: String, default: "" },
    cardHolderName: { type: String, default: "" }
  }
  // بعداً می‌تونی اینجا چیزهایی مثل supportPhone یا siteRules هم اضافه کنی
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);