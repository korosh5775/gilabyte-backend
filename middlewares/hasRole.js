/**
 * این میدل‌ور بررسی می‌کند که آیا نقش کاربر در لیست نقش‌های مجاز قرار دارد یا خیر.
 * این یک "Factory" است: تابعی که یک میدل‌ور دیگر را برمی‌گرداند.
 * 
 * @param {string[]} allowedRoles - آرایه‌ای از رشته‌ها، شامل نقش‌های مجاز (مثلاً ['admin'] یا ['admin', 'staff']).
 */
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        // این میدل‌ور باید همیشه بعد از میدل‌ور `authenticated` اجرا شود.
        if (!req.user || !req.user.role) {
            const error = new Error('Forbidden: User role is missing.');
            error.statusCode = 403;
            return next(error);
        }

        const userRole = req.user.role;

        // اگر نقش کاربر در لیست نقش‌های مجاز بود، اجازه عبور بده
        if (allowedRoles.includes(userRole)) {
            return next();
        }

        // در غیر این صورت، دسترسی را مسدود کن
        const error = new Error('Forbidden: You do not have the required permissions.');
        error.statusCode = 403;
        next(error);
    };
};

module.exports = hasRole;