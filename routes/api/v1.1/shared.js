// Import necessary modules
// ------------------------------------------------
const express = require("express");

const router = express.Router();


// Import middlewares
// ------------------------------------------------
const authenticated = require("../../../middlewares/authorization"); // Authentication middleware


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

module.exports = router;
 