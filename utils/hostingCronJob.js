const cron = require('node-cron');
const User = require('../models/usersSchema');
const { triggerSmsEvent } = require('./smsEventTrigger');

// این جاب هر روز ساعت 00:01 بامداد (یک دقیقه بامداد) اجرا می‌شود
const startHostingCronJob = () => {
    cron.schedule('1 0 * * *', async () => {
        console.log("⏳ در حال اجرای عملیات کسر روزانه هزینه سرور...");
        
        try {
            // پیدا کردن تمام کاربرانی که سرویس‌شان فعال است و هزینه روزانه دارند
            const users = await User.find({ 
                'hosting.isActive': true, 
                'hosting.dailyCost': { $gt: 0 } 
            });

            for (const user of users) {
                const cost = user.hosting.dailyCost;
                
                // کسر هزینه روزانه
                user.hosting.balance -= cost;
                
                // محاسبه روزهای باقی‌مانده جدید
                const remainingDays = Math.floor(user.hosting.balance / cost);

                // =====================================
                // 🟢 مدیریت اخطارها و قطعی سرویس
                // =====================================
                if (user.hosting.balance <= 0) {
                    // 🔴 شارژ تمام شد!
                    user.hosting.isActive = false; // سرویس غیرفعال می‌شود
                    
                    // ارسال پیامک قطعی سرویس به کاربر
                    triggerSmsEvent("HOSTING_SUSPENDED_USER", user.phoneNumber, { 
                        fullName: user.fullName 
                    });
                } 
                else if (remainingDays === 7 || remainingDays === 3 || remainingDays === 1) {
                    // 🟡 اخطار ۷ روز، ۳ روز و ۱ روز مانده به اتمام شارژ
                    triggerSmsEvent("HOSTING_WARNING_USER", user.phoneNumber, { 
                        fullName: user.fullName,
                        days: remainingDays 
                    });
                }

                // ذخیره تغییرات کاربر در دیتابیس
                await user.save();
            }

            console.log(`✅ عملیات کسر هزینه برای ${users.length} کاربر با موفقیت انجام شد.`);
        } catch (error) {
            console.error("❌ خطا در اجرای کرون جاب کسر هزینه سرور:", error);
        }
    });
};

module.exports = startHostingCronJob;