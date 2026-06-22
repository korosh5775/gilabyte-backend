const mongoose = require('mongoose');

/**
 * Schema برای تعریف یک شرط (Condition) در یک کمپین فروشگاه.
 */
const conditionSchema = new mongoose.Schema({
    /**
     * نوع شرط که منطق فیلتر کردن را مشخص می‌کند.
     */
    type: {
        type: String,
        required: true,
        enum: [
            'registration_date',    // شرط بر اساس تاریخ ثبت‌نام کاربر
            'last_purchase',        // شرط بر اساس تاریخ آخرین خرید
            'purchase_count',       // شرط بر اساس تعداد کل خریدها (وفاداری)
            'specific_product',     // شرط بر اساس خرید یک محصول خاص
            'birthday_is_today',    // تولدشان امروز است
            'birthday_is_this_month', // تولدشان در ماه جاری است
        ],
    },

    /**
     * عملگر مقایسه برای شرط‌های عددی.
     * eq: مساوی با, gt: بیشتر از, lt: کمتر از
     */
    operator: {
        type: String,
        enum: ['eq', 'gt', 'lt'],
        required: function () {
            // operator فقط برای شرایطی که به آن نیاز دارند الزامی است
            return !['birthday_is_today', 'birthday_is_this_month'].includes(this.type);
        }
    },

    /**
     * مقدار شرط. ساختار این فیلد بسته به 'type' شرط کاملاً متفاوت است.
     */
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: function () {
            // value فقط برای شرایطی که به آن نیاز دارند الزامی است
            return !['birthday_is_today', 'birthday_is_this_month'].includes(this.type);
        }
    },
}, { _id: false });


/**
 * Schema برای تعریف زمان‌بندی اجرای یک کمپین.
 */
const scheduleSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['once', 'daily', 'weekly', 'monthly']
    },
    // برای 'once': تاریخ دقیق اجرا
    runAtDate: {
        type: Date,
        required: function () { return this.type === 'once'; }
    },
    // برای 'weekly': روز هفته (0=یکشنبه, ..., 6=شنبه)
    dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
        required: function () { return this.type === 'weekly'; }
    },
    // برای 'monthly': روز ماه (1-31)
    dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
        required: function () { return this.type === 'monthly'; }
    }
}, { _id: false });


/**
 * Schema اصلی کمپین فروشگاه.
 */
const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    messageTemplate: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'inactive', 'archived'], default: 'inactive' },
    schedule: { type: scheduleSchema, required: true },
    conditions: { type: [conditionSchema], required: true },
    lastRanAt: { type: Date }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
