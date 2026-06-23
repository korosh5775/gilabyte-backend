const mongoose = require("mongoose");

const FooterSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
    },
    groupName: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    socialMedia1: {
      type: String,
      trim: true,
    },
    socialMedia2: {
      type: String,
      trim: true,
    },
    socialMedia3: {
      type: String,
      trim: true,
    },
    socialMedia4: {
      type: String,
      trim: true,
    },
  },

  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model("Footer", FooterSchema);
