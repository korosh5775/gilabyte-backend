// Import necessary modules
// ------------------------------------------------
const express = require("express");

// Import middlewares
// ------------------------------------------------
const { upload, handleError } = require("../../../utils/multer"); // Image upload handling
const authenticated = require("../../../middlewares/authorization"); // Authentication middleware
const hasRole = require("../../../middlewares/hasRole"); // Role authorization middleware

// Create an Express router
// ------------------------------------------------
const router = express.Router();
// =========================================================================
// ========================     Image Slider      ==========================
// =========================================================================

//Import controllers for maiePage /ImageSlider
const uploadSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/createSliderImages");
const RemoveSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/RemoveSliderImages");
const getSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/getSliderImages");
const updateSliderImages = require("../../../controllers/admin/mainPageEditor/ImageSlider/updateSliderImages");

//Define routes for image slider
router.delete("/slider-images/:index", authenticated, hasRole(['admin', 'owner']), RemoveSliderImages);

router.post(
  "/slider-images",
  authenticated, hasRole(['admin', 'owner']),
  upload.fields([
    { name: "sliderImageOne", maxCount: 1 },
    { name: "sliderImageTwo", maxCount: 1 },
    { name: "sliderImageThree", maxCount: 1 },
  ]),
  uploadSliderImages
);

router.get("/slider-images", getSliderImages);
router.patch(
  "/slider-images",
  authenticated, hasRole(['admin', 'owner']),
  upload.fields([
    { name: "sliderImageOne", maxCount: 1 },
    { name: "sliderImageTwo", maxCount: 1 },
    { name: "sliderImageThree", maxCount: 1 },
  ]),
  updateSliderImages
);
// =========================================================================
// ============================     Footer      ============================
// =========================================================================

// Import controllers for footer
const getFooter = require("../../../controllers/admin/mainPageEditor/footer/getFooter");
const updateFooter = require("../../../controllers/admin/mainPageEditor/footer/updateFooter");
const deleteFooter = require("../../../controllers/admin/mainPageEditor/footer/deleteFooter");
const newFooter = require("../../../controllers/admin/mainPageEditor/footer/newFooter");

//Define routes for footer
router.get("/main-page/my-footer", authenticated, hasRole(['admin', 'owner']), getFooter);
//router.get("/main-page/default-footer", getDefaultFooter);
router.delete("/footer-remove", authenticated, hasRole(['admin', 'owner']), deleteFooter);
router.patch(
  "/main-page/my-footer",
  authenticated, hasRole(['admin', 'owner']),
  upload.fields([
    { name: "brandImage", maxCount: 1 },
    { name: "standardSymbolImage", maxCount: 1 },
    { name: "trustSymbolImage", maxCount: 1 },
  ]),
  updateFooter
);
router.post(
  "/main-page/my-footer",
  authenticated, hasRole(['admin', 'owner']),
  upload.fields([
    { name: "brandImage", maxCount: 1 },
    { name: "standardSymbolImage", maxCount: 1 },
    { name: "trustSymbolImage", maxCount: 1 },
  ]),
  newFooter
);
// =========================================================================
// ========================     Barber Footer      =========================
// =========================================================================

// Import controllers for Barber footer

//Define routes for barber footer

const { updateUserStatus, getUser, getOrders, getComments, updateCommentStatus, deleteAnswer, deleteComment, changeUserRole } = require("../../../controllers/admin/users/userManager");
const searchUsers = require("../../../controllers/admin/users/searchUsers");
const getUsers = require("../../../controllers/admin/users/getUsers");

router.get('/users/search', authenticated, hasRole(['admin', 'owner']), searchUsers);

router.get("/users/get-all", authenticated, hasRole(['admin', 'owner']), getUsers);
router.patch("/users/:userId/status", authenticated, hasRole(['admin', 'owner']), updateUserStatus);
router.patch("/users/:userId/role", authenticated, hasRole(['owner']), changeUserRole);
router.get("/users/:userId", authenticated, hasRole(['admin', 'owner']), getUser);
// router.get("/users/:userId/orders", authenticated, hasRole(['admin', 'owner']), getOrders);
// router.get("/users/:userId/comments", authenticated, hasRole(['admin', 'owner']), getComments);
// router.patch("/comments/:commentId/status", authenticated, hasRole(['admin', 'owner']), updateCommentStatus)
// router.delete("/comments/:commentId/answer", authenticated, hasRole(['admin', 'owner']), deleteAnswer);
// router.delete("/comments/:commentId", authenticated, hasRole(['admin', 'owner']), deleteComment);
// =========================================================================
// ======================     Shop SMS Campaigns      ======================
// =========================================================================

const { createCampaign, getAllCampaigns, getCampaignById, updateCampaign, deleteCampaign, toggleCampaignStatus } = require("../../../controllers/admin/sms/campaign");

// Define routes for shop sms campaigns
router.post('/shop/sms-campaigns', authenticated, hasRole(['admin', 'owner']), createCampaign);
router.get('/shop/sms-campaigns', authenticated, hasRole(['admin', 'owner']), getAllCampaigns);
router.get('/shop/sms-campaigns/:id', authenticated, hasRole(['admin', 'owner']), getCampaignById);
router.put('/shop/sms-campaigns/:id', authenticated, hasRole(['admin', 'owner']), updateCampaign);
router.delete('/shop/sms-campaigns/:id', authenticated, hasRole(['admin', 'owner']), deleteCampaign);
router.patch('/shop/sms-campaigns/:id/status', authenticated, hasRole(['admin', 'owner']), toggleCampaignStatus);
// =========================================================================
// =======================     Shop Manual SMS      ========================
// =========================================================================

const { sendShopManualSms, getShopSentSms, deleteSms } = require("../../../controllers/admin/sms/manualSms");

// Define routes for shop manual sms
router.post('/shop/sms/manual', authenticated, hasRole(['admin', 'owner']), sendShopManualSms);
router.get('/shop/sms/manual', authenticated, hasRole(['admin', 'owner']), getShopSentSms);
router.delete('/shop/sms/manual/:id', authenticated, hasRole(['admin', 'owner']), deleteSms);
router.delete('/shop/sms/manual', authenticated, hasRole(['admin', 'owner']), deleteSms);
// =========================================================================
// ======================     Shop Automated SMS      ======================
// =========================================================================


const { getCampaignSummary, getCampaignDetails, getShopUserSmsHistory } = require("../../../controllers/admin/sms/report");

// Define routes for shop SMS reports
router.get('/shop/reports/campaign-summary', authenticated, hasRole(['admin', 'owner']), getCampaignSummary);
router.get('/shop/reports/campaigns/:campaignId', authenticated, hasRole(['admin', 'owner']), getCampaignDetails);
router.get('/shop/reports/users/:userId', authenticated, hasRole(['admin', 'owner']), getShopUserSmsHistory);
// =========================================================================
// ========================    Shipping Methods    ==========================
// =========================================================================

// Define routes for Shipping methods

module.exports = router;