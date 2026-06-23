const Footer = require("../../../../models/footerSchema");

const newFooter = async (req, res, next) => {
  console.log("new footer called")
  try {
    const existingFooter = await Footer.findOne();
    if (existingFooter) {
      const error = new Error("اطلاعات فوتر قبلاً ثبت شده است");
      error.statusCode = 400;
      throw error;
    }

    const {
      groupName,
      phoneNumber,
      address,
      description,
      socialMedia1,
      socialMedia2,
      socialMedia3,
      socialMedia4,
    } = req.body;

    const logo = (req.files?.logo && req.files.logo[0]) 
      ? `/images/footer/costum/brandImage/${req.files.logo[0].filename}`
      : null;

    const footer = await Footer.create({
      logo,
      groupName,
      phoneNumber,
      address,
      description,
      socialMedia1,
      socialMedia2,
      socialMedia3,
      socialMedia4,
    });

    res.status(201).json(footer);
  } catch (error) {
    next(error);
  }
};

module.exports = newFooter;
