const Service = require("../../../models/service");
const fs = require("fs");
const path = require("path");

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      title, slug, shortDescription, headerTitle, 
      headerSubtitle, paymentTerms, plans, isActive , showOnHomePage
    } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      const error = new Error("خدمت مورد نظر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    if (slug && slug !== service.slug) {
      const existingService = await Service.findOne({ slug });
      if (existingService) {
        const error = new Error("این آدرس (Slug) قبلاً استفاده شده است.");
        error.statusCode = 400;
        throw error;
      }
    }

    let newThumbnailUrl = service.thumbnailUrl;
    if (req.files && req.files['serviceThumbnail']) {
      newThumbnailUrl = "/" + req.files['serviceThumbnail'][0].path;
      if (service.thumbnailUrl) {
        const oldPath = path.join(__dirname, "../../../", service.thumbnailUrl.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    let parsedpaymentTerms = service.paymentTerms;
    let parsedPlans = service.plans;
    try {
      if (paymentTerms) parsedpaymentTerms = JSON.parse(paymentTerms);
      if (plans) parsedPlans = JSON.parse(plans);
    } catch (parseError) {
      const error = new Error("فرمت دیتای فرم نامعتبر است.");
      error.statusCode = 400;
      throw error;
    }

    service.title = title || service.title;
    service.slug = slug || service.slug;
    service.shortDescription = shortDescription || service.shortDescription;
    service.headerTitle = headerTitle || service.headerTitle;
    service.headerSubtitle = headerSubtitle || service.headerSubtitle;
    service.thumbnailUrl = newThumbnailUrl;
    service.paymentTerms = parsedpaymentTerms;
    service.plans = parsedPlans;
    if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;
if (showOnHomePage !== undefined) {
  service.showOnHomePage = showOnHomePage === 'true' || showOnHomePage === true;
}
    const updatedService = await service.save();

    return res.status(200).json({ 
      success: true, 
      message: "بروزرسانی با موفقیت انجام شد.", 
      data: updatedService 
    });
  } catch (error) {
    if (error.name === 'ValidationError') error.statusCode = 400;
    next(error);
  }
};

module.exports = updateService;