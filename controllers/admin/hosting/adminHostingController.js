const crypto = require("crypto");
const User = require("../../../models/usersSchema");
const HostingReceipt = require("../../../models/hostingReceiptSchema");
const { triggerSmsEvent } = require("../../../utils/smsEventTrigger");

/**
 * @desc    تغییر تنظیمات مالی یک کاربر (تعیین هزینه روزانه یا شارژ دستی)
 * @route   PATCH /admin/hosting/user/:userId
 */
exports.updateUserBilling = async (req, res, next) => {
    try {
        const { dailyCost, addBalance, isActive, domain } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            const error = new Error("کاربر یافت نشد.");
            error.statusCode = 404;
            throw error;
        }

        if (domain !== undefined) {
            user.hosting.domain = domain
                .toLowerCase()
                .trim()
                .replace(/^https?:\/\//, "")
                .replace(/^www\./, "")
                .split("/")[0];
        }

        // 🟢 امکان وارد کردن عدد مثبت (افزایش شارژ) یا منفی (کسر دستی شارژ)
        if (addBalance && Number(addBalance) !== 0) {
            user.hosting.balance += Number(addBalance);
            user.hosting.lastChargeDate = new Date();
        }

        if (dailyCost !== undefined && Number(dailyCost) !== user.hosting.dailyCost) {
            user.hosting.dailyCost = Number(dailyCost);
            user.hosting.lastDailyCostUpdate = new Date();
        }

        if (isActive !== undefined) {
            user.hosting.isActive = isActive;
        }

        // 🔑 اگر کاربر هنوز کلید اتصال به اپ آرایشگاه ندارد، خودکار برایش بساز
        if (!user.hosting.licenseKey) {
            user.hosting.licenseKey = "gb_" + crypto.randomBytes(16).toString("hex");
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "تنظیمات مالی کاربر با موفقیت بروزرسانی شد.",
            hosting: user.hosting
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    تایید یا رد فیش واریزی کاربر توسط ادمین
 * @route   PATCH /admin/hosting/receipt/:receiptId
 */
exports.processReceipt = async (req, res, next) => {
    try {
        const { status, adminNote, approvedAmount } = req.body; 
        const receipt = await HostingReceipt.findById(req.params.receiptId).populate("user");

        if (!receipt) {
            const error = new Error("رسید یافت نشد.");
            error.statusCode = 404;
            throw error;
        }

        if (receipt.status !== 'pending') {
            const error = new Error("این رسید قبلاً بررسی شده است.");
            error.statusCode = 400;
            throw error;
        }

        receipt.status = status;
        if (adminNote) receipt.adminNote = adminNote;

        if (status === 'approved') {
            const finalAmount = approvedAmount ? Number(approvedAmount) : receipt.amount;
            receipt.amount = finalAmount;
            
            receipt.user.hosting.balance += finalAmount;
            receipt.user.hosting.lastChargeDate = new Date();
            receipt.user.hosting.isActive = true;
            await receipt.user.save();

            triggerSmsEvent("RECEIPT_APPROVED_USER", receipt.user.phoneNumber, { 
                amount: finalAmount 
            });
        } 
        else if (status === 'rejected') {
            triggerSmsEvent("RECEIPT_REJECTED_USER", receipt.user.phoneNumber, { 
                amount: receipt.amount 
            });
        }

        await receipt.save();

        res.status(200).json({
            success: true,
            message: `رسید با موفقیت ${status === 'approved' ? 'تایید' : 'رد'} شد.`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    دریافت داشبورد مالی ادمین
 * @route   GET /admin/hosting/dashboard
 */
exports.getHostingDashboard = async (req, res, next) => {
    try {
        const pendingReceipts = await HostingReceipt.find({ status: 'pending' })
            .populate('user', 'fullName phoneNumber')
            .sort({ createdAt: -1 });
        
        // 🟢 تغییر $gt: 0 به $ne: 0 تا کاربران دارای موجودی منفی (بدهکار) هم نمایش داده شوند
        const users = await User.find({ 
            $or: [
                { 'hosting.isActive': true },
                { 'hosting.balance': { $ne: 0 } },
                { 'hosting.dailyCost': { $gt: 0 } }
            ]
        }).select('fullName phoneNumber hosting status');

        res.status(200).json({ success: true, pendingReceipts, users });
    } catch (error) {
        next(error);
    }
};