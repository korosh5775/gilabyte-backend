// services/scheduler.service.js

const Campaign = require('../models/campaign');
const CampaignLog = require('../models/campaignLog');
const SmsJob = require('../models/smsJob');
const audienceBuilder = require('./audienceBuilder.service');
const { renderTemplate } = require('../utils/templateHelper');

// یک تابع کمکی برای بررسی اینکه آیا کمپین امروز باید اجرا شود
const isCampaignDue = (campaign) => {
    const now = new Date();
    const { schedule } = campaign;

    // جلوگیری از اجرای مجدد در یک روز
    if (campaign.lastRanAt) {
        const lastRun = new Date(campaign.lastRanAt);
        if (lastRun.getFullYear() === now.getFullYear() &&
            lastRun.getMonth() === now.getMonth() &&
            lastRun.getDate() === now.getDate()) {
            return false; // امروز قبلا اجرا شده
        }
    }

    switch (schedule.type) {
        case 'daily':
            return true;
        case 'weekly':
            return now.getDay() === schedule.dayOfWeek;
        case 'monthly':
            return now.getDate() === schedule.dayOfMonth;
        case 'once':
            const runDate = new Date(schedule.runAtDate);
            return now.getFullYear() === runDate.getFullYear() &&
                now.getMonth() === runDate.getMonth() &&
                now.getDate() === runDate.getDate();
        default:
            return false;
    }
};

const runScheduledCampaigns = async () => {
    console.log('Shop Campaign Scheduler running...');

    try {
        const activeCampaigns = await Campaign.find({ status: 'active' });

        for (const campaign of activeCampaigns) {
            if (isCampaignDue(campaign)) {
                console.log(`Shop Campaign "${campaign.name}" is due. Finding audience...`);

                const targetUsers = await audienceBuilder.findTargetUsers(campaign);

                if (targetUsers.length === 0) {
                    console.log(`No new users found for shop campaign "${campaign.name}".`);
                    continue;
                }

                console.log(`Found ${targetUsers.length} new users for shop campaign "${campaign.name}".`);

                const smsJobsToCreate = [];
                const campaignLogsToCreate = [];

                // محاسبه تاریخ انقضای لاگ
                const conditionWithDays = campaign.conditions.find(c => c.value && typeof c.value.days === 'number');
                const expirationDays = conditionWithDays ? conditionWithDays.value.days : 30;

                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + expirationDays);

                for (const user of targetUsers) {
                    const templateData = {
                        CustomerFullName: user.fullName,
                        CustomerName: user.fullName.split(' ')[0],
                        CustomerPhoneNumber: user.phoneNumber,
                        ShopName: "فروشگاه ما" // می‌توانید از تنظیمات فروشگاه بخوانید
                    };

                    const personalizedMessage = renderTemplate(campaign.messageTemplate, templateData);

                    smsJobsToCreate.push({
                        campaignId: campaign._id,
                        userId: user._id,
                        phoneNumber: user.phoneNumber,
                        message: personalizedMessage,
                    });

                    campaignLogsToCreate.push({
                        campaignId: campaign._id,
                        userId: user._id,
                        expiresAt: expiresAt,
                    });
                }

                if (smsJobsToCreate.length > 0) {
                    await SmsJob.insertMany(smsJobsToCreate);
                }
                if (campaignLogsToCreate.length > 0) {
                    await CampaignLog.insertMany(campaignLogsToCreate);
                }

                campaign.lastRanAt = new Date();
                if (campaign.schedule.type === 'once') {
                    campaign.status = 'archived';
                }
                await campaign.save();
            }
        }
    } catch (error) {
        console.error("A critical error occurred in runScheduledCampaigns:", error);
    }

    console.log('Shop Campaign Scheduler finished.');
};

module.exports = { runScheduledCampaigns };
