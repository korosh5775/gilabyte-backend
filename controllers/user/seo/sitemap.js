const Service = require('../../../models/service'); // آدرس مدل رو چک کن که درست باشه

exports.generateSitemap = async (req, res) => {
  try {
    // ۱. تعریف آدرس اصلی سایت
    const baseUrl = 'https://gilabyte.ir';

    // ۲. تعریف صفحات ثابت (Static)
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/consultation', priority: '0.9', changefreq: 'monthly' },
    ];

    // ۳. گرفتن صفحات داینامیک (خدمات) از دیتابیس
    // فقط خدماتی که isActive آنها true است را می‌گیریم
    const services = await Service.find({ isActive: true }).select('slug updatedAt');

    // ۴. ساختاردهی متون XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // اضافه کردن صفحات ثابت به XML
    staticPages.forEach(page => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // اضافه کردن صفحات خدمات به XML
    services.forEach(service => {
      sitemap += `  <url>\n`;
      // اینجا آدرس داینامیک رو با slug می‌سازیم
      sitemap += `    <loc>${baseUrl}/services/${service.slug}</loc>\n`;
      // آخرین تاریخ ویرایش (برای اینکه گوگل بفهمه کی آپدیت شده)
      sitemap += `    <lastmod>${service.updatedAt.toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.9</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += `</urlset>`;

    // ۵. ارسال پاسخ با فرمت XML
    res.header('Content-Type', 'application/xml');
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Sitemap Generation Error:', error);
    res.status(500).send('Error generating sitemap');
  }
};