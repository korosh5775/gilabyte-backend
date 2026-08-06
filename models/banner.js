// models/banner.js
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: { 
    type: String, 
    default: "آینده دیجیتال خود را با گیلابایت بسازید" 
  },
  highlightWord: { 
    type: String, 
    default: "گیلابایت" // این کلمه در فرانت‌اند آبی می‌شود
  },
  subtitle: { 
    type: String, 
    default: "طراحی انواع وبسایت ها با جدیدترین تکنولوژی‌های روز دنیا؛ سریع‌تر، زیباتر و بهینه‌تر از همیشه." 
  },
  imageLight: { 
    type: String, 
    default: "" // عکس مخصوص تم روشن
  },
  imageDark: { 
    type: String, 
    default: "" // عکس مخصوص تم تاریک
  }
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);