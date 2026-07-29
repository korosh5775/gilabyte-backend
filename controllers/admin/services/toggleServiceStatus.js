const Service = require("../../../models/service");

const toggleServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findById(id);
    if (!service) {
      const error = new Error("خدمت مورد نظر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    service.isActive = !service.isActive;
    await service.save();

    return res.status(200).json({
      success: true,
      message: `خدمت با موفقیت ${service.isActive ? 'فعال' : 'غیرفعال'} شد.`,
      isActive: service.isActive
    });
  } catch (error) {
    next(error);
  }
};

module.exports = toggleServiceStatus;