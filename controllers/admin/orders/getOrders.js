// بک‌اند: controllers/admin/orders/getOrders.js
const Order = require("../../../models/order");

const getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query; // گرفتن page و limit
    
    let filter = {};

    if (status && status !== 'all') filter.status = status;
    if (search) filter.phoneNumber = { $regex: search, $options: 'i' };

    // تبدیل به عدد صحیح
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // اجرای همزمان دو کوئری (گرفتن دیتا + گرفتن تعداد کل برای محاسبه صفحات)
    const [orders, totalOrders] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalOrders / limitNum);

    return res.status(200).json({ 
      success: true, 
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getOrders;