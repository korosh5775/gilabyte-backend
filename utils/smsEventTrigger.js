const AutomatedSmsTemplate = require("../models/automatedSmsTemplate");
const smsService = require("./smsService"); 

const triggerSmsEvent = async (eventName, phoneNumber, data = {}) => {
  try {
    const template = await AutomatedSmsTemplate.findOne({
      eventName: eventName,
      isActive: true, 
    });

    if (!template || !template.patternCode) return; 
    if (!phoneNumber) return;

    // =========================================================
    // 🟢 فیلتر جادویی: رفع محدودیت ۲۵ کاراکتری SMS.ir
    // =========================================================
    const safeData = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        let value = String(data[key] || "-"); // تبدیل به رشته
        
        // اگر متن بیشتر از ۲۵ کاراکتر بود، آن را ببر و آخرش "…" بگذار
        if (value.length > 25) {
          value = value.substring(0, 21) + "…"; 
        }
        
        safeData[key] = value;
      }
    }

    console.log(`[SMS Trigger] ارسال پیامک برای ${eventName} با دیتای ایمن:`, safeData);
    
    // ارسال دیتای فیلتر شده (safeData) به سرویس اس‌ام‌اس
    if (smsService.sendPattern) {
        await smsService.sendPattern(phoneNumber, template.patternCode, safeData);
    }

  } catch (error) {
    console.error(`[SMS Trigger] خطا در ارسال پیامک برای رویداد ${eventName}:`, error.message);
  }
};

module.exports = {
  triggerSmsEvent,
};