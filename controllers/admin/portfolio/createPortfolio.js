const Portfolio = require("../../../models/portfolio");

/**
 * ایجاد نمونه‌کار یا مشتری جدید در سیستم (توسط ادمین)
 */
const createPortfolio = async (req, res, next) => {
  try {
    const { name, linkUrl, description, isActive, order } = req.body;

    // بررسی الزامی بودن نام
    if (!name || !name.trim()) {
      const error = new Error("وارد کردن نام مشتری یا نمونه‌کار الزامی است.");
      error.statusCode = 400;
      throw error;
    }

    // بررسی آپلود فایل تصویر توسط Multer
    const file = req.files?.["portfolioImage"]?.[0];
    if (!file) {
      const error = new Error("آپلود تصویر برای نمونه‌کار الزامی است.");
      error.statusCode = 400;
      throw error;
    }

    // تنظیم مسیر تصویر در دیتابیس (جایگزینی اسلش برای مسیر وب)
    const imageUrl = "/" + file.path.replace(/\\/g, "/");

    // ایجاد سند جدید در دیتابیس
    const newPortfolio = await Portfolio.create({
      name: name.trim(),
      imageUrl,
      linkUrl: linkUrl ? linkUrl.trim() : "",
      description: description ? description.trim() : "",
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive === "true" || isActive === true,
    });

    // بازگرداندن پاسخ موفقیت‌آمیز
    return res.status(201).json({
      success: true,
      message: "نمونه‌کار / مشتری جدید با موفقیت ثبت شد.",
      data: newPortfolio,
    });
  } catch (error) {
    // هندلینگ خطای اعتبارپردازی Mongoose
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }
    // انتقال خطا به میدل‌ور مرکزی مدیریت خطاها
    next(error);
  }
};

module.exports = createPortfolio;
