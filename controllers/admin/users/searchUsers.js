// فراخوانی مدل کاربران برای استفاده در پایگاه داده
const User = require("../../../models/usersSchema"); // مسیر مدل کاربران را بررسی کنید

// کنترلر اصلی برای جستجوی کاربران
const searchUsers = async (req, res) => {
  try {
    // دریافت پارامترهای جستجو از طریق query string
    const {
      keyword = "",        // جستجو بر اساس نام کامل، شماره تلفن یا ایمیل
      status = "",         // فیلتر بر اساس وضعیت کاربر (active/inactive)
      isAdmin,             // فیلتر بر اساس نقش ادمین (true/false)
      sortBy = "newest",   // نوع مرتب‌سازی: جدیدترین، نام، و ...
      page = 1,            // شماره صفحه (برای صفحه‌بندی)
      limit = 20,          // تعداد کاربران در هر صفحه
    } = req.query;

    console.log("🟢 بک‌اند: ریکوئست جستجوی کاربران دریافت شد!");
    console.log("🟢 بک‌اند: کوئری‌های دریافتی:", req.query);

    
    // ساختن یک آبجکت فیلتر برای استفاده در کوئری نهایی
    const filter = {};

    // 🔎 جستجو بر اساس کلمه کلیدی (نام کامل، شماره تلفن، ایمیل)
    if (keyword) {
      const searchRegex = { $regex: keyword, $options: "i" };
      // استفاده از $or برای جستجو در چندین فیلد
      filter.$or = [
        { fullName: searchRegex },
        { phoneNumber: searchRegex },
        { email: searchRegex }, // اگر فیلد email در UsersSchema دارید
      ];
    }

    // 👤 اعمال فیلتر بر اساس وضعیت کاربر
    if (status) {
      const allowedStatuses = ["active", "inactive"];
      if (allowedStatuses.includes(status)) {
        filter.status = status;
      } else {
        console.warn(`WARN: Invalid user status filter received: ${status}`);
      }
    }

    // 👑 اعمال فیلتر بر اساس نقش ادمین
    // 'isAdmin' ممکن است به صورت رشته 'true' یا 'false' دریافت شود
    if (isAdmin !== undefined) {
      if (isAdmin === 'true') {
        filter.isAdmin = true;
      } else if (isAdmin === 'false') {
        filter.isAdmin = false;
      }
      // در غیر این صورت، اگر مقدار نامعتبر بود، فیلتر را اعمال نمی‌کنیم.
      // می‌توانید اینجا هم یک warning/error اضافه کنید.
    }

    // 📊 تعیین نوع مرتب‌سازی نتایج
    let sort = {};
    switch (sortBy) {
      case "fullName":      // بر اساس نام کامل (الفبایی)
        sort.fullName = 1;
        break;
      case "createdAtAsc":  // قدیمی‌ترین به جدیدترین
        sort.createdAt = 1;
        break;
      default:              // پیش‌فرض: جدیدترین (createdAtDesc یا newest)
        sort.createdAt = -1;
        break;
    }

    // 📃 محاسبه صفحه‌بندی
    const skip = (parseInt(page) - 1) * parseInt(limit); // چند کاربر باید رد بشن

    // استفاده از Promise.all برای اجرای همزمان دو کوئری:
    // یکی برای دریافت کاربران با فیلتر و مرتب‌سازی
    // یکی برای شمارش کل نتایج فیلتر شده جهت استفاده در صفحه‌بندی
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -__v -resetPasswordToken -resetPasswordExpire') // فیلدهای حساس را حذف کنید
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    // ارسال پاسخ نهایی به فرانت اند
    res.status(200).json({
      success: true,               // عملیات موفق بوده
      total,                       // مجموع کاربران یافت شده
      page: parseInt(page),        // شماره صفحه فعلی
      totalPages: Math.ceil(total / limit), // تعداد کل صفحات
      users,                       // لیست کاربران
    });
  } catch (err) {
    // مدیریت خطاها و ارسال پیام خطای کاربرپسند به فرانت اند
    console.error("🔴 خطا در جستجوی کاربران:", err);
    res.status(500).json({
      success: false,
      message: "خطا در انجام جستجوی کاربران. لطفاً مجدداً تلاش کنید.",
    });
  }
};

// خروجی گرفتن از ماژول برای استفاده در فایل روت
module.exports = searchUsers;
