// controllers/admin/sms/automatedSms.js

const AutomatedSmsTemplate = require('../../../models/automatedSmsTemplate');

// 🟢 ۱. اصلاح آبجکت پیش‌فرض: دقیقاً منطبق با Enum های مدل شما
const defaultTemplates = {
    'NEW_ORDER_USER': {
        name: "ثبت سفارش موفق (به کاربر)",
        description: "ارسال پیامک به کاربر پس از اینکه درخواست/سفارش جدیدی ثبت می‌کند.",
    },
    'NEW_ORDER_ADMIN': {
        name: "سفارش جدید (به ادمین)",
        description: "اطلاع‌رسانی به ادمین سایت هنگام ثبت درخواست جدید توسط کاربر.",
    },
    'UPDATE_ORDER_USER': {
        name: "تغییر وضعیت سفارش (به کاربر)",
        description: "ارسال پیامک به کاربر هنگامی که وضعیت درخواست او تغییر می‌کند (مثلاً تغییر پلن).",
    },
    'UPDATE_ORDER_ADMIN': {
        name: "تغییر وضعیت سفارش (به ادمین)",
        description: "اطلاع‌رسانی به ادمین هنگام تغییر وضعیت یک سفارش.",
    },
    'NEW_TICKET_ADMIN': {
        name: "تیکت جدید (به ادمین)",
        description: "اطلاع‌رسانی به ادمین هنگام ثبت تیکت پشتیبانی جدید توسط کاربر.",
    },
    'TICKET_REPLY_USER': {
        name: "پاسخ تیکت از پشتیبانی (به کاربر)",
        description: "ارسال پیامک به کاربر هنگامی که ادمین به تیکت او پاسخ می‌دهد.",
    },
    'TICKET_REPLY_ADMIN': {
        name: "ثبت پاسخ در تیکت (به ادمین)",
        description: "اطلاع‌رسانی به ادمین هنگامی که کاربر در یک تیکت موجود، پیام جدیدی می‌گذارد.",
    },
    'NEW_USER_ADMIN': {
        name: "ثبت نام کاربر جدید (به ادمین)",
        description: "اطلاع‌رسانی به ادمین هنگام ثبت‌نام یک کاربر جدید در سایت.",
    },
    'NEW_RECEIPT_ADMIN': {
        name: "ثبت فیش واریزی جدید (به ادمین)",
        description: "اطلاع‌رسانی به ادمین هنگام ثبت فیش واریزی جدید در سایت.",
    },
    'RECEIPT_APPROVED_USER' : {
        name: "فیش واریزی تایید شد (به کاربر)",
        description: "ارسال پیامک به کاربر هنگامی که فیش واریزی تایید شده است.",
    },
    'RECEIPT_REJECTED_USER' : {
        name: "فیش واریزی رد شد (به کاربر)",
        description: "ارسال پیامک به کاربر هنگامی که فیش واریزی رد شده است.",
    },
    'HOSTING_WARNING_USER' : {
        name: "هزینه روزانه توسط کاربر مانده به اتمام شارژ (به کاربر)",
        description: "ارسال پیامک به کاربر هنگامی که هزینه روزانه توسط کاربر مانده به اتمام شارژ است.",
    },
    'HOSTING_SUSPENDED_USER' : {
        name: "هزینه روزانه توسط کاربر غیرفعال شد (به کاربر)",
        description: "ارسال پیامک به کاربر هنگامی که هزینه روزانه توسط کاربر غیرفعال شده است.",
    },
};

/**
 * @desc    دریافت لیست تمام قالب‌های سایت. اگر قالبی وجود نداشت، آن را با مقادیر پیش‌فرض می‌سازد.
 * @route   GET /admin/automated-sms
 * @access  Private (Admin)
 */
exports.getAllTemplates = async (req, res, next) => {
    try {
        const definedEvents = AutomatedSmsTemplate.schema.path('eventName').enumValues;

        const existingTemplates = await AutomatedSmsTemplate.find({});
        const existingEventNames = existingTemplates.map(t => t.eventName);

        const missingEvents = definedEvents.filter(e => !existingEventNames.includes(e));

        if (missingEvents.length > 0) {
            const newTemplatesData = missingEvents.map(eventName => ({
                eventName,
                name: defaultTemplates[eventName]?.name || eventName,
                description: defaultTemplates[eventName]?.description || "بدون توضیحات",
                patternCode: "", // در ابتدا خالی است تا ادمین خودش پر کند
                isActive: false  // به صورت پیش‌فرض غیرفعال است
            }));

            await AutomatedSmsTemplate.insertMany(newTemplatesData);

            const allTemplates = await AutomatedSmsTemplate.find({}).sort('eventName');
            return res.status(200).json(allTemplates);
        }

        res.status(200).json(existingTemplates);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    دریافت جزئیات یک قالب خاص با ID
 * @route   GET /admin/automated-sms/:id
 * @access  Private (Admin)
 */
exports.getTemplateById = async (req, res, next) => {
    try {
        const template = await AutomatedSmsTemplate.findById(req.params.id);

        if (!template) {
            const error = new Error('قالب مورد نظر یافت نشد.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(template);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

/**
 * @desc    به‌روزرسانی یک قالب پیامک خودکار
 * @route   PUT /admin/automated-sms/:id
 * @access  Private (Admin)
 */
exports.updateTemplate = async (req, res, next) => {
    try {
        const { patternCode, isActive } = req.body;
        const templateId = req.params.id;

        // 🟢 ۲. ارور مربوط به متغیر ناموجود برطرف شد و روی patternCode اعمال شد
        if (patternCode !== undefined && patternCode.trim() === '' && isActive) {
            const error = new Error('اگر قالب فعال است، کد پترن (Body ID) نمی‌تواند خالی باشد.');
            error.statusCode = 400;
            throw error;
        }

        const existingTemplate = await AutomatedSmsTemplate.findById(templateId);

        if (!existingTemplate) {
            const error = new Error('قالب مورد نظر یافت نشد.');
            error.statusCode = 404;
            throw error;
        }

        existingTemplate.patternCode = patternCode;
        existingTemplate.isActive = isActive;

        const updatedTemplate = await existingTemplate.save();

        res.status(200).json(updatedTemplate);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

/**
 * @desc    به‌روزرسانی سریع وضعیت (روشن/خاموش) قالب پیامک
 * @route   PATCH /admin/automated-sms/status/:id
 * @access  Private (Admin)
 */
exports.updateTemplateStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const templateId = req.params.id;

        const existingTemplate = await AutomatedSmsTemplate.findById(templateId);

        if (!existingTemplate) {
            const error = new Error('قالب مورد نظر یافت نشد.');
            error.statusCode = 404;
            throw error;
        }
        
        // جلوگیری از فعال کردن قالبی که کد پترن ندارد
        if (isActive === true && (!existingTemplate.patternCode || existingTemplate.patternCode.trim() === '')) {
             const error = new Error('ابتدا کد پترن را وارد کنید، سپس قالب را فعال نمایید.');
             error.statusCode = 400;
             throw error;
        }

        existingTemplate.isActive = isActive;
        const updatedTemplate = await existingTemplate.save();

        res.status(200).json(updatedTemplate);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};