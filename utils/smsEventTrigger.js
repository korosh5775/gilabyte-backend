const AutomatedSmsTemplate = require("../models/automatedSmsTemplate");
const smsService = require("./smsService"); 

const triggerSmsEvent = async (eventName, phoneNumber, data = {}) => {
  try {
    const template = await AutomatedSmsTemplate.findOne({
      eventName: eventName,
      isActive: true, 
    });

    // اگر قالب غیرفعال است یا کد پترن ندارد، خارج شو
    if (!template || !template.patternCode) {
      return; 
    }

    if (!phoneNumber) return;

    console.log(`[SMS Trigger] در حال ارسال پیامک برای رویداد ${eventName} با دیتای:`, data);
    
    // 🟢 جادوی کار اینجاست: ما دقیقاً همون آبجکت data رو بدون هیچ تغییری به سامانه می‌فرستیم!
    if (smsService.sendPattern) {
        await smsService.sendPattern(phoneNumber, template.patternCode, data);
    }

  } catch (error) {
    console.error(`[SMS Trigger] خطا در ارسال پیامک برای رویداد ${eventName}:`, error.message);
  }
};

module.exports = {
  triggerSmsEvent,
};