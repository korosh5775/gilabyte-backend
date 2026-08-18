const setting = require("../../../models/setting");



// [GET] گرفتن اطلاعات کارت
exports.getBankInfo = async (req, res, next) => {
  try {
    // چون فقط یک داکیومنت تنظیمات داریم، نیازی به آیدی نیست و اولین مورد رو پیدا می‌کنیم
    let settings = await setting.findOne();
    
    // اگر هنوز تنظیماتی تو دیتابیس ساخته نشده بود، دیتای خالی می‌فرستیم که فرانت‌اند کرش نکنه
    if (!settings) {
      settings = { bankCard: { cardNumber: "", cardHolderName: "" } };
    }

    return res.status(200).json({
      success: true,
      message: "اطلاعات کارت دریافت شد",
      data: settings
    });
  } catch (error) {
    console.error("Error in getBankInfo:", error);
next(error); // ارسال خطا به middleware بعدی برای مدیریت
}
};