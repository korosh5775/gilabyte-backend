const User = require("../../../models/usersSchema");

/**
 * @route   PATCH /admin/users/:userId/status
 * @desc    به‌روزرسانی وضعیت (فعال/غیرفعال) یک کاربر خاص توسط ادمین
 * @access  Private (فقط ادمین)
 * @body    { "status": "active" | "inactive" }
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params; // شناسه کاربر از پارامترهای URL
    const { status } = req.body;   // وضعیت جدید (active یا inactive) از بدنه درخواست

    // اعتبارسنجی ورودی: بررسی می‌کنیم که status ارسال شده معتبر باشد
    if (!status || !['active', 'inactive'].includes(status)) {
      const error = new Error("وضعیت ارسالی نامعتبر است. وضعیت باید 'active' یا 'inactive' باشد.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    // پیدا کردن کاربر مورد نظر با استفاده از شناسه
    const user = await User.findById(userId);

    // بررسی اینکه کاربر با شناسه داده شده وجود دارد یا خیر
    if (!user) {
      const error = new Error("کاربر با شناسه مشخص شده یافت نشد.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    // جلوگیری از تغییر وضعیت کاربر توسط خودش (اگر این کاربر همان ادمین لاگین شده باشد)
    // این یک لایه امنیتی اضافی است.
    if (req.user && req.user._id.toString() === userId.toString()) {
      const error = new Error("شما نمی‌توانید وضعیت فعال/غیرفعال بودن خود را تغییر دهید.");
      error.statusCode = 403; // Forbidden
      throw error;
    }

    // به‌روزرسانی فیلد status
    user.status = status;

    // ذخیره تغییرات در پایگاه داده
    const updatedUser = await user.save();

    // ارسال پاسخ موفقیت‌آمیز به همراه اطلاعات به‌روز شده کاربر
    res.status(200).json({
      message: `وضعیت کاربر با موفقیت به '${status}' تغییر یافت.`,
      user: updatedUser,
    });

  } catch (error) {
    // ارسال خطا به میدل‌ویر مدیریت خطای مرکزی
    next(error);
  }
};



/**
 * @route   GET /admin/users/:userId
 * @desc    دریافت جزئیات یک کاربر خاص توسط ادمین
 * @access  Private (فقط ادمین)
 */
const getUser = async (req, res, next) => {

  try {
    const { userId } = req.params; // دریافت شناسه کاربر از پارامترهای URL
    console.log("درخوست ارسال شد");

    // پیدا کردن کاربر مورد نظر در پایگاه داده با استفاده از شناسه
    const user = await User.findById(userId);

    // بررسی اینکه کاربر با شناسه داده شده وجود دارد یا خیر
    if (!user) {
      const error = new Error("کاربر با شناسه مشخص شده یافت نشد.");
      error.statusCode = 404; // کد خطا 404 به معنی Not Found
      throw error;
    }

    // ارسال پاسخ موفقیت‌آمیز به همراه اطلاعات کاربر
    res.status(200).json(user);

  } catch (error) {
    // ارسال خطا به میدل‌ویر مدیریت خطای مرکزی
    next(error);
  }
};



/**
 * @route   PATCH /admin/users/:userId/role
 * @desc    تغییر نقش کاربر به ادمین یا کاربر عادی
 * @access  Private (فقط مالک)
 * @body    { "role": "admin" | "user" }
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // ۰. بررسی اینکه درخواست‌دهنده حتما مالک باشد (لایه امنیتی اضافی)
    if (!req.user || req.user.role !== 'owner') {
      const error = new Error("فقط مالک سایت مجاز به تغییر نقش کاربران است.");
      error.statusCode = 403;
      throw error;
    }

    // اعتبارسنجی نقش جدید (جلوگیری از ارتقا به owner طبق محدودیت پنل)
    if (!role || !['admin', 'user'].includes(role)) {
      const error = new Error("نقش ارسالی نامعتبر است. نقش باید 'admin' یا 'user' باشد.");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("کاربر با شناسه مشخص شده یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    // ۱. مالک نمی‌تواند نقش خودش را تغییر دهد
    if (req.user && req.user._id.toString() === userId.toString()) {
      const error = new Error("شما نمی‌توانید نقش خود را تغییر دهید.");
      error.statusCode = 403;
      throw error;
    }

    // ۲. مالک نمی‌تواند نقش یک مالک دیگر را تغییر دهد
    if (user.role === 'owner') {
      const error = new Error("شما نمی‌توانید نقش یک مالک دیگر را تغییر دهید.");
      error.statusCode = 403;
      throw error;
    }

    user.role = role;
    const updatedUser = await user.save();

    res.status(200).json({
      message: `نقش کاربر با موفقیت به '${role}' تغییر یافت.`,
      user: updatedUser,
    });

  } catch (error) {
    next(error);
  }
};

// خروجی گرفتن از توابع جدید برای استفاده در فایل روت
module.exports = {
  updateUserStatus,
  getUser,
  changeUserRole
};
