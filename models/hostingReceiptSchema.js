const mongoose = require("mongoose");

const hostingReceiptSchema = mongoose.Schema({
    // کاربری که این رسید را آپلود کرده است
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    // مسیر عکسی که آپلود شده
    receiptImage: {
        type: String,
        required: true
    },

    // مبلغی که کاربر ادعا می‌کند واریز کرده است (ادمین می‌تواند موقع تایید تغییرش دهد)
    amount: {
        type: Number,
        required: true
    },

    // شماره پیگیری یا شماره کارت (اختیاری)
    trackingCode: {
        type: String,
        trim: true
    },

    // وضعیت رسید
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // در انتظار بررسی ادمین
    },

    // یادداشت ادمین (مثلاً در صورت رد شدن فیش: "عکس ناخوانا است")
    adminNote: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("HostingReceipt", hostingReceiptSchema);