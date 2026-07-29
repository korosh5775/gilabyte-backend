const mongoose = require("mongoose");

//create schema
const UserSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
        // sparse: true اجازه می‌دهد چندین کاربر با شماره تلفن null داشته باشیم (برای مهمانان)
        // اما چون شما phoneNumber را unique گذاشته‌اید، بهتر است برای مهمانان یک شماره تلفن ساختگی یا شماره تلفن ادمین را ذخیره کنیم
        // یا اینکه این فیلد را برای مهمانان اختیاری کنیم. راه حل زیر بهتر است:
        sparse: true,
        trim: true,
    },

    // *** فیلد جدید: نقش کاربر ***
    // این فیلد جایگزین isAdmin می‌شود و بسیار قدرتمندتر است.
    role: {
        type: String,
        enum: ['user', 'admin', 'owner', 'guest'],
        required: true,
        default: 'user'
    },


    birthDate: { type: Date }, // تاریخ تولد کاربر (اختیاری)
    birthDateUpdatesCount: { type: Number, default: 0 }, // شمارنده تعداد دفعات ویرایش تاریخ تولد

    pushToken: { // فیلد جدید برای ذخیره Push Token از فرانت‌اند
        type: String,
        trim: true,
        sparse: true, // اجازه می‌دهد چندین کاربر توکن null یا undefined داشته باشند
        unique: true, // هر توکن فقط می‌تواند به یک کاربر اختصاص یابد
    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: "active"
    }
}, { timestamps: true }); // از timestamps: true استفاده کنید تا createdAt و updatedAt خودکار مدیریت شوند


// فیلد isAdmin را حذف می‌کنیم و از role استفاده می‌کنیم، اما اگر جای دیگری از آن استفاده کرده‌اید، می‌توانید نگه دارید
UserSchema.virtual('isAdmin').get(function () {
    return this.role === 'admin';
});


// قبل از ذخیره، یک اعتبارسنجی کوچک انجام می‌دهیم
UserSchema.pre('save', function (next) {
    if (this.role === 'user' && !this.phoneNumber) {
        return next(new Error('Phone number is required for regular users.'));
    }
    // اگر کاربر ادمین است، می‌توانیم نقش او را هم چک کنیم
    if (this.role === 'admin' && !this.phoneNumber) {
        return next(new Error('Phone number is required for admins.'));
    }
    next();
});

module.exports = mongoose.model("User", UserSchema);