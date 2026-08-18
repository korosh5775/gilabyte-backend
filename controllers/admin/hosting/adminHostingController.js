const User = require("../../../models/usersSchema");
const HostingReceipt = require("../../../models/hostingReceiptSchema");
const { triggerSmsEvent } = require("../../../utils/smsEventTrigger");

/**
 * @desc    تغییر تنظیمات مالی یک کاربر (تعیین هزینه روزانه یا شارژ دستی)
 * @route   PATCH /admin/hosting/user/:userId
 */
exports.updateUserBilling = async (req, res, next) => {
    try {
        const { dailyCost, addBalance, isActive } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            const error = new Error("کاربر یافت نشد.");
            error.statusCode = 404;
            throw error;
        }

        // اگر ادمین مبلغ شارژ دستی وارد کرده بود
        if (addBalance && Number(addBalance) > 0) {
            user.hosting.balance += Number(addBalance);
            user.hosting.lastChargeDate = new Date();
        }

        // اگر هزینه روزانه تغییر کرده بود
        if (dailyCost !== undefined && Number(dailyCost) !== user.hosting.dailyCost) {
            user.hosting.dailyCost = Number(dailyCost);
            user.hosting.lastDailyCostUpdate = new Date();
        }

        if (isActive !== undefined) {
            user.hosting.isActive = isActive;
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

        receipt.status = status; // 'approved' یا 'rejected'
        if (adminNote) receipt.adminNote = adminNote;

        // اگر تایید شد، پول را به حساب کاربر اضافه کن
        if (status === 'approved') {
            // ممکن است ادمین بخواهد مبلغ را ویرایش کند (مثلا کاربر زده 100 تومن ولی 90 تومن واریز کرده)
            const finalAmount = approvedAmount ? Number(approvedAmount) : receipt.amount;
            receipt.amount = finalAmount;
            
            receipt.user.hosting.balance += finalAmount;
            receipt.user.hosting.lastChargeDate = new Date();
            receipt.user.hosting.isActive = true; // سرویس خودکار فعال شود
            await receipt.user.save();

            // 🟢 پیامک تایید به کاربر
            triggerSmsEvent("RECEIPT_APPROVED_USER", receipt.user.phoneNumber, { 
                amount: finalAmount 
            });
        } 
        else if (status === 'rejected') {
            // 🔴 پیامک رد شدن فیش به کاربر
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

// اضافه کردن به فایل: controllers/admin/hosting/adminHostingController.js
exports.getHostingDashboard = async (req, res, next) => {
    try {
        // دریافت فیش‌های در انتظار بررسی
        const pendingReceipts = await HostingReceipt.find({ status: 'pending' }).populate('user', 'fullName phoneNumber').sort({ createdAt: -1 });
        
        // دریافت کاربرانی که سرویس‌شان فعال است یا موجودی/هزینه دارند
        const users = await User.find({ 
            $or: [
                { 'hosting.isActive': true },
                { 'hosting.balance': { $gt: 0 } },
                { 'hosting.dailyCost': { $gt: 0 } }
            ]
        }).select('fullName phoneNumber hosting status');

        res.status(200).json({ success: true, pendingReceipts, users });
    } catch (error) {
        next(error);
    }
};