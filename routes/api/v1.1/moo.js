// routes/api/v1.1/moo.js
const express = require("express");
const router = express.Router();

const {
    getPortalHostingStatus,
    uploadPortalHostingReceipt,
    uploadReceiptMiddleware
} = require("../../../controllers/connectWithMoo/portalHostingRoutes");

// دریافت اطلاعات شارژ سرور و فیش‌ها بر اساس دامنه آرایشگاه
router.get("/hosting/status", getPortalHostingStatus);

// ارسال فیش واریزی جدید از داخل اپ آرایشگاه
router.post("/hosting/receipt", uploadReceiptMiddleware, uploadPortalHostingReceipt);

module.exports = router;