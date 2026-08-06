// controllers/banner/getBanner.js
const Banner = require("../../../models/banner");

const getBanner = async (req, res, next) => {
  try {
    let bannerData = await Banner.findOne();

    if (!bannerData) {
      bannerData = await Banner.create({});
    }

    return res.status(200).json({
      success: true,
      data: bannerData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getBanner;