// utils/zarinpal.js
const axios = require('axios');

// تنظیمات ثابت برای محیط سندباکس زرین‌پال
// در محیط واقعی، این مرچنت کد را با کد اصلی خودتان و آدرس‌ها را با آدرس اصلی جایگزین کنید.
// کد تست ۴۶ کاراکتری
// دریافت تنظیمات از فایل .env
// اگر در فایل env نبودند، از مقادیر پیش‌فرض سندباکس استفاده می‌کند (برای اطمینان)
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID ;
const ZARINPAL_BASE_URL = process.env.ZARINPAL_PAYMENT_URL;
const ZARINPAL_GATEWAY_URL = process.env.ZARINPAL_GATEWAY_URL;

/**
 * ایجاد درخواست پرداخت و دریافت لینک درگاه
 * @param {number} amount - مبلغ به تومان
 * @param {string} callbackUrl - آدرس بازگشت پس از پرداخت
 * @param {string} description - توضیحات تراکنش
 * @param {string} [mobile] - موبایل کاربر (اختیاری)
 * @param {string} [email] - ایمیل کاربر (اختیاری)
 */
const requestPayment = async (amount, callbackUrl, description, mobile, email) => {
    try {
        const response = await axios.post(`${ZARINPAL_BASE_URL}/request.json`, {
            merchant_id: ZARINPAL_MERCHANT_ID,
            amount: amount * 10, // تبدیل تومان به ریال (زرین‌پال ریال می‌گیرد)
            callback_url: callbackUrl,
            description: description,
            metadata: {
                mobile: mobile,
                email: email
            }
        });

        const { data, errors } = response.data;

        // کد 100 یعنی درخواست موفق بوده
        if (data && data.code === 100) {
            return {
                success: true,
                authority: data.authority,
                paymentUrl: `${ZARINPAL_GATEWAY_URL}/${data.authority}`
            };
        } else {
            console.error('Zarinpal Request Failed:', errors);
            return { 
                success: false, 
                error: 'خطا در ایجاد تراکنش زرین‌پال',
                details: errors 
            };
        }
    } catch (error) {
        console.error('Zarinpal Network Error (Request):', error.response ? error.response.data : error.message);
        return { success: false, error: 'خطای ارتباط با درگاه پرداخت' };
    }
};

/**
 * اعتبارسنجی و تایید نهایی پرداخت
 * @param {number} amount - مبلغ به تومان (باید دقیقا همان مبلغ اولیه باشد)
 * @param {string} authority - شناسه پرداخت (که از زرین‌پال دریافت شده)
 */
const verifyPayment = async (amount, authority) => {
    try {
        const response = await axios.post(`${ZARINPAL_BASE_URL}/verify.json`, {
            merchant_id: ZARINPAL_MERCHANT_ID,
            amount: amount * 10, // تبدیل تومان به ریال
            authority: authority
        });

        const { data, errors } = response.data;

        // کد 100: عملیات موفق
        // کد 101: تراکنش قبلاً با موفقیت تایید شده است (تکراری ولی معتبر)
        if (data && (data.code === 100 || data.code === 101)) {
            return {
                success: true,
                refId: data.ref_id,   // شماره پیگیری تراکنش
                cardPan: data.card_pan, // شماره کارت کاربر (ماسک شده)
                code: data.code
            };
        } else {
            console.error('Zarinpal Verify Failed:', errors || data);
            return { 
                success: false, 
                code: data ? data.code : 'UNKNOWN',
                message: 'تراکنش تایید نشد'
            };
        }
    } catch (error) {
        console.error('Zarinpal Network Error (Verify):', error.response ? error.response.data : error.message);
        return { success: false, error: 'خطای ارتباط با درگاه در مرحله تایید' };
    }
};

module.exports = { requestPayment, verifyPayment };