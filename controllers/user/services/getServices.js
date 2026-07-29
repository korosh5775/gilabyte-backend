const Service= require("../../../models/service");

const getServices = async (req, res, next) => {
  try {
    // گرفتن تمام خدماتی که isActive آنها true است (خدمات مخفی شده را نمی‌آوریم)
    // با استفاده از select فقط فیلدهای مورد نیاز کارت صفحه اصلی را می‌گیریم تا API فوق‌العاده سریع (Fast) باشد
    const services = await Service.find({ isActive: true })
      .select("title slug shortDescription thumbnailUrl createdAt")
      .sort({ createdAt: -1 }); // مرتب‌سازی بر اساس جدیدترین

    if (!services) {
      const error = new Error("خدماتی یافت نشد");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getServices