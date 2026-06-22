// controllers/admin/sms/report.js

const SmsJob = require('../../../models/smsJob');
const Campaign = require('../../../models/campaign');

/**
 * @desc    دریافت خلاصه عملکرد تمام کمپین‌های فروشگاه
 * @route   GET /admin/shop/reports/campaign-summary
 * @query   startDate, endDate
 * @access  Private (Admin) 
 */
exports.getCampaignSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const summary = await Campaign.aggregate([
            {
                $lookup: {
                    from: SmsJob.collection.name,
                    let: { campaignId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$campaignId', '$$campaignId'] },
                                ...(startDate && endDate && {
                                    createdAt: {
                                        $gte: new Date(startDate),
                                        $lte: new Date(endDate)
                                    }
                                })
                            }
                        }
                    ],
                    as: 'jobs'
                }
            },
            {
                $addFields: {
                    sentCount: {
                        $size: {
                            $filter: {
                                input: '$jobs',
                                as: 'job',
                                cond: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ['$$job.status', 'sent'] },
                                                {
                                                    $regexMatch: {
                                                        input: { $ifNull: ['$$job.apiResponse', ''] },
                                                        regex: /"RetStatus":1[,}]|"StrRetStatus":"Success"/
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $eq: ['$$job.status', 'sent'] },
                                                { $eq: [{ $type: '$$job.apiResponse' }, 'missing'] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    failedCount: {
                        $size: {
                            $filter: {
                                input: '$jobs',
                                as: 'job',
                                cond: {
                                    $or: [
                                        { $eq: ['$$job.status', 'failed'] },
                                        {
                                            $and: [
                                                { $eq: ['$$job.status', 'sent'] },
                                                {
                                                    $regexMatch: {
                                                        input: { $ifNull: ['$$job.apiResponse', ''] },
                                                        regex: /"RetStatus":(?!1[,}])\d+|"StrRetStatus":"(?!Success).+"/
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    status: 1,
                    sentCount: 1,
                    failedCount: 1
                }
            },
            { $sort: { name: 1 } }
        ]);

        res.status(200).json(summary);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    دریافت لیست کاربران دریافت‌کننده پیامک برای یک کمپین خاص فروشگاه
 * @route   GET /admin/shop/reports/campaigns/:campaignId
 * @query   startDate, endDate
 * @access  Private (Admin)
 */
exports.getCampaignDetails = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const { startDate, endDate } = req.query;

        const query = { campaignId };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const jobs = await SmsJob.find(query)
            .populate('userId', 'fullName phoneNumber')
            .sort({ createdAt: -1 });

        res.status(200).json(jobs);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    دریافت تاریخچه کامل پیامک‌های ارسال شده برای یک کاربر خاص در فروشگاه
 * @route   GET /admin/shop/reports/users/:userId
 * @query   startDate, endDate
 * @access  Private (Admin)
 */
exports.getShopUserSmsHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const jobs = await SmsJob.find(query)
            .populate('campaignId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(jobs);
    } catch (err) {
        next(err);
    }
};
