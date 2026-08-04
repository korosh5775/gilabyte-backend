// controllers/about/getAbout.js
const About = require("../../../models/about");

const getAbout = async (req, res, next) => {
  try {
    // چون فقط یک داکیومنت داریم، اولین مورد را می‌گیریم
    let aboutData = await About.findOne();

    // اگر برای اولین بار است و هنوز چیزی در دیتابیس نیست، یک داکیومنت خالی با مقادیر پیش‌فرض می‌سازیم
    if (!aboutData) {
      aboutData = await About.create({});
    }

    return res.status(200).json({
      success: true,
      data: aboutData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getAbout;