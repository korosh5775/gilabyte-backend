const Portfolio = require("../../../models/portfolio");

/**
 * دریافت اطلاعات تکی یک نمونه‌کار یا مشتری با استفاده از ID (توسط ادمین)
 */
const getPortfolioById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // جستجو در دیتابیس با شناسه
    const portfolio = await Portfolio.findById(id);

    // اگر آیتمی پیدا نشد
    if (!portfolio) {
      const error = new Error("نمونه‌کار یا مشتری مورد نظر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    // بازگرداندن پاسخ موفقیت
    return res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getPortfolioById;
