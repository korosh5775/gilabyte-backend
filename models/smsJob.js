const mongoose = require('mongoose');

const smsJobSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: false, // برای پیامک‌های تراکنشی (مثل OTP یا وضعیت سفارش) ممکن است کمپین نداشته باشیم
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending',
        index: true,
    },
    sentAt: {
        type: Date,
    },
    error: {
        type: String,
    },
    apiResponse: {
        type: String, // ذخیره JSON پاسخ API به صورت رشته
    },
}, { timestamps: true });

const SmsJob = mongoose.model('SmsJob', smsJobSchema);

module.exports = SmsJob;
