const SliderImage = require("../../../../models/sliderImagesSchema");

// تابع برای ایجاد BannerItem جدید
const createSliderImages = async (req, res) => {
  try {
    // Extract text fields from the request body
    

    // Extract image paths from the uploaded files
    const imagePaths = {
      sliderImageOne: req.files?.sliderImageOne ? `/images/sliders/${req.files.sliderImageOne[0].filename}` : null,
      sliderImageTwo: req.files?.sliderImageTwo ? `/images/sliders/${req.files.sliderImageTwo[0].filename}` : null,
      sliderImageThree: req.files?.sliderImageThree ? `/images/sliders/${req.files.sliderImageThree[0].filename}` : null,
    };
    console.log("files received:", req.files);

    // ایجاد یک بنر جدید
    const newSliderImage = new SliderImage({
      ...imagePaths, 
    });

    const savedImageSlider = await newSliderImage.save();
    return res.status(201).json({ message: "Banner item created", imageSlider: savedImageSlider });
  } catch (error) { 
    console.error("Error in createBannerItem:", error);
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return res.status(400).json({ message: "Validation Error", errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }

};

module.exports = createSliderImages;
 