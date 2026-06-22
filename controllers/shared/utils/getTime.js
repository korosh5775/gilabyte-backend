/* @description کنترلر برای دریافت زمان فعلی سرور
 * @route GET /api/time
 * @access Public (بدون نیاز به احراز هویت)
 */
 exports.getTime = (req, res) => {
  const serverTime = Date.now(); // زمان فعلی سرور به میلی‌ثانیه (Unix Timestamp)

  res.status(200).json({
    success: true,
    serverTime: serverTime,
    message: 'زمان فعلی سرور با موفقیت دریافت شد.',
  });
};

