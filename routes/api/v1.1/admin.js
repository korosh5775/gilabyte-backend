const express = require("express");

// Import middlewares
const { upload, handleError } = require("../../../utils/multer");
const authenticated = require("../../../middlewares/authorization");
const hasRole = require("../../../middlewares/hasRole");

const router = express.Router();

// =========================================================================
// ========================     Image Slider      ==========================
// =========================================================================
const uploadSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/createSliderImages");
const RemoveSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/RemoveSliderImages");
const getSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/getSliderImages");
const updateSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/updateSliderImages");

router.delete("/slider-images/:index", authenticated, hasRole(['admin', 'owner']), RemoveSliderImages);
router.post("/slider-images", authenticated, hasRole(['admin', 'owner']), upload.fields([{ name: "sliderImageOne", maxCount: 1 }, { name: "sliderImageTwo", maxCount: 1 }, { name: "sliderImageThree", maxCount: 1 }]), uploadSliderImages);
router.get("/slider-images", getSliderImages);
router.patch("/slider-images", authenticated, hasRole(['admin', 'owner']), upload.fields([{ name: "sliderImageOne", maxCount: 1 }, { name: "sliderImageTwo", maxCount: 1 }, { name: "sliderImageThree", maxCount: 1 }]), updateSliderImages);

// =========================================================================
// ============================     Footer      ============================
// =========================================================================
const getFooter = require("../../../controllers/admin/mainPageEditor/footer/getFooter");
const updateFooter = require("../../../controllers/admin/mainPageEditor/footer/updateFooter");
const deleteFooter = require("../../../controllers/admin/mainPageEditor/footer/deleteFooter");
const newFooter = require("../../../controllers/admin/mainPageEditor/footer/newFooter");

router.get("/main-page/my-footer", getFooter);
router.delete("/footer-remove", deleteFooter);
router.patch("/main-page/my-footer", upload.fields([{ name: "logo", maxCount: 1 }]), updateFooter);
router.post("/main-page/my-footer", upload.fields([{ name: "logo", maxCount: 1 }]), newFooter);

// =========================================================================
// ========================       Users         ============================
// =========================================================================
const { updateUserStatus, getUser, changeUserRole } = require("../../../controllers/admin/users/userManager");
const searchUsers = require("../../../controllers/admin/users/searchUsers");
const getUsers = require("../../../controllers/admin/users/getUsers");
const getAdminProfile = require("../../../controllers/admin/users/getAdminProfile");


router.get('/users/search', authenticated, hasRole(['admin', 'owner']), searchUsers);
router.get("/users/get-all", authenticated, hasRole(['admin', 'owner']), getUsers);
router.get("/profile", authenticated, hasRole(['admin', 'owner']), getAdminProfile);
router.patch("/users/:userId/status", authenticated, hasRole(['admin', 'owner']), updateUserStatus);
router.patch("/users/:userId/role", authenticated, hasRole(['owner']), changeUserRole);
router.get("/users/:userId", authenticated, hasRole(['admin', 'owner']), getUser);

// =========================================================================
// ========================       Services        ==========================
// =========================================================================
// تبدیل import به require برای جلوگیری از ارور
const createService = require('../../../controllers/admin/services/createService');
const updateService = require('../../../controllers/admin/services/updateService');
const deleteService = require('../../../controllers/admin/services/deleteService');
const toggleServiceStatus = require('../../../controllers/admin/services/toggleServiceStatus');
const getAdminServices = require('../../../controllers/admin/services/getAdminServices');
const getAdminServiceById = require('../../../controllers/admin/services/getAdminServiceById');

// دریافت لیست کامل خدمات برای جدول پنل ادمین
router.get(
  '/services', 
  authenticated, 
  hasRole(['admin', 'owner']), 
  getAdminServices
);

// ایجاد خدمت جدید (همراه با عکس)
router.post(
  '/services',
  authenticated, 
  hasRole(['admin', 'owner']),  
  upload.fields([{ name: "serviceThumbnail", maxCount: 1 }]), 
  handleError,
  createService
);

router.get(
  '/services/:id', 
  authenticated, 
  hasRole(['admin', 'owner']), 
  getAdminServiceById
);

// ویرایش یک خدمت (عکس اختیاری است)
router.patch(
  '/services/:id',
  authenticated, 
  hasRole(['admin', 'owner']),  
  upload.fields([{ name: "serviceThumbnail", maxCount: 1 }]), 
  handleError,
  updateService
);

// تغییر وضعیت (فعال/غیرفعال)
router.patch(
  '/services/:id/status',
  authenticated, 
  hasRole(['admin', 'owner']),  
  toggleServiceStatus
);

// حذف کامل یک خدمت
router.delete(
  '/services/:id',
  authenticated, 
  hasRole(['admin', 'owner']),  
  deleteService
);




const getOrders = require('../../../controllers/admin/orders/getOrders');
const updateOrderStatus = require('../../../controllers/admin/orders/updateOrderStatus');

// روت‌های مربوط به سفارشات
router.get('/orders', authenticated, hasRole(['admin', 'owner']), getOrders);
router.patch('/orders/:orderId/status', authenticated, hasRole(['admin', 'owner']), updateOrderStatus);

// =========================================================================
// ====================     Portfolios & Clients     =======================
// =========================================================================
const swapPortfolioOrder = require("../../../controllers/admin/portfolio/swapPortfolioOrder");
const createPortfolio = require("../../../controllers/admin/portfolio/createPortfolio");
const getPortfolioById = require("../../../controllers/admin/portfolio/getPortfolioById");
const updatePortfolio = require("../../../controllers/admin/portfolio/updatePortfolio");
const deletePortfolio = require("../../../controllers/admin/portfolio/deletePortfolio");
// جابجایی ترتیب دو نمونه‌کار
router.patch(
  "/portfolio/swap-order",
  authenticated,
  hasRole(["admin", "owner"]),
  swapPortfolioOrder
);

// ایجاد نمونه‌کار / مشتری جدید (همراه با عکس)
router.post(
  "/portfolio",
  authenticated,
  hasRole(["admin", "owner"]),
  upload.fields([{ name: "portfolioImage", maxCount: 1 }]),
  handleError,
  createPortfolio
);

// دریافت تکی یک نمونه‌کار / مشتری با شناسه ID
router.get(
  "/portfolio/:id",
  authenticated,
  hasRole(["admin", "owner"]),
  getPortfolioById
);

// ویرایش نمونه‌کار / مشتری (عکس اختیاری است)
router.patch(
  "/portfolio/:id",
  authenticated,
  hasRole(["admin", "owner"]),
  upload.fields([{ name: "portfolioImage", maxCount: 1 }]),
  handleError,
  updatePortfolio
);

// حذف نمونه‌کار / مشتری
router.delete(
  "/portfolio/:id",
  authenticated,
  hasRole(["admin", "owner"]),
  deletePortfolio
);



const updateAbout = require("../../../controllers/admin/about/updateAbout");


router.patch('/update-about', authenticated, hasRole(['admin', 'owner']),
   upload.fields([
    { name: 'founderImage', maxCount: 1 },
    { name: 'teamImage_0', maxCount: 1 },
    { name: 'teamImage_1', maxCount: 1 },
    { name: 'teamImage_2', maxCount: 1 },
    { name: 'teamImage_3', maxCount: 1 },
    { name: 'teamImage_4', maxCount: 1 },
    // تا هر چندتا که دوست دارید میتونید بنویسید
  ]),handleError,  updateAbout);

module.exports = router;