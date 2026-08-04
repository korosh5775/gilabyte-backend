const mongoose = require("mongoose");

// ==========================================
// اسکیمای مشتریان و نمونه‌کارها (Portfolio / Clients Schema)
// ==========================================
// این مدل برای ذخیره‌سازی اطلاعات مشتریان و نمونه‌کارهای گیلابایت در دیتابیس استفاده می‌شود.
const portfolioSchema = new mongoose.Schema(
  {
    // نام مشتری یا نام پروژه/نمونه‌کار (مثلاً: "فروشگاه دیجی‌استایل" یا "شرکت صنایع غذایی")
    name: {
      type: String,
      required: [true, "وارد کردن نام مشتری یا نمونه‌کار الزامی است."],
      trim: true,
    },

    // مسیر یا لینک تصویر لوگو/عکس نمونه‌کار (مثلاً: "/images/portfolios/portfolioImage-xxx.png")
    imageUrl: {
      type: String,
      required: [true, "آپلود تصویر نمونه‌کار الزامی است."],
    },

    // آدرس اینترنتی وب‌سایت یا صفحه مربوطه جهت لینک‌دهی در فرانت‌اند
    linkUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // توضیحات کوتاه اختیاری درباره نمونه‌کار یا مشتری
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ترتیب نمایش در سایت (عدد کوچکتر اولویت بیشتری دارد)
    order: {
      type: Number,
      default: 0,
    },

    // وضعیت فعال بودن نمایش در سایت (اگر false باشد در فرانت نمایش داده نمی‌شود)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // ثبت خودکار زمان ایجاد (createdAt) و زمان آخرین ویرایش (updatedAt)
    timestamps: true,
  }
);

// خروجی گرفتن از مدل Portfolio
module.exports = mongoose.model("Portfolio", portfolioSchema);
