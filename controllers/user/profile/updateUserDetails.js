const User = require("../../../models/usersSchema");
const jwt = require("jsonwebtoken");

const updateUserDetails = async (req, res, next) => {
  try {
    const phoneNumber = req.user.phoneNumber;

    // فقط اطلاعات مجاز رو از بدنه درخواست بگیر
    const { fullName, birthDate } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: "کاربر پیدا نشد" });
    }

    // به‌روزرسانی فیلدها
    if (fullName) user.fullName = fullName;


    // منطق محدودیت ویرایش تاریخ تولد
    if (birthDate) {
      // اگر تاریخ تولد جدید با قبلی متفاوت باشد (یا قبلاً ست نشده باشد)
      const newDate = new Date(birthDate);
      if (!user.birthDate || user.birthDate.getTime() !== newDate.getTime()) {

        // اگر کاربر قبلاً ۳ بار یا بیشتر ویرایش کرده باشد
        if (user.birthDateUpdatesCount >= 3) {
          return res.status(403).json({
            success: false,
            message: "شما بیش از حد مجاز تاریخ تولد خود را تغییر داده‌اید و دیگر امکان تغییر آن را ندارید."
          });
        }

        user.birthDate = newDate;
        user.birthDateUpdatesCount = (user.birthDateUpdatesCount || 0) + 1;
      }
    }

    await user.save();

    // ساخت توکن جدید
    const newToken = jwt.sign(
      {
        userId: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "اطلاعات با موفقیت ذخیره شد",
      user: {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        birthDate: user.birthDate,
      },
      token: newToken,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = updateUserDetails;
