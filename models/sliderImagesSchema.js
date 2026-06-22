const mongoose = require('mongoose');

const sliderImagesSchema = new mongoose.Schema({
  sliderImageOne: {
    type: String,
},
sliderImageTwo: {
    type: String,
},
sliderImageThree: {
    type: String,
},
});

module.exports = mongoose.model('SliderImages', sliderImagesSchema);
