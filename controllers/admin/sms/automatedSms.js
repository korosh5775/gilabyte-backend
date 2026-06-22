// controllers/admin/sms/automatedSms.js

const AutomatedSmsTemplate = require('../../../models/automatedSmsTemplate');

// یک آبجکت برای نگهداری قالب‌های پیش‌فرض فروشگاه.
const defaultTemplates = {
    'user_entered': {
        name: "ورود موفق",
        description: 'ارسال پیامک پس از ورود یا اولین ثبت‌نام موفق کاربر در فروشگاه.',
        template: 'سلام [CustomerName] عزیز! به فروشگاه ما خوش آمدید. ورود شما با موفقیت انجام شد.',
    },
    'order_confirmed': {
        name: "تایید سفارش",
        description: 'ارسال پیامک پس از پرداخت موفق و تایید سفارش.',
        template: 'سفارش شماره [OrderId] شما با موفقیت ثبت و پرداخت شد. سفارش شما در حال بررسی است.',
    },
    'order_shipped': {
        name: "ارسال سفارش",
        description: 'ارسال پیامک پس از ارسال سفارش توسط ادمین.',
        template: 'سفارش شماره [OrderId] شما ارسال شد. کد رهگیری: [TrackingCode].',
    },
    'admin_new_order': {
        name: "اطلاع‌رسانی سفارش جدید به ادمین",
        description: 'ارسال پیامک به ادمین پس از ثبت و پرداخت موفق سفارش جدید.',
        template: 'سفارش جدید ثبت شد! سفارش: [OrderId] مشتری: [CustomerFullName] مبلغ: [TotalPrice] تومان لینک پنل: [AdminPanelUrl]',
    },
};


/**
 * @desc    دریافت لیست تمام قالب‌های فروشگاه. اگر قالبی وجود نداشت، آن را با مقادیر پیش‌فرض می‌سازد.
 * @route   GET /admin/shop/automated-sms
 * @access  Private (Admin)
 */
exports.getAllShopTemplates = async (req, res, next) => {
    try {
        // ۱. لیست تمام رویدادهای تعریف شده در enum مدل را می‌خوانیم
        const definedEvents = AutomatedSmsTemplate.schema.path('eventName').enumValues;

        // ۲. قالب‌های موجود در دیتابیس را پیدا می‌کنیم
        const existingTemplates = await AutomatedSmsTemplate.find({});
        const existingEventNames = existingTemplates.map(t => t.eventName);

        // ۳. رویدادهایی که هنوز در دیتابیس ساخته نشده‌اند را پیدا می‌کنیم
        const missingEvents = definedEvents.filter(e => !existingEventNames.includes(e));

        // ۴. اگر رویداد گمشده‌ای وجود داشت، آن را می‌سازیم
        if (missingEvents.length > 0) {
            const newTemplatesData = missingEvents.map(eventName => ({
                eventName,
                ...defaultTemplates[eventName]
            }));

            // با استفاده از insertMany، تمام قالب‌های جدید را در یک درخواست واحد می‌سازیم
            await AutomatedSmsTemplate.insertMany(newTemplatesData);

            // پس از ساخت، لیست کامل را دوباره می‌خوانیم تا به فرانت‌اند ارسال کنیم
            const allTemplates = await AutomatedSmsTemplate.find({}).sort('eventName');
            return res.status(200).json(allTemplates);
        }

        // اگر هیچ رویداد گمشده‌ای نبود، فقط لیست موجود را برمی‌گردانیم
        res.status(200).json(existingTemplates);

    } catch (err) {
        next(err);
    }
};

/**
 * @desc    دریافت جزئیات یک قالب خاص با ID
 * @route   GET /admin/shop/automated-sms/:id
 * @access  Private (Admin)
 */
exports.getShopTemplateById = async (req, res, next) => {
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
 * @desc    به‌روزرسانی یک قالب پیامک خودکار فروشگاه
 * @route   PUT /admin/shop/automated-sms/:id
 * @access  Private (Admin)
 */
exports.updateShopTemplate = async (req, res, next) => {
    try {
        const { template, isActive } = req.body;
        const templateId = req.params.id;

        if (!template || template.trim() === '') {
            const error = new Error('متن قالب پیامک نمی‌تواند خالی باشد.');
            error.statusCode = 400;
            throw error;
        }

        const existingTemplate = await AutomatedSmsTemplate.findById(templateId);

        if (!existingTemplate) {
            const error = new Error('قالب مورد نظر یافت نشد.');
            error.statusCode = 404;
            throw error;
        }

        // فقط فیلدهایی که ادمین اجازه تغییر آن‌ها را دارد، به‌روزرسانی می‌شوند.
        existingTemplate.template = template;
        existingTemplate.isActive = isActive;

        const updatedTemplate = await existingTemplate.save();

        res.status(200).json(updatedTemplate);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};



/**
 * @desc    به‌روزرسانی یک قالب پیامک خودکار فروشگاه
 * @route   patch /admin/shop/automated-sms/status/:id
 * @access  Private (Admin)
 */
exports.updateShopTemplateStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const templateId = req.params.id;

        const existingTemplate = await AutomatedSmsTemplate.findById(templateId);

        if (!existingTemplate) {
            const error = new Error('قالب مورد نظر یافت نشد.');
            error.statusCode = 404;
            throw error;
        }

        // فقط فیلدهایی که ادمین اجازه تغییر آن‌ها را دارد، به‌روزرسانی می‌شوند.
        existingTemplate.isActive = isActive;

        const updatedTemplate = await existingTemplate.save();

        res.status(200).json(updatedTemplate);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
