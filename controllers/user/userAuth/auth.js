const User = require("../../../models/usersSchema"); // مسیر صحیح مدل User
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const TransactionalSmsService = require("../../../services/transactionalSmsService");
const smsService = require("../../../utils/smsService");

// حافظه موقت برای OTPها (توجه: برای پروداکشن از Redis استفاده شود)
const otpStore = new Map();

/**
 * @desc    بررسی می‌کند که آیا کاربری با این شماره وجود دارد یا خیر.
 * @route   POST /auth/user-exists-check
 * @body    phoneNumber (string)
 */
const userExistsCheck = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    console.log(`phone number is ${phoneNumber}`)
    if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
      return res
        .status(422)
        .json({ exists: false, message: "شماره موبایل وارد شده معتبر نیست." });
    }

    const user = await User.findOne({ phoneNumber });

    if (user) {
      // اگر کاربر وجود داشت، نام او را هم برمی‌گردانیم تا در صفحه ورود نمایش داده شود.
      res.status(200).json({ exists: true, fullName: user.fullName });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    ارسال کد OTP برای ورود یا ثبت‌نام.
 * @route   POST /auth/send-otp
 * @body    phoneNumber (string)
 */
const sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // ۱- اعتبارسنجی شماره
    if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
      const error = new Error("شماره موبایل وارد شده معتبر نیست.");
      error.statusCode = 422;
      throw error;
    }

    // ۲- بررسی محدودیت زمانی (Rate Limiting)
    const existingOtp = otpStore.get(phoneNumber);
    if (existingOtp && existingOtp.expiresAt > Date.now()) {
      const timeLeft = Math.ceil((existingOtp.expiresAt - Date.now()) / 1000);
      const error = new Error(
        `کد تایید قبلی هنوز معتبر است. لطفا ${timeLeft} ثانیه دیگر تلاش کنید.`,
      );
      error.statusCode = 429;
      error.data = {
        expiresIn: timeLeft,
        expiresAt: existingOtp.expiresAt,
      };
      throw error;
    }

    // تولید OTP 4 رقمی
    const otp = otpGenerator.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
     
    // ۳- ارسال پیامک (قبل از ذخیره در سرور)
    try {
      await smsService.sendOtp(phoneNumber, otp);
      console.log(`OTP sent successfully to ${phoneNumber}: ${otp}`);
    } catch (smsError) {
      // اگر ارسال پیامک شکست خورد، هیچ کدی در otpStore ذخیره نمی‌شود
      console.error(`Failed to send SMS to ${phoneNumber}:`, smsError.message);
      const error = new Error("خطا در ارسال پیامک سامانه. لطفاً دوباره تلاش کنید.");
      error.statusCode = 502;
      throw error;
    }

    console.log(`otp is ${otp}`)

    try {
      // ۴- ذخیره در حافظه فقط پس از موفقیتِ ارسال پیامک
      const expiresAt = Date.now() + 2 * 60 * 1000; // ۲ دقیقه انقضا
      otpStore.set(phoneNumber, {
        code: otp,
        expiresAt,
      });
    

      const currentTime = Date.now();
      const timeLeftMillis = expiresAt - currentTime;
      const timeLeftSeconds = Math.ceil(timeLeftMillis / 1000);
      const finalExpiresInSeconds = Math.max(0, timeLeftSeconds);

      res.status(200).json({
        success: true,
        message: "کد تایید با موفقیت ارسال شد.",
        expiresIn: finalExpiresInSeconds,
        expiresAt: expiresAt,
      });
    } catch (error) {
      next(error);
    }


  } catch (err) {
    next(err);
  }
};
/**
 * @desc    تایید OTP. اگر کاربر وجود نداشت، او را با نام ارسالی می‌سازد.
 * @route   POST /auth/verify-otp
 * @body    phoneNumber (string), otp (string), fullName (string, optional)
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp, fullName, birthDate } = req.body;

    console.log("Received phoneNumber:", phoneNumber, "Received OTP:", otp);

    if (!phoneNumber || !otp) {
      const error = new Error("شماره موبایل و کد تایید الزامی است.");
      error.statusCode = 422;
      throw error;
    }

const storedOtpData = otpStore.get(phoneNumber);

if (!storedOtpData || String(storedOtpData.code).trim() !== String(otp).trim() || Date.now() > storedOtpData.expiresAt) {
  
  // +++ این لاگ را حتماً اضافه کنید +++
  console.log(`❌ ارور تایید کد برای شماره ${phoneNumber}:`);
  console.log(`- کدی که کاربر فرستاد: '${otp}'`);
  console.log(`- کدی که در سرور بود: '${storedOtpData ? storedOtpData.code : "یافت نشد (احتمالا پاک شده)"}'`);
  // +++++++++++++++++++++++++++++++++++++

  const error = new Error("کد تایید نامعتبر یا منقضی شده است.");
  error.statusCode = 401;
  throw error;
}

    // کاربر را با شماره تلفن پیدا کن
    let user = await User.findOne({ phoneNumber });

    // اگر کاربر وجود نداشت (یعنی فرآیند ثبت‌نام است)
    if (!user) {
      // در این حالت، fullName باید حتماً ارسال شده باشد.
      if (!fullName || fullName.trim().length < 3) {
        const error = new Error(
          "نام کامل برای ثبت‌نام کاربر جدید الزامی است و نباید کمتر از ۳ حرف باشد.",
        );
        error.statusCode = 422;
        throw error;
      }
      // مدل User به طور پیش‌فرض role را 'user' قرار می‌دهد
      user = await User.create({
        fullName,
        phoneNumber,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      });
    }

    console.log('در حال ساخت توکن')

    // ساخت توکن JWT مینیمال و امن
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1680h" }, 
    );

    console.log(' توکن ایجاد شد')

    // ===================================================================
    // ===== بخش کلیدی و جدید: فعال‌سازی پیامک خوش‌آمدگویی =====
    // ===================================================================
    // ما به صورت غیرهمزمان (بدون await) آن را فراخوانی می‌کنیم تا پاسخ به کاربر را مسدود نکند
     TransactionalSmsService.trigger("user_entered", { user: user }).catch(err => console.error("Welcome SMS error:", err.message));
    // ===================================================================

    // OTP استفاده شده را حذف کن
    otpStore.delete(phoneNumber);

    console.log('توکن پاک شد')

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err)
    next(err);
  }
};

/**
 * @desc    ارسال کد OTP برای ورود ادمین.
 *          ابتدا بررسی می‌کند که آیا کاربری با این شماره وجود دارد و نقش ادمین دارد یا خیر.
 * @route   POST /auth/send-admin-otp
 * @body    phoneNumber (string)
 */
const sendAdminOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // ۱. اعتبارسنجی فرمت شماره موبایل
    if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
      const error = new Error("شماره موبایل وارد شده معتبر نیست.");
      error.statusCode = 422; // Unprocessable Entity
      throw error;
    }

    // ۲. پیدا کردن کاربر در دیتابیس
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      const error = new Error("کاربری با این شماره موبایل یافت نشد.");
      error.statusCode = 404;
      throw error;
    }
    if (user.role !== "admin" && user.role !== "owner") {
      const error = new Error("این شماره به یک حساب کاربری ادمین تعلق ندارد.");
      error.statusCode = 403;
      throw error;
    }

    // ۴. تولید و ذخیره OTP (فقط در صورت موفقیت‌آمیز بودن بررسی‌ها)
    const otp = otpGenerator.generate(4, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    otpStore.set(phoneNumber, {
      code: otp,
      expiresAt: Date.now() + 3 * 60 * 1000, // 2 دقیقه انقضا
    });

    console.log("otp is: " + otp);
    // ارسال واقعی پیامک OTP برای ادمین
    try {
      await smsService.sendOtp(phoneNumber, otp);
      console.log(`Admin OTP sent successfully to ${phoneNumber}`);
    } catch (smsError) {
      console.error(
        `Failed to send Admin SMS to ${phoneNumber}:`,
        smsError.message,
      );
      const error = new Error("خطا در ارسال پیامک سامانه ادمین.");
      error.statusCode = 502;
      throw error;
    }

    res
      .status(200)
      .json({ success: true, message: "کد تایید با موفقیت ارسال شد." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * @desc    تایید OTP فقط برای ورود ادمین.
 * @route   POST admin/auth/verify-admin-otp
 * @body    phoneNumber (string), otp (string)
 */
const verifyAdminOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      const error = new Error("شماره موبایل و کد تایید الزامی است.");
      error.statusCode = 422; // Unprocessable Entity
      throw error;
    }

    // ۱. تایید کد OTP از حافظه موقت
    const storedOtpData = otpStore.get(phoneNumber);
    if (
      !storedOtpData ||
      storedOtpData.code !== otp ||
      Date.now() > storedOtpData.expiresAt
    ) {
      const error = new Error("کد تایید نامعتبر یا منقضی شده است.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // ۲. پیدا کردن کاربر در دیتابیس
    let user = await User.findOne({ phoneNumber });

    // ۳. بررسی وجود کاربر
    if (!user) {
      const error = new Error(
        "کاربری با این شماره موبایل در سیستم تعریف نشده است.",
      );
      error.statusCode = 404; // Not Found
      throw error;
    }

    // ۴. بررسی نقش کاربر (لایه امنیتی حیاتی)
    if (user.role !== "admin" && user.role !== "owner") {
      const error = new Error("شما اجازه دسترسی به این پنل را ندارید.");
      error.statusCode = 403; // Forbidden
      throw error;
    }

    // ۵. ساخت توکن JWT
    const token = jwt.sign(
      { userId: user._id.toString() }, // فقط شناسه کاربر کافیست
      process.env.JWT_SECRET,
      { expiresIn: "1680h" }, 
    );

    // OTP استفاده شده را برای امنیت حذف کن
    otpStore.delete(phoneNumber);
    // ۶. ارسال پاسخ موفق
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * @desc    بررسی اعتبار توکن JWT بدون نیاز به Authorization کامل.
 *          توکن را دریافت، اعتبار آن را بررسی و در صورت معتبر بودن، اطلاعات پایه کاربر را برمی‌گرداند.
 * @route   POST /auth/check-token-validity
 * @body    token (string)
 * @access  Public
 */
const checkTokenValidity = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      const error = new Error("توکن الزامی است.");
      error.statusCode = 400;
      throw error;
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // اگر توکن نامعتبر یا منقضی شده باشد
      const error = new Error("توکن نامعتبر یا منقضی شده است.");
      error.statusCode = 401;
      throw error;
    }

    // توکن معتبر است. اطلاعات پایه کاربر را برگردانید.
    // می‌توانید فقط userId را برگردانید یا اگر نیاز به اطلاعات بیشتری دارید، کاربر را از دیتابیس واکشی کنید.
    // برای یک checkAuth سریع، فقط userId کافی است.
    const user = await User.findById(decodedToken.userId).select(
      "_id fullName role",
    );

    if (!user) {
      const error = new Error("کاربر یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      isValid: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports = {
  userExistsCheck,
  sendOtp,
  verifyOtp,
  verifyAdminOtp,
  sendAdminOtp,
  checkTokenValidity,
};