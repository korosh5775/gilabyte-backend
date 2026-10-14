const AppVersion = require("../../models/AppVersionSchema");

const DEFAULTS = {
  latestVersion: "1.0.0",
  minRequiredVersion: "1.0.0",
  updateUrlAndroid: "",
  updateUrlIOS: "",
};

/**
 * @controller getAppVersion
 * @route GET /api/v1.1/shared/app-version
 * @access Public (no authentication required)
 * @description Returns the current app version configuration from MongoDB
 *              for force-update checking in the React Native Admin App.
 *              Falls back to safe defaults if no document exists yet.
 */
const getAppVersion = async (req, res, next) => {
  try {
    const config = await AppVersion.findOne();

    const data = config
      ? {
          latestVersion: config.latestVersion,
          minRequiredVersion: config.minRequiredVersion,
          updateUrlAndroid: config.updateUrlAndroid,
          updateUrlIOS: config.updateUrlIOS,
        }
      : DEFAULTS;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = getAppVersion;
