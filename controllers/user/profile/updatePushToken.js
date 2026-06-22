const User = require('../../../models/usersSchema');

/**
 * @desc    به‌روزرسانی توکن پوش (Push Token) کاربر لاگین شده
 * @route   PATCH /users/me/push-token
 * @access  Private
 */
exports.updateUserPushToken = async (req, res, next) => {
    try {
        const { pushToken } = req.body;
        const userId = req.user._id; // فرض بر این است که middleware احراز هویت req.user را تنظیم کرده است
 
        if (!pushToken) {
            const error = new Error("Push token is required.");
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findById(userId);

        if (!user) {
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }

        // اگر توکن پوش قبلی با توکن جدید متفاوت است، آن را به‌روزرسانی کن
        console.log(`Updating push token for user ${userId}. New token: ${pushToken}`);
        if (user.pushToken !== pushToken) {
            user.pushToken = pushToken;
            await user.save();
            console.log(`Push token updated successfully for user ${user.fullName}`);
            res.status(200).json({ message: "Push token updated successfully." });
        } else {
            console.log(`Push token for user ${user.fullName} is already up to date.`);
            res.status(200).json({ message: "Push token is already up to date." });
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        console.error("Error in updateUserPushToken:", err);
        next(err);
    }
};
