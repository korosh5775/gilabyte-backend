const User = require("../../../models/usersSchema");
const HostingReceipt = require("../../../models/hostingReceiptSchema");
const { triggerSmsEvent } = require("../../../utils/smsEventTrigger");

/**
 * @desc    دریافت اطلاعات مالی و تاریخچه رسیدهای کاربر
 * @route   GET /user/hosting
 */
exports.getMyHostingInfo = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // ۱. محاسبه روزهای باقی‌مانده
        let remainingDays = 0;
        if (req.user.hosting.dailyCost > 0) {
            remainingDays = Math.floor(req.user.hosting.balance / req.user.hosting.dailyCost);
        }

        // ۲. دریافت تاریخچه رسیدهای آپلود شده توسط این کاربر (مرتب شده از جدید به قدیم)
        const receipts = await HostingReceipt.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            hosting: req.user.hosting,
            remainingDays,
            receipts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    آپلود فیش واریزی توسط کاربر
 * @route   POST /user/hosting/receipt
 */
exports.uploadReceipt = async (req, res, next) => {
    try {
        
        const { amount, trackingCode } = req.body;
        
        if (!req.files || !req.files.receiptImage) {
            const error = new Error("لطفاً تصویر فیش واریزی را آپلود کنید.");
            error.statusCode = 400;
            throw error;
        }

        const receiptImagePath = `/${req.files.receiptImage[0].path.replace(/\\/g, "/")}`;

        const newReceipt = await HostingReceipt.create({
            user: req.user._id,
            receiptImage: receiptImagePath,
            amount: Number(amount),
            trackingCode: trackingCode || ""
        });
        

        const adminPhone = process.env.ADMIN_PHONE_NUMBER || "09120000000";
        triggerSmsEvent("NEW_RECEIPT_ADMIN", adminPhone, { 
            fullName: req.user.fullName, 
            amount: amount 
        });

        res.status(201).json({
            success: true,
            message: "فیش واریزی شما با موفقیت ثبت شد و پس از تایید ادمین، به موجودی شما افزوده خواهد شد.",
            receipt: newReceipt
        });
    } catch (error) {
        console.error("❌ بک‌اند - ارور اصلی:", error); // این لاگ خیلی مهمه!
        next(error);
    }
};