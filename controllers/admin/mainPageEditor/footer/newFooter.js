const Footer = require("../../../../models/footerSchema");

const newFooter = async (req, res, next) => {
  try {
    const existingFooter = await Footer.findOne();
    if (existingFooter) {
      const error = new Error("اطلاعات فوتر قبلاً ثبت شده است");
      error.statusCode = 400;
      throw error;
    }

    const {
      shopName,
      phoneNumber,
      shopAddress,
      shopDescription,
      socialMedia1,
      socialMedia2,
      socialMedia3,
      socialMedia4,
      standardSymbolAddress,
      trustSymbolAddress, 
    } = req.body;

    if (!req.files?.brandImage || !req.files.brandImage[0]) {
      const error = new Error("تصویر برند الزامی است");
      error.statusCode = 400;
      return next(error);
    }

    const brandImage = `/images/footer/costum/brandImage/${req.files.brandImage[0].filename}`;
    const standardSymbolImage = `/images/footer/costum/symbolImage/${req.files.standardSymbolImage?.[0]?.filename || ""}`;
    const trustSymbolImage = `/images/footer/costum/symbolImage/${req.files.trustSymbolImage?.[0]?.filename || ""}`;

    const footer = await Footer.create({
      brandImage,
      shopName,
      phoneNumber,
      shopAddress,
      shopDescription,
      socialMedia1,
      socialMedia2,
      socialMedia3,
      socialMedia4,
      standardSymbolAddress,
      trustSymbolAddress,
      standardSymbolImage,
      trustSymbolImage,
    });

    res.status(201).json(footer);
  } catch (error) {
    next(error);
  }
};

module.exports = newFooter;

