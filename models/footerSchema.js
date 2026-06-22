const mongoose = require("mongoose");

const FooterSchema = new mongoose.Schema(
  {
    brandImage: {
      type: String,
      //required: [true, "Brand image URL is required"],
    },
    shopName: {
      type: String,
      //required: [true, "Shop name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      //required: [true, "Phone number is required"],
      trim: true,
    },
    shopAddress: {
      type: String,
      //required: [true, "Shop address is required"],
      trim: true,
    },
    shopDescription: {
      type: String,
      //required: [true, "Shop description is required"],
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
    standardSymbolAddress: {
      type: String,
      //required: [false, "Standard symbol address is not required"],
    },
    trustSymbolAddress: {
      type: String,
      //required: [false, "Trust symbol address is not required"],
    },
    standardSymbolImage: {
      type: String,
      //required: [false, "Standard symbol image is not required"],
    },
    trustSymbolImage: {
      type: String,
      //required: [false, "Trust symbol image is not required"],
    },
  },

  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Since there should likely be only one shop configuration document,
// you might consider adding a unique index or handling this logic
// in the controller (e.g., using findOneAndUpdate with upsert).

module.exports = mongoose.model("Footer", FooterSchema);
