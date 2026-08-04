const Portfolio = require("../../../models/portfolio");
const fs = require("fs");
const path = require("path");

/**
 * حذف یک نمونه‌کار یا مشتری از سیستم (توسط ادمین)
 */
const deletePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;

    // پیدا کردن آیتم در دیتابیس
    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      const error = new Error("نمونه‌کار یا مشتری مورد نظر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    // حذف عکس مربوطه از دیسک
    if (portfolio.imageUrl) {
      const imagePath = path.join(__dirname, "../../../", portfolio.imageUrl.replace(/^\//, ""));
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkErr) {
          console.error("خطا در حذف تصویر:", unlinkErr);
        }
      }
    }

    // حذف سند از دیتابیس
    await Portfolio.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "نمونه‌کار / مشتری با موفقیت حذف شد.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = deletePortfolio;
