const AutomatedSmsTemplate = require("../models/automatedSmsTemplate");
// فرض می‌کنیم سرویس ارسال پیامک الگو/پترن در فایل زیر یا مسیر مشابهی قرار دارد.
// اگر مسیر یا نام تابع متفاوت است، لطفاً فقط همین خط یا تابع داخل block اصلی را تغییر دهید.
const smsService = require("./smsService"); // یا require("../services/transactionalSmsService");

/**
 * ==========================================
 * 🟢 راهنمای افزودن رویداد پیامکی جدید در آینده
 * ==========================================
 * برای اضافه کردن یک مورد جدید به سیستم پیامک خودکار، فقط 3 مرحله زیر را انجام دهید:
 * 
 * 1. نام رویداد جدید خود را تعیین کنید (مثلاً "FORGET_PASSWORD_USER").
 * 2. در پنل ادمین، یک قالب جدید بسازید و نام رویداد (Event Name) آن را دقیقاً همان کلمه "FORGET_PASSWORD_USER" بگذارید و کد قالب (Template Code) آن را از پنل پیامک وارد کنید.
 * 3. در کنترلر مورد نظر (مثلاً کنترلر فراموشی رمز)، این فایل را import کرده و خط زیر را فراخوانی کنید:
 * 
 *    const { triggerSmsEvent } = require("../../utils/smsEventTrigger");
 *    triggerSmsEvent("FORGET_PASSWORD_USER", userPhone, { code: 12345 });
 * 
 * سیستم به صورت خودکار قالب را از دیتابیس می‌خواند و در صورت فعال بودن، مقادیر (data) را به پترن پاس داده و پیامک را ارسال می‌کند.
 */

/**
 * ارسال پیامک خودکار بر اساس رویدادهای تعریف شده در دیتابیس
 * @param {String} eventName نام رویداد (مثلاً "NEW_TICKET_ADMIN")
 * @param {String} phoneNumber شماره موبایل گیرنده (اگر برای ادمین است، می‌توانید مستقیماً شماره ادمین را پاس دهید)
 * @param {Object} data متغیرهای مورد نیاز برای جایگذاری در قالب پیامک (اختیاری)
 */
const triggerSmsEvent = async (eventName, phoneNumber, data = {}) => {
  try {
    // 1. پیدا کردن قالب از دیتابیس
    const template = await AutomatedSmsTemplate.findOne({
      eventName: eventName,
      isActive: true, // فقط در صورتی که قالب فعال باشد
    });

    if (!template || !template.patternCode) {
      console.log(`[SMS Trigger] قالب فعال برای رویداد ${eventName} یافت نشد یا کد قالب ندارد.`);
      return;
    }

    if (!phoneNumber) {
      console.log(`[SMS Trigger] شماره موبایل برای ارسال رویداد ${eventName} وارد نشده است.`);
      return;
    }

    // 2. ارسال پیامک با استفاده از سرویس موجود
    // نکته: با توجه به اینکه فایل‌های سرویس پیامک شما خوانده نشده‌اند، 
    // لطفاً در صورت نیاز نام تابع ارسال پترن (مثلاً sendPattern یا sendTransactionalSms) را 
    // با نام واقعی تابع خود در فایل smsService یا transactionalSmsService جایگزین کنید.
    
    console.log(`[SMS Trigger] در حال ارسال پیامک برای رویداد ${eventName} به شماره ${phoneNumber} با کد قالب ${template.patternCode}`);
    
    if (smsService.sendPattern) {
        await smsService.sendPattern(phoneNumber, template.patternCode, data);
    } else if (smsService.sendTransactionalSms) {
        await smsService.sendTransactionalSms(phoneNumber, template.patternCode, data);
    } else {
        // در صورتی که تابع شما ساختار دیگری دارد، آن را اینجا صدا بزنید
        // مثال:
        // await transactionalSmsService.send(phoneNumber, template.templateCode, data);
        console.warn("[SMS Trigger] لطفاً تابع ارسال پیامک خود را در utils/smsEventTrigger.js مشخص کنید.");
    }

  } catch (error) {
    console.error(`[SMS Trigger] خطا در ارسال پیامک برای رویداد ${eventName}:`, error.message);
  }
};

module.exports = {
  triggerSmsEvent,
};
