const User = require('../../../models/usersSchema');
const SmsJob = require('../../../models/smsJob');
const { renderTemplate } = require('../../../utils/templateHelper');

/**
 * @desc    Send a manual bulk SMS for shop
 * @route   POST /api/v1.1/admin/shop/sms/manual
 * @access  Private (Admin)
 */
exports.sendShopManualSms = async (req, res, next) => {
    const { userIds, messageTemplate } = req.body;

    if (!userIds || userIds.length === 0 || !messageTemplate) {
        const err = new Error('لیست کاربران و متن پیام الزامی است.');
        err.statusCode = 400;
        throw err;
    }

    try {
        const users = await User.find({ '_id': { $in: userIds } }).select('firstName lastName phoneNumber');

        if (users.length === 0) {
            const err = new Error('کاربری با این مشخصات یافت نشد.');
            err.statusCode = 404;
            throw err;
        }

        const jobs = users.map(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

            const message = renderTemplate(messageTemplate, {
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: fullName,
                phoneNumber: user.phoneNumber
            });

            return {
                campaignId: null,
                userId: user._id,
                phoneNumber: user.phoneNumber,
                message: message,
                status: 'pending'
            };
        });

        await SmsJob.insertMany(jobs);

        res.status(202).json({ message: `${jobs.length} پیامک در صف ارسال قرار گرفت.` });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get list of sent SMS messages for shop
 * @route   GET /api/v1.1/admin/shop/sms/manual
 * @access  Private (Admin)
 */
exports.getShopSentSms = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        const smsList = await SmsJob.find(query)
            .populate('userId', 'fullName phoneNumber')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await SmsJob.countDocuments(query);

        res.status(200).json({
            smsList,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            totalSms: total
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete Shop SMS job(s)
 * @route   DELETE /admin/shop/sms/manual/:id
 * @route   DELETE /admin/shop/sms/manual (bulk delete with body: { ids: [...] })
 * @access  Private (Admin)
 */
exports.deleteSms = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { ids } = req.body;

        if (id) {
            const deletedSms = await SmsJob.findByIdAndDelete(id);

            if (!deletedSms) {
                const err = new Error('پیامک مورد نظر یافت نشد.');
                err.statusCode = 404;
                throw err;
            }

            return res.status(200).json({ message: 'پیامک با موفقیت حذف شد.' });
        } else if (ids && Array.isArray(ids) && ids.length > 0) {
            const result = await SmsJob.deleteMany({ _id: { $in: ids } });

            return res.status(200).json({
                message: `${result.deletedCount} پیامک با موفقیت حذف شد.`,
                deletedCount: result.deletedCount
            });
        } else {
            const err = new Error('شناسه پیامک یا لیست شناسه‌ها الزامی است.');
            err.statusCode = 400;
            throw err;
        }
    } catch (error) {
        next(error);
    }
};
