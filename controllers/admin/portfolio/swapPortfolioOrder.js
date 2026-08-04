const Portfolio = require("../../../models/portfolio");

/**
 * جابجایی ترتیب دو نمونه‌کار در دیتابیس (توسط ادمین)
 */
const swapPortfolioOrder = async (req, res, next) => {
  try {
    const { firstId, firstOrder, secondId, secondOrder } = req.body;

    if (!firstId || !secondId) {
      const error = new Error("شناسه‌های نمونه‌کار برای جابجایی ارسال نشده است.");
      error.statusCode = 400;
      throw error;
    }

    await Promise.all([
      Portfolio.findByIdAndUpdate(firstId, { order: Number(firstOrder) }),
      Portfolio.findByIdAndUpdate(secondId, { order: Number(secondOrder) })
    ]);

    return res.status(200).json({
      success: true,
      message: "ترتیب نمونه‌کارها با موفقیت جابجا شد.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = swapPortfolioOrder;
