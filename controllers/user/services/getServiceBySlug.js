const Service= require("../../../models/service");

const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // پیدا کردن خدمت با استفاده از slug
    const service = await Service.findOne({ slug, isActive: true });

    if (!service) {


      const error = new Error("خدمت مورد نظر یافت نشد یا غیرفعال شده است." );
            error.statusCode = 404;
            throw error;
    }

    // به لطف Virtuals در Mongoose، مقادیر finalPrice و isDiscountActive
    // به صورت خودکار در خروجی res.json محاسبه و ارسال می‌شوند!
    return res.status(200).json({
      success: true,
      data: service
    });

  } catch (error) {
    next(error)
  }
};

module.exports = getServiceBySlug;