// Import necessary modules
// ------------------------------------------------
const express = require("express");

const router = express.Router();


// Import middlewares
// ------------------------------------------------
const authenticated = require("../../../middlewares/authorization"); // Authentication middleware


const {getTime} = require("../../../controllers/shared/utils/getTime");
router.get("/get-time",  getTime);

// Create an Express router
// ------------------------------------------------



module.exports = router;
 