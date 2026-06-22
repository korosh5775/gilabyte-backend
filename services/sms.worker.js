// services/sms.worker.js

const SmsJob = require('../models/smsJob');
const smsService = require('../utils/smsService');

const processSmsQueue = async () => {
    // پیدا کردن حداکثر 10 کار در صف
    const jobs = await SmsJob.find({ status: 'pending' }).limit(10).sort('createdAt');

    if (jobs.length === 0) {
        return;
    }

    for (const job of jobs) {
        try {
            console.log(`[Shop SMS Worker] Job picked up for: ${job.phoneNumber}`);
            console.log(`[Shop SMS Worker] Preparing to send message: "${job.message.substring(0, 20)}..."`);

            // ارسال پیامک
            const response = await smsService.sendSingle(job.phoneNumber, job.message);

            console.log(`[Shop SMS Worker] Response received from SMS Provider:`, JSON.stringify(response));

            // بررسی پاسخ
            const isSuccess = checkSmsApiResponse(response);

            if (isSuccess) {
                job.status = 'sent';
                job.sentAt = new Date();
                job.apiResponse = JSON.stringify(response);
                await job.save();
                console.log(`[Shop SMS Worker] ✓ SMS sent successfully to ${job.phoneNumber}`);
            } else {
                job.status = 'failed';
                job.error = extractErrorFromResponse(response);
                job.apiResponse = JSON.stringify(response);
                await job.save();
                console.error(`[Shop SMS Worker] ✗ SMS API returned error for ${job.phoneNumber}:`, job.error);
            }

        } catch (error) {
            console.error(`[Shop SMS Worker] ✗ Failed to send SMS for job ${job._id}:`, error.message);

            job.status = 'failed';
            job.error = error.message;

            if (error.response?.data) {
                job.apiResponse = JSON.stringify(error.response.data);
                job.error = `API Error: ${JSON.stringify(error.response.data)}`;
            }

            await job.save();
        }
    }
};

/**
 * بررسی پاسخ API
 */
function checkSmsApiResponse(response) {
    if (!response) return false;

    // اگر StrRetStatus وجود دارد و نشان‌دهنده خطا است
    if (response.StrRetStatus && response.StrRetStatus !== 'Success') {
        const knownErrors = ['InvalidData', 'AuthFailed', 'InsufficientCredit'];
        if (knownErrors.includes(response.StrRetStatus) || response.RetStatus === 35) {
            return false;
        }
    }

    // بررسی فرمت‌های مختلف پاسخ
    if (response.RetStatus !== undefined) {
        if (response.RetStatus === 1) return true;
    }

    if (response.Value !== undefined) {
        if (typeof response.Value === 'string' && response.Value.length > 10) {
            return true;
        }
        if (typeof response.Value === 'number' && response.Value > 1000) {
            return true;
        }
        if (typeof response.Value === 'string' && response.Value.length < 5) {
            return false;
        }
    }

    if (response.RetStatus > 1 && response.RetStatus !== 35) {
        return true;
    }

    return true;
}

/**
 * استخراج پیام خطا
 */
function extractErrorFromResponse(response) {
    if (!response) return 'Unknown error from SMS API';

    const errorMessages = {
        '-1': 'پارامترها ناقص است',
        '-2': 'نام کاربری یا رمز عبور اشتباه است',
        '-3': 'اعتبار کافی نیست',
        '-4': 'شماره فرستنده معتبر نیست',
        '-5': 'شماره گیرنده معتبر نیست',
        '-6': 'متن پیام خالی است',
        '-7': 'طول پیام بیش از حد مجاز است',
        '0': 'ارسال ناموفق بود',
        '35': 'داده‌های ارسالی نامعتبر است (InvalidData)'
    };

    const statusCode = response.RetStatus || response.Value || response.StrRetStatus;

    if (errorMessages[String(statusCode)]) {
        return errorMessages[String(statusCode)];
    }

    if (response.StrRetStatus) {
        return response.StrRetStatus;
    }

    return `SMS API Error: ${JSON.stringify(response)}`;
}

module.exports = { processSmsQueue };
