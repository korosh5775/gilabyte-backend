const Portfolio = require("../../../models/portfolio");

/**
 * دریافت لیست همگی مشتریان و نمونه‌کارها (مورد استفاده در بخش shared برای فرانت و ادمین)
 */
const getPortfolios = async (req, res, next) => {
  try {
    const filter = {};

    // اگر درخواست شامل activeOnly باشد، فقط آیتم‌های فعال برمی‌گردند
    if (req.query.activeOnly === "true") {
      filter.isActive = true;
    }

    // استخراج تمامی نمونه‌کارها از دیتابیس به ترتیب مشخص شده (order سپس createdAt)
    const portfolios = await Portfolio.find(filter).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getPortfolios;
