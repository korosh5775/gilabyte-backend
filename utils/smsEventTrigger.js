const AutomatedSmsTemplate = require("../models/automatedSmsTemplate");
const smsService = require("./smsService"); 

// ==========================================
// 🟢 نقشه متغیرها (Mapping)
// در اینجا تعیین می‌کنیم که برای هر رویداد، ایندکس 0، 1 و... به کدام کلید از data اشاره دارد.
// ==========================================
// ==========================================
// 🟢 نقشه متغیرها (Mapping) نهایی
// ==========================================
const eventVariableMapping = {
  // 🛒 سفارشات
  NEW_ORDER_USER: ["fullName", "serviceTitle", "planName"], //0: نام مشتری | 1: نام خدمت | 2: نام پلن
  NEW_ORDER_ADMIN: ["serviceTitle", "fullName"],        // 0: نام خدمت | 1: نام مشتری
  UPDATE_ORDER_USER: ["serviceTitle", "planName"],      // 0: نام خدمت | 1: نام پلن
  UPDATE_ORDER_ADMIN: ["serviceTitle", "fullName"],     // 0: نام خدمت | 1: نام مشتری
  
  // 🎟️ تیکت‌ها
  NEW_TICKET_ADMIN: ["ticketId", "subject"],            // 0: شناسه تیکت | 1: موضوع تیکت
  TICKET_REPLY_USER: ["ticketId"],                      // 0: شناسه تیکت (کاربر فقط شناسه رو میگیره)
  TICKET_REPLY_ADMIN: ["ticketId"],                     // 0: شناسه تیکت (ادمین فقط شناسه رو میگیره)
  
  // 👤 کاربران
  NEW_USER_ADMIN: ["fullName", "phoneNumber"],          // 0: نام کاربر | 1: شماره موبایل
};

const triggerSmsEvent = async (eventName, phoneNumber, data = {}) => {
  try {
    const template = await AutomatedSmsTemplate.findOne({
      eventName: eventName,
      isActive: true, 
    });

    if (!template || !template.patternCode) {
      return; // قالب غیرفعال است یا کد ندارد
    }

    if (!phoneNumber) return;

    // ==========================================
    // 🟢 تبدیل هوشمند دیتای نام‌دار به دیتای عددی (0, 1, 2)
    // ==========================================
    const mapping = eventVariableMapping[eventName];
    let numberedData = {};

    if (mapping) {
      // اگر رویداد در لیست مپینگ ما بود، کلمات را به اعداد تبدیل کن
      mapping.forEach((key, index) => {
        // خروجی می‌شود شبیه این: { "0": "طراحی سایت", "1": "علی احمدی" }
        numberedData[index.toString()] = data[key] ? String(data[key]) : "-";
      });
    } else {
      // اگر رویداد جدیدی بود که در مپینگ بالا نبود، همون دیتای قبلی رو بفرست
      numberedData = data;
    }

    console.log(`[SMS Trigger] در حال ارسال پیامک برای رویداد ${eventName} با دیتای:`, numberedData);
    
    // ارسال به سرویس اس‌ام‌اس
    if (smsService.sendPattern) {
        await smsService.sendPattern(phoneNumber, template.patternCode, numberedData);
    }

  } catch (error) {
    console.error(`[SMS Trigger] خطا در ارسال پیامک برای رویداد ${eventName}:`, error.message);
  }
};

module.exports = {
  triggerSmsEvent,
};