const Portfolio = require("../../../models/portfolio");
const fs = require("fs");
const path = require("path");

/**
 * ویرایش اطلاعات یک نمونه‌کار یا مشتری موجود (توسط ادمین)
 */
const updatePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, linkUrl, description, isActive, order } = req.body;

    // جستجوی نمونه‌کار بر اساس ID
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      const error = new Error("نمونه‌کار یا مشتری مورد نظر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    // بررسی آپلود عکس جدید
    const file = req.files?.["portfolioImage"]?.[0];
    if (file) {
      const newImageUrl = "/" + file.path.replace(/\\/g, "/");

      // حذف عکس قبلی از روی دیسک در صورت وجود
      if (portfolio.imageUrl) {
        const oldImagePath = path.join(__dirname, "../../../", portfolio.imageUrl.replace(/^\//, ""));
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (unlinkErr) {
            console.error("خطا در حذف تصویر قدیمی:", unlinkErr);
          }
        }
      }

      portfolio.imageUrl = newImageUrl;
    }

    // بروزرسانی سایر فیلدها در صورت ارسال
    if (name !== undefined) portfolio.name = name.trim();
    if (linkUrl !== undefined) portfolio.linkUrl = linkUrl.trim();
    if (description !== undefined) portfolio.description = description.trim();
    if (order !== undefined) portfolio.order = Number(order);
    if (isActive !== undefined) portfolio.isActive = isActive === "true" || isActive === true;

    // ذخیره تغییرات در دیتابیس
    const updatedPortfolio = await portfolio.save();

    // بازگرداندن پاسخ موفقیت‌آمیز
    return res.status(200).json({
      success: true,
      message: "اطلاعات نمونه‌کار / مشتری با موفقیت بروزرسانی شد.",
      data: updatedPortfolio,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }
    next(error);
  }
};

module.exports = updatePortfolio;
