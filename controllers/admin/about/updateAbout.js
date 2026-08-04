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
    const team = parsedData.team || []; // آرایه تیم

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
        console.error("خطا در حذف عکس قدیمی:", err.message);
      }
    };

    // 🟢 بررسی و ذخیره عکس بنیان‌گذار
    if (req.files && req.files['founderImage']) {
      const file = req.files['founderImage'][0];
      const dbPath = `/${file.path.replace(/\\/g, '/')}`;
      if (existingAbout?.founder?.image) safeDeleteImage(existingAbout.founder.image);
      founder.image = dbPath;
    } else {
      founder.image = existingAbout?.founder?.image || "";
    }

    // 🟢 بررسی و ذخیره عکس‌های تیم
    for (let i = 0; i < team.length; i++) {
      const fieldName = `teamImage_${i}`;
      if (req.files && req.files[fieldName]) {
        const file = req.files[fieldName][0];
        const dbPath = `/${file.path.replace(/\\/g, '/')}`;
        // اگر این همکار قبلاً عکس داشته، عکس قدیمی رو پاک کن
        if (existingAbout?.team?.[i]?.image) safeDeleteImage(existingAbout.team[i].image);
        team[i].image = dbPath;
      } else {
        // اگر عکس جدیدی نیومد، همون قبلی رو نگه دار
        team[i].image = existingAbout?.team?.[i]?.image || "";
      }
    }

    const updatedAbout = await About.findOneAndUpdate(
      {},
      { $set: { hero, story, coreValues, techStack, founder, team } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: "اطلاعات و تصاویر با موفقیت بروزرسانی شد." });
  } catch (error) {
    console.error("ارور اصلی کنترلر About:", error); // برای دیباگ در ترمینال
    next(error);
  }
};

module.exports = updateAbout;