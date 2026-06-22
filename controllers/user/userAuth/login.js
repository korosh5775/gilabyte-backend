/* // Import necessary modules
// ------------------------------------------------
const User = require("../../../models/usersSchema");
const jwt = require("jsonwebtoken");

// Define the login function
// ------------------------------------------------
const login = async (req, res, next) => {
 try {
   // Extract email and password from the request body
   // ------------------------------------------------
   const { fullName, phoneNumber } = req.body;

   // Find the user with the provided email
   // ------------------------------------------------
   const userCheck = await User.findOne({ phoneNumber });

   // Handle user not found
   // ------------------------------------------------
   if (!userCheck) {
     const err = new Error("کاربری با این شماره تلفن یافت نشد"); // Error message
     err.statusCode = 404; // Not Found status code
     throw err;
   }


   // If the password matches
   // ------------------------------------------------
   if (passwordCheck) {
     // Create a payload with user information for the token
     // ------------------------------------------------
     const user = {
       userId: userCheck._id.toString(),
       isAdmin: userCheck.isAdmin,
       email: userCheck.email,
       userName: userCheck.userName,
     };
v 
     // Generate a JWT token with the user information, expiring in 12 hours
     // ------------------------------------------------
     const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "12h" });

     // Send the token as a JSON response
     // ------------------------------------------------
     res.status(200).json(token);
   } else {
     // Handle incorrect password
     // ------------------------------------------------
     const err = new Error("ایمیل یا پسورد اشتباه است"); // Error message
     err.statusCode = 422; // Unprocessable Entity status code
     throw err;
   }
 } catch (err) {
   // Pass errors to error handling middleware
   // ------------------------------------------------
   next(err);
 }
};

// Export the login function
// ------------------------------------------------
module.exports = login;
 */