const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// تابع کمکی برای تعیین مسیر ذخیره
const getUploadPath = (fieldname) => {
  let uploadPath = "./images/";

  switch (fieldname) {
    case "imageOne":
    case "imageTwo":
    case "imageThree":
      uploadPath += "banners/costum/";
      break;
    /* case "shopLogo": 
      uploadPath += "shopLogo/";
      break; */
    //banner -> background
    case "lightBackground":
      uploadPath += "banners/costum/background/light/";
      break;
    case "darkBackground":
      uploadPath += "banners/costum/background/dark/";
      break;
    //ad
    case "adImage":
    case "image1":
    case "image2":
    case "image3":
      uploadPath += "ads/";
      break;
    //slider
    case "sliderImageOne":
    case "sliderImageTwo":
    case "sliderImageThree":
      uploadPath += "sliders/";
      break;
    //service
    case "serviceImage":
      uploadPath += "services/";
      break;
    //service -> children
    case "childImages":
    case fieldname.startsWith("childImage_") && fieldname:
      uploadPath += "services/children/";
      break;
    //footer -> shop
    case "brandImage":
      uploadPath += "footer/costum/brandImage/";
      break;
    //footer -> shop -> symbol
    case "standardSymbolImage":
    case "trustSymbolImage":
      uploadPath += "footer/costum/symbolImage/";
      break;
    //footer -> salon  
    case "barberBrandImage":
      uploadPath += "footerBarber/costum/brandImage/";
      break;
    //footer -> salon -> symbol
    case "barberStandardSymbolImage":
    case "barberTrustSymbolImage":
      uploadPath += "footerBarber/costum/symbolImage/";
      break;
    default:
      uploadPath += "products/";
  }
  return uploadPath;
};

// Custom Storage Engine using Sharp
class SharpStorage {
  constructor(opts) {
    this.getDestination = opts.destination || ((req, file, cb) => {
      const dest = getUploadPath(file.fieldname);
      // اگر مسیر وجود نداشت، آن را بساز
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    });
  }

  _handleFile(req, file, cb) {
    this.getDestination(req, file, (err, dir) => {
      if (err) return cb(err);

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = file.fieldname + "-" + uniqueSuffix + ext;
      const finalPath = path.join(dir, filename);

      // تنظیمات Sharp برای فشرده‌سازی
      const transformer = sharp();

      // تغییر سایز اگر تصویر خیلی بزرگ باشد (مثلا عرض بیشتر از 1920)
      transformer.resize({ width: 1920, withoutEnlargement: true });

      if (ext === '.png') {
        transformer.png({ quality: 80, compressionLevel: 9 });
      } else if (ext === '.jpeg' || ext === '.jpg') {
        transformer.jpeg({ quality: 80, mozjpeg: true });
      } else if (ext === '.webp') {
        transformer.webp({ quality: 80 });
      }

      const outStream = fs.createWriteStream(finalPath);

      file.stream.pipe(transformer).pipe(outStream);

      outStream.on('error', cb);
      outStream.on('finish', function () {
        cb(null, {
          path: finalPath,
          size: outStream.bytesWritten,
          filename: filename,
          destination: dir,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype
        });
      });
    });
  }

  _removeFile(req, file, cb) {
    fs.unlink(file.path, cb);
  }
}

// استفاده از انجین اختصاصی
const storage = new SharpStorage({});

// تنظیمات Multer
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB محدودیت حجم ورودی
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp") {
      cb(null, true);
    } else {
      cb(new Error("فقط فرمت‌های JPEG, PNG و WebP مجاز هستند."), false);
    }
  },
});

// هندلر خطاها
const handleError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "حجم فایل نباید بیشتر از 10MB باشد." });
    }
    return res.status(400).json({ message: `خطای Multer: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, handleError };
