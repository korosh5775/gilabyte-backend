const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// تابع کمکی برای تعیین مسیر ذخیره
const getUploadPath = (fieldname) => {
  let uploadPath = "./images/";

    // 🟢 هندل کردن داینامیک عکس‌های تیم قبل از switch
  if (fieldname.startsWith("teamImage_")) {
    return uploadPath + "about/team/";
  }


  switch (fieldname) {
    case "sliderImageOne":
    case "sliderImageTwo":
    case "sliderImageThree":
      uploadPath += "sliders/";
      break;
    case "logo":
      uploadPath += "footer/costum/brandImage/";
      break;
    // -----> مسیر جدید برای عکس کارت خدمات <-----
    case "serviceThumbnail":
      uploadPath += "services/thumbnails/";
      break;
    // -----> مسیر جدید برای عکس‌های نمونه‌کار و مشتریان <-----
    case "portfolioImage":
      uploadPath += "portfolios/";
      break;
    case "founderImage":
      uploadPath += "about/founder/";
      break;
    default:
      uploadPath += "others/";
  }
  return uploadPath;
};

// Custom Storage Engine using Sharp
class SharpStorage {
  constructor(opts) {
    this.getDestination = opts.destination || ((req, file, cb) => {
      const dest = getUploadPath(file.fieldname);
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

      const transformer = sharp().rotate();;
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
        // مسیر نهایی را برای ذخیره در دیتابیس بهینه می‌کنیم
        const dbPath = finalPath.replace(/\\/g, '/'); // تبدیل \ به / برای ویندوز
        cb(null, {
          path: dbPath,
          size: outStream.bytesWritten,
          filename: filename,
          mimetype: file.mimetype
        });
      });
    });
  }

  _removeFile(req, file, cb) {
    fs.unlink(file.path, cb);
  }
}

const storage = new SharpStorage({});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp") {
      cb(null, true);
    } else {
      cb(new Error("فقط فرمت‌های JPEG, PNG و WebP مجاز هستند."), false);
    }
  },
});

const handleError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "حجم فایل نباید بیشتر از 10MB باشد." });
    }
    return res.status(400).json({ message: `خطای Multer: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, handleError };