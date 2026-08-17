const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner', 'guest'],
        required: true,
        default: 'user'
    },
    birthDate: { type: Date }, 
    birthDateUpdatesCount: { type: Number, default: 0 }, 

    pushToken: { 
        type: String,
        trim: true,
        sparse: true, 
        unique: true, 
    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: "active"
    },

    // ==========================================
    // 🟢 سیستم مدیریت مالی سرور و پشتیبانی
    // ==========================================
    hosting: {
        // موجودی کل کاربر (مبلغی که پرداخت کرده و هنوز مصرف نشده) - به تومان
        balance: { type: Number, default: 0 },
        
        // هزینه کسر روزانه بابت سرور و پشتیبانی - به تومان (مثلا 27500)
        dailyCost: { type: Number, default: 0 },
        
        // آخرین باری که ادمین موجودی کاربر را شارژ کرده است
        lastChargeDate: { type: Date },
        
        // آخرین باری که ادمین مبلغ کسر روزانه را تغییر داده است
        lastDailyCostUpdate: { type: Date },

        // وضعیت سرویس (اگر شارژ تمام شود، کرون جاب این را false می‌کند تا ادمین بداند)
        isActive: { type: Boolean, default: false }
    }
}, { timestamps: true });

UserSchema.virtual('isAdmin').get(function () {
    return this.role === 'admin';
});

UserSchema.pre('save', function (next) {
    if (this.role === 'user' && !this.phoneNumber) {
        return next(new Error('Phone number is required for regular users.'));
    }
    if (this.role === 'admin' && !this.phoneNumber) {
        return next(new Error('Phone number is required for admins.'));
    }
    next();
});

module.exports = mongoose.model("User", UserSchema);