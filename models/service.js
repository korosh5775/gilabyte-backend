const mongoose = require("mongoose");

// ==========================================
// ۱. اسکیمای ویژگی‌ها (Feature Schema)
// ==========================================
// این بخش برای ساخت جداول داینامیک امکانات در فرانت‌اند استفاده می‌شود.
const featureSchema = new mongoose.Schema({
  // نام گروه ویژگی (مثلاً: "پشتیبانی و آموزش" یا "امکانات فروشگاهی")
  groupName: { type: String, required: true },
  
  // لیست آیتم‌های زیرمجموعه این گروه
  items: [
    {
      // عنوان ویژگی (مثلاً: "سیستم پیامک خودکار")
      title: { type: String, required: true },
      
      // نوع مقدار این ویژگی (آیا تیک/ضربدر است یا یک متن کوتاه؟)
      valueType: { type: String, enum: ['boolean', 'text'], required: true },
      
      // اگر valueType برابر boolean بود، این فیلد چک می‌شود (true = تیک سبز، false = ضربدر قرمز)
      booleanValue: { type: Boolean },
      
      // اگر valueType برابر text بود، این فیلد نمایش داده می‌شود (مثلاً: "۶ ماه رایگان")
      textValue: { type: String }
    }
  ]
});

// ==========================================
// ۲. اسکیمای پلن‌ها (Plan Schema)
// ==========================================
// این بخش اطلاعات هر کارت قیمت‌گذاری (مثلا: پایه، پیشرفته، VIP) را نگه می‌دارد.
const planSchema = new mongoose.Schema({
  // نام پلن (مثلاً: "طرح پیشرفته")
  name: { type: String, required: true },
  
  // قیمت پایه و اصلی (بدون در نظر گرفتن تخفیف - به تومان)
  price: { type: Number, required: true }, 
  
  // ---------------- بخش تخفیف‌های زمان‌دار ----------------
  // درصد تخفیف (اگر 0 باشد یعنی تخفیف ندارد)
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 }, 
  
  // تاریخ و زمان دقیق انقضای تخفیف. اگر null باشد یعنی تخفیف همیشگی است.
  discountExpiresAt: { type: Date, default: null },
  // -----------------------------------------------------

  // متنی که روی روبان کارت نوشته می‌شود (مثلاً: "پیشنهاد ویژه ⭐️")
  badge: { type: String },
  
  // اگر true باشد، این کارت در فرانت‌اند کمی بزرگتر و برجسته‌تر نشان داده می‌شود
  isRecommended: { type: Boolean, default: false },
  
  // مخاطب هدف این پلن (مثلاً: "مناسب برای رشد و فروش بیشتر")
  targetAudience: { type: String },
  
  // آرایه‌ای از ویژگی‌های این پلن که از featureSchema بالا استفاده می‌کند
  featuresData: [featureSchema] 
});

// -- Virtual Properties برای پلن --
// محاسبه هوشمند قیمت نهایی و وضعیت تخفیف بدون ذخیره فیزیکی در دیتابیس

// ۱. آیا تخفیف در حال حاضر فعال و معتبر است؟ (مفید برای نمایش تایمر در فرانت‌اند)
planSchema.virtual('isDiscountActive').get(function() {
  const hasDiscount = this.discountPercentage > 0;
  // بررسی می‌کند که آیا تاریخ انقضا ست نشده؟ یا اگر ست شده، آیا هنوز از زمان الان بزرگتر است؟
  const isNotExpired = !this.discountExpiresAt || this.discountExpiresAt.getTime() > Date.now();
  
  return hasDiscount && isNotExpired;
});

// ۲. محاسبه قیمت نهایی پس از کسر تخفیف
planSchema.virtual('finalPrice').get(function() {
  // اگر تخفیف فعال بود (با استفاده از virtual بالایی)
  if (this.isDiscountActive) {
    return this.price - (this.price * (this.discountPercentage / 100));
  }
  // اگر تخفیف نداشت یا منقضی شده بود، همان قیمت اصلی برمی‌گردد
  return this.price; 
});

// تنظیمات مهم برای اینکه Virtualها هنگام ارسال با res.json به فرانت‌اند فرستاده شوند
planSchema.set('toJSON', { virtuals: true });
planSchema.set('toObject', { virtuals: true });


// ==========================================
// ۳. اسکیمای اصلی خدمات (Service Schema)
// ==========================================
// این مدل اصلی است که در دیتابیس کالکشن (Collection) می‌سازد.
const serviceSchema = new mongoose.Schema({
  // عنوان کلی خدمت برای نمایش در کارت صفحه اصلی سایت (مثلاً: "طراحی سایت فروشگاهی")
  title: { type: String, required: true, unique: true },
  
  // آدرس URL بهینه شده برای سئو (مثلاً: "ecommerce-website")
  slug: { type: String, required: true, unique: true },
  
  // توضیح کوتاه برای کارت صفحه اصلی
  shortDescription: { type: String, required: true },
  
  // مسیر یا لینک عکس کاور برای کارت صفحه اصلی
  thumbnailUrl: { type: String, required: true },
  
  // تیتر درشت داخل صفحه اختصاصی این خدمت (مثلاً: "آینده دیجیتال خود را با گیلابایت بسازید")
  headerTitle: { type: String },
  
  // زیرتیتر داخل صفحه اختصاصی (مثلاً: "تکنولوژی مدرن React فراتر از وردپرس")
  headerSubtitle: { type: String },
  
  // ---------------- ماشین حساب اقساط ----------------
  installmentConfig: {
    // چند درصد تخفیف برای پرداخت نقدی اعمال شود؟ (مثلاً 4)
    cashDiscountPercent: { type: Number, default: 4 },      
    
    // چند درصد از کل مبلغ باید همان ابتدا به عنوان پیش‌پرداخت داده شود؟ (مثلاً 25)
    prepaymentPercent: { type: Number, default: 25 },       
    
    // کاربر تا چند ماه می‌تواند بدون سود و کارمزد قسط بدهد؟ (مثلاً 4 ماه)
    interestFreeMonths: { type: Number, default: 4 },       
    
    // آرایه‌ای برای اقساط بلندمدت که ادمین به صورت داینامیک تنظیم می‌کند
    extendedTerms: [
      {
        minMonths: { type: Number, required: true },    // شروع بازه (مثلاً 5)
        maxMonths: { type: Number, required: true },    // پایان بازه (مثلاً 6)
        interestPercent: { type: Number, required: true } // درصد کارمزد برای این بازه (مثلاً 10)
      }
    ]
  },
  // ------------------------------------------------

  // آرایه‌ای از پلن‌های قیمت‌گذاری (استاندارد، پیشرفته، و ...)
  plans: [planSchema],
  
  // وضعیت فعال بودن خدمت. اگر false باشد در سایت به کاربران نمایش داده نمی‌شود (بدون نیاز به حذف کامل)
  isActive: { type: Boolean, default: true }

}, { 
  // ایجاد خودکار فیلدهای createdAt و updatedAt توسط Mongoose
  timestamps: true 
});

// نحوه صحیح خروجی گرفتن در CommonJS
module.exports = mongoose.model("Service", serviceSchema);