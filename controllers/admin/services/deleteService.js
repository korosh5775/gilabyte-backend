const Service = require("../../../models/service");
const fs = require("fs");
const path = require("path");

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findById(id);
    if (!service) {
      const error = new Error("خدمت مورد نظر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    // پاک کردن عکس از هارد سرور
    if (service.thumbnailUrl) {
      const imgPath = path.join(__dirname, "../../../", service.thumbnailUrl.replace(/^\//, ''));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Service.findByIdAndDelete(id);
    
    return res.status(200).json({ 
      success: true, 
      message: "خدمت با موفقیت حذف شد." 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = deleteService;