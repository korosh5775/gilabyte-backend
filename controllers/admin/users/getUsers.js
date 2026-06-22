const User = require("../../../models/usersSchema");
const jalaali = require('jalaali-js'); // Import jalaali-js


//api admin/users/get-all
//just admin
const getUsers = async(req, res, next)=>{

    try {
        const { filter } = req.query;
        let query = {};

        const now = new Date();

        // --- محاسبه شروع و پایان ماه شمسی --- (با استفاده از jalaali-js)
        const jalaaliDate = jalaali.toJalaali(now);
        
        // برای شروع ماه شمسی
        const gStart = jalaali.toGregorian(jalaaliDate.jy, jalaaliDate.jm, 1);
        const jalaaliStartOfMonth = new Date(gStart.gy, gStart.gm - 1, gStart.gd); // Month is 0-indexed in JavaScript Date

        // برای پایان ماه شمسی
        const gEnd = jalaali.toGregorian(jalaaliDate.jy, jalaaliDate.jm, jalaali.jalaaliMonthLength(jalaaliDate.jy, jalaaliDate.jm));
        const jalaaliEndOfMonth = new Date(gEnd.gy, gEnd.gm - 1, gEnd.gd);
    
        // برای تنظیم زمان به انتهای روز برای endOfMonth میلادی
        jalaaliEndOfMonth.setHours(23, 59, 59, 999);
        // -----------------------------------------------------

        switch (filter) {
            case 'active':
                query.status = 'active';
                break;
            case 'inactive':
                query.status = 'inactive';
                break;
            case 'registeredThisMonth':
                query.createdAt = { $gte: jalaaliStartOfMonth, $lte: jalaaliEndOfMonth };
                break;
            case 'all':
            default:
                // No specific filter, return all users
                break;
        }

        const users = await User.find(query);
    
    if(!users || users.length === 0){
        const error = new Error("کاربری یافت نشد");
        error.statusCode = 404;
        return next(error);
    }

    res.status(200).json(users)
    } catch (error) {
        next(error);
    }
    
}
module.exports = getUsers;