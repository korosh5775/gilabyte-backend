const mongoose = require("mongoose");

/**
 * Singleton-style model — the app will always have at most one document.
 * Managed via the Admin GUI using findOneAndUpdate with { upsert: true }.
 */
const appVersionSchema = new mongoose.Schema(
  {
    latestVersion: {
      type: String,
      default: "1.0.0",
      trim: true,
    },
    minRequiredVersion: {
      type: String,
      default: "1.0.0",
      trim: true,
    },
    updateUrlAndroid: {
      type: String,
      default: "",
      trim: true,
    },
    updateUrlIOS: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppVersion", appVersionSchema);
