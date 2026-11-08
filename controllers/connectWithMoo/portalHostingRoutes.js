// controllers/connectWithMoo/portalHostingRoutes.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../../models/usersSchema");
const HostingReceipt = require("../../models/hostingReceiptSchema");
const Setting = require("../../models/setting"); // 🟢 ایمپورت مدل تنظیمات
const { triggerSmsEvent } = require("../../utils/smsEventTrigger");

// ۱. تنظیمات آپلود عکس فیش در پوشه images/receipts/hosting
const receiptUploadDir = "images/receipts/hosting";
if (!fs.existsSync(receiptUploadDir)) {
    fs.mkdirSync(receiptUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, receiptUploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, `receiptImage-${Date.now()}-${Math.round(Math.random() * 1e8)}${ext}`);
    }
});

exports.uploadReceiptMiddleware = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
}).fields([{ name: "receiptImage", maxCount: 1 }]);

// تابع کمکی برای تمیز کردن نام دامنه
const cleanDomainName = (url = "") => {
    return url
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .split(":")[0];
};

/**
 * @desc    دریافت وضعیت شارژ سرور توسط اپلیکیشن ادمین آرایشگاه (بر اساس دامنه)
 * @route   GET /api/v1.1/moo/hosting/status
 */
exports.getPortalHostingStatus = async (req, res, next) => {
    try {
        const rawDomain = req.headers["x-tenant-domain"];
        if (!rawDomain) {
            return res.status(400).json({ success: false, message: "دامنه سایت ارسال نشده است." });
        }

        const domain = cleanDomainName(rawDomain);
        const user = await User.findOne({ "hosting.domain": domain });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: `حساب پشتیبانی برای دامنه ${domain} در گیلابایت ثبت نشده است.` 
            });
        }

        const { balance = 0, dailyCost = 0, isActive = false, lastChargeDate } = user.hosting || {};
        const remainingDays = dailyCost > 0 ? Math.floor(balance / dailyCost) : 0;

        // 🟢 خواندن اطلاعات کارت بانکی از کالکشن Setting در دیتابیس
        const siteSettings = await Setting.findOne().lean();
        const rawCardNumber = siteSettings?.bankCard?.cardNumber || "6037991547348809";
        const cardHolderName = siteSettings?.bankCard?.cardHolderName || "محمدحسین گیلان پناه";

        // فرمت کردن شماره کارت به صورت ۴ رقم ۴ رقم (مثلاً 6037-9915-4734-8809) برای خوانایی بهتر
        const formattedCardNumber = String(rawCardNumber)
            .replace(/\D/g, "")
            .replace(/(\d{4})(?=\d)/g, "$1-");

        const receipts = await HostingReceipt.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            ownerName: user.fullName,
            hosting: { balance, dailyCost, isActive, lastChargeDate },
            remainingDays,
            paymentInfo: {
                cardNumber: formattedCardNumber,
                cardHolder: cardHolderName,
                bankName: "شماره کارت جهت واریز"
            },
            receipts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    آپلود فیش واریزی از داخل اپلیکیشن ادمین آرایشگاه
 * @route   POST /api/v1.1/moo/hosting/receipt
 */
exports.uploadPortalHostingReceipt = async (req, res, next) => {
    try {
        const rawDomain = req.headers["x-tenant-domain"];
        const domain = cleanDomainName(rawDomain);

        const user = await User.findOne({ "hosting.domain": domain });
        if (!user) {
            return res.status(404).json({ success: false, message: "کاربر مربوط به این دامنه یافت نشد." });
        }

        const { amount, trackingCode } = req.body;

        if (!req.files || !req.files.receiptImage) {
            return res.status(400).json({ success: false, message: "لطفاً تصویر فیش واریزی را انتخاب کنید." });
        }

        const receiptImagePath = `/${req.files.receiptImage[0].path.replace(/\\/g, "/")}`;

        const newReceipt = await HostingReceipt.create({
            user: user._id,
            receiptImage: receiptImagePath,
            amount: Number(amount),
            trackingCode: trackingCode || ""
        });

        const adminPhone = process.env.ADMIN_PHONE_NUMBER || "09112696482";
        triggerSmsEvent("NEW_RECEIPT_ADMIN", adminPhone, {
            fullName: user.fullName,
            amount: amount
        });

        res.status(201).json({
            success: true,
            message: "فیش واریزی با موفقیت ثبت شد و پس از تایید پشتیبانی، به شارژ سرور شما افزوده خواهد شد.",
            receipt: newReceipt
        });
    } catch (error) {
        next(error);
    }
};