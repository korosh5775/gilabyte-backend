// models/about.js
const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  // بخش ۱: هدر (قلاب احساسی)
  hero: {
    title: { type: String, default: "گیلابایت؛ معماریِ آینده دیجیتال شما." },
    subtitle: { type: String, default: "ما اینجاییم تا شعبه‌ی آنلاین کسب‌وکار شما را خلق کنیم." }
  },

  // بخش ۲: داستان ما
  story: {
    title: { type: String, default: "پایانِ دورانِ قالب‌های آماده" },
    content: { type: String, default: "متن داستان گیلابایت در اینجا قرار می‌گیرد..." }
  },

  // بخش ۳: ارزش‌های کلیدی (آرایه‌ای از آبجکت‌ها)
  coreValues: [{
    title: { type: String},
    description: { type: String },
    iconName: { type: String, default: "star" } // نام آیکون برای مپ کردن در فرانت‌اند
  }],

  // بخش ۴: تکنولوژی‌ها (لیستی از کلمات مثل React, Node.js)
  techStack: [{ type: String }],

  // بخش ۵: اطلاعات بنیان‌گذار
  founder: {
    name: { type: String, default: "نام شما" },
    role: { type: String, default: "بنیان‌گذار و توسعه‌دهنده ارشد" },
    bio: { type: String, default: "متن بیوگرافی شما..." },
    image: { type: String, default: "" } // مسیر عکس در سرور
  },
    team: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, default: "" }, // 🟢 اضافه شد
    image: { type: String, default: "" } // 🟢 اضافه شد
  }]
}, { timestamps: true });

module.exports = mongoose.model("About", aboutSchema);