// models/CampaignLog.js

const mongoose = require('mongoose');

const campaignLogSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    /**
     * فیلد کلیدی برای تعیین تاریخ انقضای این لاگ.
     * بعد از این تاریخ، این لاگ دیگر در بررسی‌ها در نظر گرفته نمی‌شود.
     */
    expiresAt: {
        type: Date,
        required: true
    },
}, { timestamps: true });

/**
 * ایندکس TTL (Time-To-Live): یک ویژگی قدرتمند در MongoDB است.
 * به دیتابیس می‌گوید که هر سندی را به صورت خودکار، پس از گذشت زمان مشخص شده در فیلد 'expiresAt' پاک کند.
 * این کار باعث می‌شود کالکشن CampaignLog شما همیشه تمیز بماند و از داده‌های قدیمی پر نشود.
 */
campaignLogSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// این ایندکس برای بهینه‌سازی کوئری پیدا کردن لاگ‌های یک کاربر در یک کمپین خاص استفاده می‌شود.
campaignLogSchema.index({ campaignId: 1, userId: 1 });

const CampaignLog = mongoose.model('CampaignLog', campaignLogSchema);

module.exports = CampaignLog;
