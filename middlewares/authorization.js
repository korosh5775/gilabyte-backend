const jwt = require("jsonwebtoken");
const User = require("../models/usersSchema");

const authenticated = async (req, res, next) => {
    // لاگ برای عیب‌یابی نوتیفیکیشن
    if (req.originalUrl && req.originalUrl.includes('push-token')) {
        console.log(`[DEBUG] Push Token Request: ${req.method} ${req.originalUrl} | IP: ${req.ip}`);
    }

    try {
        let token;
        
        // ابتدا بررسی Authorization Header
        const authHeader = req.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } 
        // سپس بررسی کوکی‌ها اگر توکن در هدر نبود
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            const error = new Error("Authorization failed. No token provided.");
            error.statusCode = 401;
            throw error;
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken || !decodedToken.userId) {
            const error = new Error("Invalid token.");
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findById(decodedToken.userId);
        
        if (!user) {
            const error = new Error("User associated with this token no longer exists.");
            error.statusCode = 401;
            throw error;
        }

        req.user = user;
        next();

    } catch (err) {
        let error;
        if (err.name === "TokenExpiredError") {
            error = new Error("توکن منقضی شده است. لطفاً دوباره وارد شوید.");
            error.statusCode = 401;
        } else {
            error = new Error("احراز هویت ناموفق. توکن نامعتبر است.");
            error.statusCode = 401;
        }
        next(error);
    }
};

module.exports = authenticated;
