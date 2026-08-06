// controllers/about/updateAbout.js
const About = require("../../../models/about");
const fs = require("fs");
const path = require("path");

const updateAbout = async (req, res, next) => {
  try {
    const parsedData = req.body.payload ? JSON.parse(req.body.payload) : {};
    const hero = parsedData.hero || {};
    const story = parsedData.story || {};
    const coreValues = parsedData.coreValues || [];
    const techStack = parsedData.techStack || [];
    const founder = parsedData.founder || {};
    const team = parsedData.team || []; 

    const existingAbout = await About.findOne();

    // 🟢 تابع امن برای پاک کردن عکس قدیمی
    const safeDeleteImage = (imageUrl) => {
      if (!imageUrl) return;
      try {
        const absolutePath = path.join(process.cwd(), imageUrl);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (err) {
        console.error("خطا در حذف عکس:", err.message);
      }
    };

    // 🟢 ۱. بررسی عکس بنیان‌گذار
    if (req.files && req.files['founderImage']) {
      const file = req.files['founderImage'][0];
      const dbPath = `/${file.path.replace(/\\/g, '/')}`;
      if (existingAbout?.founder?.image) safeDeleteImage(existingAbout.founder.image);
      founder.image = dbPath;
    } else {
      founder.image = existingAbout?.founder?.image || "";
    }

    // ========================================================
    // 🟢 ۲. منطق جدید و هوشمند مدیریت عکس‌های تیم
    // ========================================================
    
    // الف) استخراج لیست عکس‌هایی که فرانت‌اند می‌گوید "اینها رو نگه دار"
    const incomingTeamImages = team.map(m => m.image).filter(Boolean);

    // ب) پیدا کردن عکس‌های یتیم (شخصی که کلاً حذف شده است) و پاک کردن آن‌ها از هارد
    if (existingAbout && existingAbout.team) {
      existingAbout.team.forEach(oldMember => {
        // اگر عکس قدیمی در لیست عکس‌های جدیدِ دریافتی نبود، یعنی شخص حذف شده است
        if (oldMember.image && !incomingTeamImages.includes(oldMember.image)) {
          safeDeleteImage(oldMember.image);
        }
      });
    }

    // ج) پردازش اعضای فعلی تیم (آپلود عکس جدید یا حفظ عکس قبلی)
    for (let i = 0; i < team.length; i++) {
      const fieldName = `teamImage_${i}`;
      
      if (req.files && req.files[fieldName]) {
        // اگر برای این شخص عکس جدیدی آپلود شده بود
        const file = req.files[fieldName][0];
        const dbPath = `/${file.path.replace(/\\/g, '/')}`;
        
        // اگر این شخص قبلاً عکسی داشت، عکس قدیمیش رو پاک کن
        if (team[i].image) {
          safeDeleteImage(team[i].image);
        }
        
        // عکس جدید رو براش ثبت کن
        team[i].image = dbPath;
      } 
      // اگر عکس جدیدی نیومد، نیازی به کار نیست، چون team[i].image 
      // همون مقدار درستی رو داره که فرانت‌اند فرستاده.
    }
    // ========================================================

    const updatedAbout = await About.findOneAndUpdate(
      {},
      { $set: { hero, story, coreValues, techStack, founder, team } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: "اطلاعات و تصاویر با موفقیت بروزرسانی شد." });
  } catch (error) {
    console.error("ارور اصلی کنترلر About:", error);
    next(error);
  }
};

module.exports = updateAbout;