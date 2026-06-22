const SliderImage = require("../../../../models/sliderImagesSchema");
const fs = require("fs");
const path = require("path");

const updateSliderImages = async (req, res) => {
  try {
    // فقط یک رکورد داریم
    const images = await SliderImage.findOne({});
    if (!images) {
      console.error("رکورد تصاویر اسلایدر یافت نشد.");
      return res.status(404).json({ message: "Image slider record not found." });
    }

    // پردازش تصاویر حذف شده
    const deletedImages = req.body.deletedImages
      ? JSON.parse(req.body.deletedImages)
      : [];
    const imageFields = ["sliderImageOne", "sliderImageTwo", "sliderImageThree"]; // نام فیلدها

    // 1. حذف فیزیکی فایل‌های قدیمی و null کردن فیلدها در آبجکت images
    deletedImages.forEach((imageField) => {
      if (imageFields.includes(imageField)) { // اطمینان از معتبر بودن نام فیلد
        const oldImagePath = images[imageField]; // مسیر ذخیره شده در دیتابیس (مثلا /images/sliders/old.jpg)
        if (oldImagePath) {
           // ساخت مسیر کامل فایل فیزیکی برای حذف
           // توجه: مسیر پایگاه باید درست تنظیم شود
           const fullPath = path.join(__dirname, "../../../../", oldImagePath); // فرض بر اینکه مسیر ذخیره شده از ریشه پروژه است

          console.log("در حال تلاش برای حذف تصویر قدیمی:", fullPath);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
              console.log("تصویر قدیمی حذف شد:", oldImagePath);
            } catch (unlinkErr) {
               console.error("خطا در حذف فایل:", unlinkErr);
               // ادامه دهید حتی اگر حذف ناموفق بود، اما فیلد را null کنید
            }
          } else {
            console.log("فایل قدیمی برای حذف یافت نشد:", fullPath);
          }
           // فیلد مربوطه را در آبجکت images برابر null قرار دهید تا برای آپدیت آماده شود
           images[imageField] = null;
        }
      }
    });

    // 2. پردازش فایل‌های جدید آپلود شده
    const newFiles = req.files || {}; // فایل‌های آپلود شده توسط multer

    // بررسی هر فیلد ممکن برای تصویر
    for (const field of imageFields) {
       // آیا فایل جدیدی برای این فیلد آپلود شده؟
       if (newFiles[field] && newFiles[field][0]) {
         const newFile = newFiles[field][0];
         // ساخت مسیر ذخیره‌سازی نسبی برای دیتابیس
         // (مثلا /images/sliders/new-image.jpg)
         // این مسیر بستگی به تنظیمات multer شما دارد
         // فرض می‌کنیم multer فایل‌ها را در 'images/sliders' ذخیره کرده
         const relativePath = `/images/sliders/${newFile.filename}`; // یا newFile.path بسته به multer

         console.log(`به‌روزرسانی فیلد ${field} با مسیر: ${relativePath}`);
         images[field] = relativePath; // به‌روزرسانی فیلد در آبجکت images
       } else if (!images[field] && !deletedImages.includes(field)) {
           // اگر فایل جدیدی برای این فیلد نیامده و قبلا هم مقداری نداشته (یا حذف نشده)
           // اطمینان حاصل کنید که null باقی بماند (هرچند باید از مرحله قبل null شده باشد اگر حذف شده بود)
           // images[field] = null; // معمولا لازم نیست اگر منطق حذف درست باشد
       }
    }


    // 3. ذخیره تغییرات در دیتابیس
    await images.save();

    // ارسال پاسخ موفقیت آمیز
    res.status(200).json({
      message: "تصاویر اسلایدر با موفقیت به‌روزرسانی شدند.",
      updatedImages: images, // ارسال اطلاعات به‌روز شده (اختیاری)
    });

  } catch (error) {
    console.error("خطا در به‌روزرسانی تصاویر اسلایدر:", error);
    res.status(500).json({ message: "Internal server error during image update." });
  }
};

module.exports = updateSliderImages;