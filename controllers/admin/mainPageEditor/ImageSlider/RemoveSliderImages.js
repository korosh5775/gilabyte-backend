const fs = require("fs");
const path = require("path");
const SliderImages = require("../../../../models/sliderImagesSchema");

const RemoveSliderImages = async (req, res, next) => {
  try {
    const { index } = req.params; // ایندکس تصویری که باید حذف بشه

    if (!["0", "1", "2"].includes(index)) {
      const err = new Error("ایندکس نامعتبر است. فقط مقادیر 0، 1 و 2 مجاز هستند.");
      err.statusCode = 400;
      throw err;
    }

    const sliderDoc = await SliderImages.findOne();
    if (!sliderDoc || !sliderDoc.images[index]) {
      const err = new Error("تصویری در این ایندکس وجود ندارد.");
      err.statusCode = 404;
      throw err;
    }

    // مسیر فایل تصویر
    const filePath = path.join(__dirname, "../../../", sliderDoc.images[index]);

    // حذف فایل فیزیکی به صورت غیرهمزمان
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath); // حذف فایل به صورت غیرهمزمان
      }
    } catch (fileErr) {
      const err = new Error("مشکلی در حذف فایل پیش آمده است.");
      err.statusCode = 500;
      throw err;
    }

    // حذف تصویر از دیتابیس
    sliderDoc.images[index] = null;
    await sliderDoc.save();

    res.status(200).json({ success: true, message: `تصویر شماره ${index} با موفقیت حذف شد.` });
  } catch (err) {
    next(err);  // ارسال خطا به میدل‌ویرهای بعدی
  }
};

module.exports =  RemoveSliderImages ;
