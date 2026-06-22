const User = require('../../../models/usersSchema');

const getUserDetails = async (req, res, next) => {
  try {
    const phoneNumber = req.user.phoneNumber; // از توکن استخراج‌شده
    const user = await User.findOne({ phoneNumber }).select("-__v -password");

    if (!user) {
      const error = new Error("کاربری با این مشخصات یافت نشد");
      error.status = 404;
      throw error;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};


module.exports = getUserDetails;
