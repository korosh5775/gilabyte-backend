const Order = require("../../../models/order");

const createOrder = async (req, res, next) => {
  try {
    const user = req.user; 
    const { city, preferredTime, serviceTitle, planName,paymentType, referralCode } = req.body;

    if (!serviceTitle || !planName) {
      const error = new Error("اطلاعات سرویس ناقص است.");
      error.statusCode = 400;
      throw error;
    }
    // 🟢 جستجو: آیا این کاربر برای این سرویس، یک سفارش "در انتظار تماس" دارد؟
    const existingOrder = await Order.findOne({
      userId: user._id,
      serviceTitle: serviceTitle,
      status: 'pending' // <--- جادوی کار اینجاست! فقط اگر pending بود پیداش کن
    });

    if (existingOrder) {
      // ----------------------------------------------------
      // حالت اول: کاربر قبلاً برای این سرویس درخواست داده بود
      // ----------------------------------------------------
      
      existingOrder.planName = planName; // جایگزینی پلن جدید
      if (city) existingOrder.city = city; // آپدیت شهر
      if (preferredTime) existingOrder.preferredTime = preferredTime; // آپدیت زمان
      
      // نکته مهم: وضعیت را دوباره روی pending (در انتظار) می‌گذاریم
      // تا اگر ادمین قبلاً تماس گرفته بود، متوجه شود کاربر پلن جدیدی انتخاب کرده است
      existingOrder.status = 'pending'; 

      await existingOrder.save();

      // (اختیاری) کد ارسال پیامک به ادمین برای آپدیت سفارش

      return res.status(200).json({
        success: true,
        message: "درخواست شما بروزرسانی شد. پلن جدید جایگزین درخواست قبلیِ شما برای این خدمت گردید.",
      });

    } else {
      // ----------------------------------------------------
      // حالت دوم: این اولین درخواست کاربر برای این سرویس است
      // ----------------------------------------------------
      
      await Order.create({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        city,
        preferredTime,
        serviceTitle,
        planName,
        paymentType,
        referralCode,
        userId: user._id 
      });

      // (اختیاری) کد ارسال پیامک به ادمین برای سفارش جدید

      return res.status(201).json({
        success: true,
        message: "درخواست شما با موفقیت ثبت شد. به زودی برای مشاوره تماس می‌گیریم.",
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = createOrder;