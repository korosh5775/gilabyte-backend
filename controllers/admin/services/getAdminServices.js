const Service = require("../../../models/service");

const getAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    if (!services || services.length === 0) {
      const error = new Error("هیچ خدمتی یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getAdminServices;