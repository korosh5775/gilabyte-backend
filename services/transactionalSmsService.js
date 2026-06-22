// services/transactionalSmsService.js

const AutomatedSmsTemplate = require('../models/automatedSmsTemplate');

class TransactionalSmsService {
    constructor() {
        this.adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER || '09123456789';
        // نام سایت یا مجموعه شما مستقیماً از متغیر محیطی خوانده می‌شود
        this.siteName = process.env.WEBSITE_NAME || 'مجموعه توسعه نرم‌افزار'; 
    }

    /**
     * تابع اصلی برای فعال‌سازی یک پیامک رویداد-محور
     * @param {string} eventName - نام رویدادی که اتفاق افتاده (مثلاً 'order_confirmed').
     * @param {object} data - آبجکتی شامل داده‌های مورد نیاز برای شخصی‌سازی (مانند user و order).
     */
    async trigger(eventName, data) {
        try {
            // ۱. پیدا کردن قالب فعال برای رویداد مورد نظر
            const smsTemplate = await AutomatedSmsTemplate.findOne({ eventName, isActive: true });

            if (!smsTemplate) {
                return;
            }

            if (!smsTemplate.patternCode) {
                console.warn(`Template for ${eventName} is active but has no patternCode.`);
                return;
            }

            // =====================================================================
            // راهنمای افزودن مقادیر جدید:
            // =====================================================================
            // سامانه sms.ir متغیرها را با نامشان شناسایی می‌کند.
            // به جای آرایه، از یک آبجکت (Object) استفاده می‌کنیم تا کلیدها (نام متغیر در سامانه) 
            // و مقدار آن‌ها را مشخص کنیم. 
            // مثلاً اگر در پنل پیامک نوشته‌اید:  سلام ##FIRSTNAME## سفارش ##ORDER_ID## ثبت شد.
            // اینجا باید بنویسید:
            // patternData["FIRSTNAME"] = userName; 
            // patternData["ORDER_ID"] = orderNumber;
            // =====================================================================

            let patternData = {};

            const userFullName = data.user?.fullName || 'مشتری گرامی';
            const userName = userFullName.split(' ')[0];

            if (eventName === 'user_entered') {
                // پترن خوش‌آمدگویی
                patternData["NAME"] = userFullName; // متغیر ##NAME## در پنل
            } 
            else if (['order_confirmed', 'order_shipped'].includes(eventName)) {
                // پترن سفارش 
                patternData["NAME"] = userName; 

                if (data.order) {
                    patternData["ORDER_NUM"] = data.order.orderNumber || ''; 
                    
                    const orderDate = data.order.createdAt 
                        ? new Date(data.order.createdAt).toLocaleDateString('fa-IR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : '';
                    patternData["DATE"] = orderDate; 

                    const totalPrice = data.order.grandTotal 
                        ? data.order.grandTotal.toLocaleString('fa-IR') + ' تومان'
                        : '';
                    patternData["AMOUNT"] = totalPrice; 

                    patternData["TRACKING"] = data.order.trackingCode || 'ثبت نشده'; 
                    patternData["SITE_NAME"] = this.siteName; 
                }
            }
            else if (eventName === 'admin_new_order') {
                // پترن اطلاع‌رسانی به مدیر 
                if (data.order) {
                    patternData["ORDER_NUM"] = data.order.orderNumber || ''; 
                    patternData["CUSTOMER_NAME"] = userFullName; 
                    const totalPrice = data.order.grandTotal 
                        ? data.order.grandTotal.toLocaleString('fa-IR') + ' تومان'
                        : '';
                    patternData["AMOUNT"] = totalPrice; 
                }
            }

            // ۳. تعیین شماره گیرنده
            const recipientPhone = eventName === 'admin_new_order'
                ? this.adminPhoneNumber
                : data.user.phoneNumber;

            // ۴. ارسال پیامک پترن
            await require('../utils/smsService').sendPattern(
                recipientPhone,
                smsTemplate.patternCode,
                patternData
            );

            console.log(`Transactional SMS triggered successfully for event: ${eventName}, user: ${data.user._id}`);

        } catch (error) {
            console.error(`Error triggering transactional SMS for event ${eventName}:`, error);
        }
    }
}

module.exports = new TransactionalSmsService();
