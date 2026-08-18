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
            'NEW_TICKET_ADMIN',
            'TICKET_REPLY_ADMIN',
            'TICKET_REPLY_USER',
            'NEW_ORDER_USER',
            'NEW_ORDER_ADMIN',
            'NEW_USER_ADMIN',
            'UPDATE_ORDER_USER',
            'UPDATE_ORDER_ADMIN',
            'NEW_RECEIPT_ADMIN',
            'RECEIPT_APPROVED_USER',
            'RECEIPT_REJECTED_USER',
            'HOSTING_WARNING_USER',
            'HOSTING_SUSPENDED_USER',
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
