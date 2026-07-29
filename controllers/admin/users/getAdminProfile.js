// چون میدلور authenticated.js قبلاً کاربر را در دیتابیس پیدا کرده است،
// ما اینجا فقط کافیست req.user را به عنوان جواب (Response) برگردانیم!

const getAdminProfile = async (req, res, next) => {
  try {
    // گرفتن اطلاعات ادمین که توسط میدلور در req قرار داده شده
    const user = req.user;

    // ارسال پاسخ به فرانت‌اند
    return res.status(200).json({
      success: true,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      _id: user._id
    });

  } catch (error) {
    next(error);
  }
};

module.exports = getAdminProfile;