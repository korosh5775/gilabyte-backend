// Import necessary modules
// ------------------------------------------------
const express = require("express");

// Import middlewares
// ------------------------------------------------
 // Data validation middleware
const authenticated = require("../../../middlewares/authorization"); // Authentication middleware

// Create an Express router
// ------------------------------------------------
const router = express.Router();
// =========================================================================
// ===========================     Auth      ===============================
// =========================================================================

// Import controllers for user authorization
const { sendOtp, verifyOtp, userExistsCheck, verifyAdminOtp, sendAdminOtp, checkTokenValidity } = require("../../../controllers/user/userAuth/auth");

// Define routes for user authorization
router.post("/auth/send-otp", sendOtp);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/user-exists-check", userExistsCheck);
router.post("/auth/verify-admin-otp", verifyAdminOtp);
router.post("/auth/send-admin-otp", sendAdminOtp);
router.post("/auth/check-token-validity", checkTokenValidity); // New endpoint for token validity check
// =========================================================================
// ===========================     Users      ==============================
// =========================================================================

// Import controllers for users
const getUserDetails = require('../../../controllers/user/profile/getUserDetails');
const updateUserDetails = require("../../../controllers/user/profile/updateUserDetails");
const { updateUserPushToken } = require("../../../controllers/user/profile/updatePushToken");

// Define routes for users
router.get("/user-details", authenticated, getUserDetails); //get one user details
router.patch("/change-user-details", authenticated, updateUserDetails); //get one user details
router.patch("/me/push-token", authenticated, updateUserPushToken);


const getFooter = require("../../../controllers/user/footer/getFooter");

// Define routes for footer
router.get("/footer", getFooter);






// Export the router
// ------------------------------------------------
module.exports = router;
