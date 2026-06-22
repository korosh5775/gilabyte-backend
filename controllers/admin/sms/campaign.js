// controllers/admin/sms/campaign.js

const Campaign = require('../../../models/campaign');

/**
 * @desc    Create a new shop campaign
 * @route   POST /api/shop/campaigns
 * @access  Private (Admin)
 */
exports.createCampaign = async (req, res) => {
    try {
        const campaign = new Campaign(req.body);
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get all shop campaigns
 * @route   GET /api/shop/campaigns
 * @access  Private (Admin)
 */
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({});
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ success: false, error: 'خطای سرور' });
    }
};

/**
 * @desc    Get a single shop campaign by ID
 * @route   GET /api/shop/campaigns/:id
 * @access  Private (Admin)
 */
exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ success: false, error: 'کمپین مورد نظر یافت نشد' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        res.status(500).json({ success: false, error: 'خطای سرور' });
    }
};

/**
 * @desc    Update a shop campaign
 * @route   PUT /api/shop/campaigns/:id
 * @access  Private (Admin)
 */
exports.updateCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!campaign) {
            return res.status(404).json({ success: false, error: 'کمپین مورد نظر یافت نشد' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete a shop campaign
 * @route   DELETE /api/shop/campaigns/:id
 * @access  Private (Admin)
 */
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);
        if (!campaign) {
            return res.status(404).json({ success: false, error: 'کمپین مورد نظر یافت نشد' });
        }
        res.status(200).json({ success: true, message: 'کمپین با موفقیت حذف شد' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'خطای سرور' });
    }
};

/**
 * @desc    Toggle a shop campaign's status (active/inactive)
 * @route   PATCH /api/shop/campaigns/:id/status
 * @access  Private (Admin)
 */
exports.toggleCampaignStatus = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ success: false, error: 'کمپین مورد نظر یافت نشد' });
        }

        campaign.status = campaign.status === 'active' ? 'inactive' : 'active';
        await campaign.save();

        res.status(200).json(campaign);
    } catch (error) {
        res.status(500).json({ success: false, error: 'خطای سرور' });
    }
};
