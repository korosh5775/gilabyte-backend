//به جای این که مقادیر پیش فرض از سرور دریافت شوند در خود فرانت اند اگر برای بعضی جا ها نیاز بود مقادیر پیش فرض قرار داده شد.

/* 
const DefaultFooter = require("../../../../models/defaultFooterSchema");
const path = require("path");
const fs = require("fs");

// دریافت مقادیر پیش‌فرض فوتر
const getDefaultFooter = async (req, res) => {
    try {
        // بررسی برای دریافت مقدار پیش‌فرض از دیتابیس
        const defaultFooter = await DefaultFooter.findOne();

        if (!defaultFooter) {
            // اگر هیچ مقدار پیش‌فرضی وجود نداشت، فایل‌های پیش‌فرض رو می‌خونیم
            const defaultImagePaths = {
                brandImage: path.resolve(__dirname, "../../../../images/footer/default/brandImage/brandImage.png"),
                standardSymbolImage: path.resolve(__dirname, "../../../../images/footer/default/symbolImage/standardSymbol.jpg"),
                trustSymbolImage: path.resolve(__dirname, "../../../../images/footer/default/symbolImage/trustSymbol.jpg"),
            };

            // بررسی وجود فایل‌ها - در صورت نیاز فایل‌های پیش‌فرض را در مسیر مشخص شده قرار دهید
            for (const [key, filePath] of Object.entries(defaultImagePaths)) {
                if (!fs.existsSync(filePath)) {
                    console.warn(`Default footer image not found: ${filePath}. Using empty path for ${key}.`);
                    // اگر فایل وجود نداشت، مسیر خالی در نظر می‌گیریم یا می‌توانید خطا برگردانید
                    // return res.status(500).json({ message: `Missing default footer image: ${key}` });
                }
            }

            // ایجاد فوتر پیش‌فرض با استفاده از مقادیر پیش‌فرض و فایل‌های محلی (در صورت وجود)
            const defaultItem = new DefaultFooter({
                brandImage: fs.existsSync(defaultImagePaths.brandImage) ? "/images/footer/default/brandImage/brandImage.png" : "",
                shopName: "نام برند پیش‌فرض",
                phoneNumber: "000-0000000",
                shopAddress: "آدرس پیش‌فرض فروشگاه شما",
                socialMedia1: "#",
                socialMedia2: "#",
                socialMedia3: "#",
                socialMedia4: "#",
                standardSymbolAddress: "#",
                trustSymbolAddress: "#",
                standardSymbolImage: fs.existsSync(defaultImagePaths.standardSymbolImage) ? "/images/footer/default/symbolImage/standardSymbol.jpg" : "",
                trustSymbolImage: fs.existsSync(defaultImagePaths.trustSymbolImage) ? "/images/footer/default/symbolImage/trustSymbol.jpg" : "",
            });

            await defaultItem.save();
            return res.status(200).json(defaultItem); // شیء ساخته شده رو برگردون
        } else {
            // اگر فوتر وجود داشت، همان را برمی‌گردانیم
            res.status(200).json(defaultFooter);
        }
    } catch (error) {
        console.error("Error in getDefaultFooter:", error);
        res.status(500).json({ message: error.message });
    }
}; 

module.exports = getDefaultFooter;
 */