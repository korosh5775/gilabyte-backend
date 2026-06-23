const Footer = require("../../../../models/footerSchema");
const fs = require("fs");
const path = require("path");

const updateFooter = async (req, res, next) => {
  console.log("--- updateFooter Request Start ---");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
  console.log("--- updateFooter Request End ---");

  const {
      groupName,
      phoneNumber,
      address,
      description,
      socialMedia1,
      socialMedia2,
      socialMedia3,
      socialMedia4,
      deletedImages
  } = req.body;

  try {
    const footer = await Footer.findOne(); // فقط یک رکورد داریم

    if (!footer) {
      const error = new Error("Footer record not found.");
      error.statusCode = 404;
      throw error;
    }
    console.log("deletedImages", deletedImages)
    // --- Start of image deletion and update logic ---
    const imagesToDelete = req.body.deletedImages ? JSON.parse(req.body.deletedImages) : [];
    const imageFields = ["logo"];
    const imageBasePaths = {
        logo: path.join("footer", "costum", "brandImage"),
    };

    const deleteImageFile = (imageField) => {
        if (footer[imageField]) {
            const filename = path.basename(footer[imageField]);
            const imagePath = path.join(__dirname, "../../../..", "images", imageBasePaths[imageField], filename);
            console.log(`Attempting to delete old image: ${imagePath}`);
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`Old image deleted: ${footer[imageField]}`);
                } catch (unlinkErr) {
                    console.error(`Error deleting file ${imagePath}:`, unlinkErr);
                }
            } else {
                console.log(`Old file not found for deletion: ${imagePath}`);
            }
            footer[imageField] = null; // Set field to null after attempting deletion
        }
    };

    // Delete images explicitly marked for deletion
    imagesToDelete.forEach((imageField) => {
        if (imageFields.includes(imageField)) {
            deleteImageFile(imageField);
        }
    });

    // Process new uploads, deleting old file first if it exists
    if (req.files?.logo) {
        deleteImageFile("logo"); // Delete old image if exists
        footer.logo = `/images/footer/costum/brandImage/${req.files.logo[0].filename}`;
    }

    // --- End of image deletion and update logic ---

    // به‌روزرسانی سایر فیلدها
    footer.groupName = groupName;
    footer.phoneNumber = phoneNumber;
    footer.address = address;
    footer.description = description;
    footer.socialMedia1 = socialMedia1;
    footer.socialMedia2 = socialMedia2;
    footer.socialMedia3 = socialMedia3;
    footer.socialMedia4 = socialMedia4;
    

    await footer.save();

    res.status(200).json(footer);
  } catch (error) {
    next(error);
  }
};

module.exports = updateFooter;
