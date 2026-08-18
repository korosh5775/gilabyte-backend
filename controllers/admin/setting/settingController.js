const Setting = require('../../../models/setting');



// [PUT] ویرایش اطلاعات کارت (مخصوص ادمین)
exports.updateBankInfo = async (req, res, next) => {
  try {
    const { cardNumber, cardHolderName } = req.body;

    // نکته طلایی اینجاست: upsert: true
    // یعنی اگر تنظیمات وجود داشت آپدیت کن، اگر نبود همون لحظه یکی بساز!
    const updatedSettings = await Setting.findOneAndUpdate(
      {}, // فیلتر خالی یعنی همون داکیومنت اول رو بگیر
      { 
        $set: { 
          "bankCard.cardNumber": cardNumber, 
          "bankCard.cardHolderName": cardHolderName 
        } 
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "اطلاعات کارت با موفقیت ذخیره شد",
      data: updatedSettings
    });
  } catch (error) {
    console.error("Error in updateBankInfo:", error);
next(error); // ارسال خطا به middleware بعدی برای مدیریت
}
};