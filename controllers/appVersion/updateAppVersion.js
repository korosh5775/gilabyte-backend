const AppVersion = require("../../models/AppVersionSchema");

/**
 * @controller updateAppVersion
 * @route PUT /api/v1.1/shared/app-version
 * @access Private — Admin / Owner only (authenticated + hasRole)
 * @description Creates or updates the singleton app version document.
 *              Uses upsert so the first PUT call bootstraps the record
 *              without needing a separate seed/create step.
 */
const updateAppVersion = async (req, res, next) => {
  try {
    const { latestVersion, minRequiredVersion, updateUrlAndroid, updateUrlIOS } =
      req.body;

    const updatePayload = {};
    if (latestVersion !== undefined) updatePayload.latestVersion = latestVersion;
    if (minRequiredVersion !== undefined) updatePayload.minRequiredVersion = minRequiredVersion;
    if (updateUrlAndroid !== undefined) updatePayload.updateUrlAndroid = updateUrlAndroid;
    if (updateUrlIOS !== undefined) updatePayload.updateUrlIOS = updateUrlIOS;

    if (Object.keys(updatePayload).length === 0) {
      const error = new Error("No valid fields provided for update.");
      error.statusCode = 400;
      throw error;
    }

    const updated = await AppVersion.findOneAndUpdate(
      {}, // singleton — match the first (and only) document
      { $set: updatePayload },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = updateAppVersion;
