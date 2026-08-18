const Footer = require("../../../models/footerSchema");

//api: "/users/footer"
const getFooter = async (req, res, next) => {
  try {
    const footer = await Footer.findOne(); 
    if (!footer) {
      const error = new Error("Footer not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(footer);
  } catch (error) {
    next(error);
  }
};

module.exports = getFooter;
 