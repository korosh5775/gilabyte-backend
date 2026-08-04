const Order = require("../../../models/order");

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'contacted', 'canceled', 'success'];
    if (!validStatuses.includes(status)) {
      const error = new Error("وضعیت نامعتبر است.");
      error.statusCode = 400;
      throw error;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { status }, 
      { new: true } // برگرداندن داکیومنت آپدیت شده
    );

    if (!updatedOrder) {
      const error = new Error("سفارش یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({ success: true, message: "وضعیت سفارش بروزرسانی شد." });
  } catch (error) {
    next(error);
  }
};

module.exports = updateOrderStatus;