// controllers/sliderController.js

const SliderImage = require("../../../../models/sliderImagesSchema");

const GetSliderImages =async (req, res,next)=>{

  try {
    const images =await SliderImage.find();
    if(!images){
      const err = new Error("There is no details to show!");
      err.statusCode = 404; // Not found
      throw err;
    }
    res.status(200).json(images);
  } catch (error) {
    next(error);
  }
}
module.exports =  GetSliderImages;
