// Import necessary modules
// ------------------------------------------------
const express = require("express");

const router = express.Router();


// Import middlewares
// ------------------------------------------------
const authenticated = require("../../../middlewares/authorization"); // Authentication middleware
const hasRole = require("../../../middlewares/hasRole"); // Role-based authorization middleware


const {getTime} = require("../../../controllers/shared/utils/getTime");
router.get("/get-time",  getTime);

// =========================================================================
// ====================     Portfolios & Clients     =======================
// =========================================================================
const getPortfolios = require("../../../controllers/shared/portfolio/getPortfolios");

// دریافت همگی نمونه‌کارها / مشتریان
router.get("/portfolio", getPortfolios);


const getAbout = require("../../../controllers/shared/about/getAbout");
router.get("/about", getAbout);

const getBanner = require("../../../controllers/shared/banner/getBanner")
router.get('/banner', getBanner);

// =========================================================================
// ====================      App Version (Force Update)     ================
// =========================================================================
const getAppVersion = require("../../../controllers/appVersion/getAppVersion");
const updateAppVersion = require("../../../controllers/appVersion/updateAppVersion");

router.get("/app-version", getAppVersion); // Public — no auth needed
router.put("/app-version", authenticated, hasRole(["admin", "owner"]), updateAppVersion); // Admin only

module.exports = router;
 