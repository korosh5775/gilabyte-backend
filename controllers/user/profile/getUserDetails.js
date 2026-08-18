const User = require('../../../models/usersSchema');
const Ticket = require('../../../models/ticket'); // 🟢 ایمپورت مدل تیکت

const getUserDetails = async (req, res, next) => {
  try {
    const phoneNumber = req.user.phoneNumber;
    const user = await User.findOne({ phoneNumber }).select("-__v -password");
console.log(`user is ${user}`);
    if (!user) {
      const error = new Error("کاربری با این مشخصات یافت نشد");
      error.status = 404;
      throw error;
    }

    // 🟢 بررسی سریع وجود پیام خوانده‌نشده برای کاربر (بسیار بهینه با exists)
    const hasUnreadUserMessage = await Ticket.exists({
      userId: user._id,
      hasUnreadUserMessage: true
    });

    // 🟢 ارسال اطلاعات کاربر همراه وضعیت پیام‌های خوانده نشده
    res.json({
      ...user.toObject(),
      hasUnreadUserMessage: Boolean(hasUnreadUserMessage)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getUserDetails;
