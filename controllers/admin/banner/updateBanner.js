// controllers/banner/updateBanner.js
const Banner = require("../../../models/banner");
const fs = require("fs");
const path = require("path");

const updateBanner = async (req, res, next) => {
  try {
    const parsedData = req.body.payload ? JSON.parse(req.body.payload) : {};
    const { title, highlightWord, subtitle } = parsedData;

    const existingBanner = await Banner.findOne();

    // 🟢 تابع امن برای پاک کردن عکس قدیمی
    const safeDeleteImage = (imageUrl) => {
      if (!imageUrl) return;
      try {
        const absolutePath = path.join(process.cwd(), imageUrl);
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error("خطا در حذف عکس بنر:", err.message);
      }
    };

    // آبجکتی که قرار است در دیتابیس آپدیت شود
    let updateData = { title, highlightWord, subtitle };

    // 🟢 بررسی و ذخیره عکس حالت روشن
    if (req.files && req.files['bannerImageLight']) {
      const file = req.files['bannerImageLight'][0];
      const dbPath = `/${file.path.replace(/\\/g, '/')}`;
      if (existingBanner?.imageLight) safeDeleteImage(existingBanner.imageLight);
      updateData.imageLight = dbPath;
    }

    // 🟢 بررسی و ذخیره عکس حالت تاریک
    if (req.files && req.files['bannerImageDark']) {
      const file = req.files['bannerImageDark'][0];
      const dbPath = `/${file.path.replace(/\\/g, '/')}`;
      if (existingBanner?.imageDark) safeDeleteImage(existingBanner.imageDark);
      updateData.imageDark = dbPath;
    }

    const updatedBanner = await Banner.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ 
      success: true, 
      message: "بنر صفحه اصلی با موفقیت بروزرسانی شد." 
    });
  } catch (error) {
    console.error("ارور اصلی کنترلر Banner:", error);
    next(error);
  }
};

module.exports = updateBanner;