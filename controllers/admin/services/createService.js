const Service = require("../../../models/service");

const createService = async (req, res, next) => {
  try {
    const { 
      title, slug, shortDescription, headerTitle, 
      headerSubtitle, installmentConfig, plans, isActive 
    } = req.body;

    if (!req.files || !req.files['serviceThumbnail']) {
      const error = new Error("آپلود عکس کاور خدمات الزامی است.");
      error.statusCode = 400;
      throw error;
    }
    
    const thumbnailUrl = "/" + req.files['serviceThumbnail'][0].path;

    const existingService = await Service.findOne({ slug });
    if (existingService) {
      const error = new Error("این آدرس (Slug) قبلاً استفاده شده است.");
      error.statusCode = 400;
      throw error;
    }

    let parsedInstallmentConfig = {};
    let parsedPlans = [];
    
    try {
      if (installmentConfig) parsedInstallmentConfig = JSON.parse(installmentConfig);
      if (plans) parsedPlans = JSON.parse(plans);
    } catch (parseError) {
      const error = new Error("فرمت دیتای اقساط یا پلن‌ها نامعتبر است.");
      error.statusCode = 400;
      throw error;
    }

    const newService = await Service.create({
      title, slug, shortDescription, thumbnailUrl, headerTitle, headerSubtitle,
      installmentConfig: parsedInstallmentConfig, plans: parsedPlans,
      isActive: isActive === 'true' || isActive === true
    });

    return res.status(201).json({ 
      success: true, 
      message: "خدمت جدید ایجاد شد.", 
      data: newService 
    });

  } catch (error) {
    if (error.name === 'ValidationError') error.statusCode = 400;
    next(error);
  }
};

module.exports = createService;