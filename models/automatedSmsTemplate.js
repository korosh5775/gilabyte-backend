const mongoose = require('mongoose');

const automatedSmsTemplateSchema = new mongoose.Schema({
    /**
     * نام رویداد. این یک کلید منحصر به فرد است که در کد برای فراخوانی قالب استفاده می‌شود.
     * این فیلد نباید توسط ادمین قابل تغییر باشد.
     */
    eventName: {
        type: String,
        required: true,
        unique: true,
        enum: [
            'user_entered',        // پس از ورود موفق کاربر
            'order_confirmed',     // پس از تایید سفارش
            'order_shipped',       // پس از ارسال سفارش
            'admin_new_order',     // اطلاع‌رسانی سفارش جدید به ادمین
        ]
    },
    name: {
        type: String,
    },

    /**
     * یک توضیح خوانا برای ادمین که بداند این پیامک چه زمانی ارسال می‌شود.
     */
    description: {
        type: String,
    },

    /**
     * کد پترن در ملی پیامک (Body ID)
     */
    patternCode: {
        type: String,
    },

    /**
     * سوییچ فعال/غیرفعال کردن این پیامک خودکار.
     */
    isActive: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const AutomatedSmsTemplate = mongoose.model('AutomatedSmsTemplate', automatedSmsTemplateSchema);

module.exports = AutomatedSmsTemplate;
