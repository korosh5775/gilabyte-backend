const cron = require('node-cron');
const User = require('../models/usersSchema');
const { triggerSmsEvent } = require('./smsEventTrigger');

const startHostingCronJob = () => {
    cron.schedule('1 0 * * *', async () => {
        console.log("⏳ در حال اجرای عملیات کسر روزانه هزینه سرور...");
        
        try {
            const users = await User.find({ 
                'hosting.isActive': true, 
                'hosting.dailyCost': { $gt: 0 } 
            });

            let successCount = 0;

            for (const user of users) {
                try {
                    const cost = Number(user.hosting.dailyCost) || 0;
                    const oldBalance = Number(user.hosting.balance) || 0;
                    const newBalance = oldBalance - cost;
                    
                    // محاسبه روزهای باقی‌مانده (در صورت منفی شدن موجودی، عدد منفی می‌شود یعنی روزهای بدهکاری)
                    const remainingDays = Math.floor(newBalance / cost);

                    // 🟢 فقط در شبی که موجودی از مثبت به صفر/منفی می‌رسد پیامک اتمام شارژ ارسال شود
                    // سرویس غیرفعال نمی‌شود تا در روزهای بعد حساب کاربر منفی (بدهکار) شود
                    if (newBalance <= 0 && oldBalance > 0) {
                        triggerSmsEvent("HOSTING_SUSPENDED_USER", user.phoneNumber, { 
                            fullName: user.fullName 
                        });
                    } 
                    else if (newBalance > 0 && (remainingDays === 7 || remainingDays === 3 || remainingDays === 1)) {
                        triggerSmsEvent("HOSTING_WARNING_USER", user.phoneNumber, { 
                            fullName: user.fullName,
                            days: remainingDays 
                        });
                    }

                    await User.updateOne(
                        { _id: user._id },
                        { $set: { 'hosting.balance': newBalance } }
                    );

                    successCount++;
                } catch (userError) {
                    console.error(`❌ خطا در کسر هزینه برای کاربر ${user._id}:`, userError);
                }
            }

            console.log(`✅ عملیات کسر هزینه برای ${successCount} از ${users.length} کاربر با موفقیت انجام شد.`);
        } catch (error) {
            console.error("❌ خطا در اجرای کرون جاب کسر هزینه سرور:", error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Tehran"
    });
};

module.exports = startHostingCronJob;