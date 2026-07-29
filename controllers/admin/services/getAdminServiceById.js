const Service = require("../../../models/service");

const getAdminServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    
    if (!service) {
      const error = new Error("خدمت مورد نظر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getAdminServiceById;