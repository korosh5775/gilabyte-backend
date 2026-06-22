/**
 * یک موتور قالب‌بندی ساده که متغیرهایی مانند [Placeholder] را جایگزین می‌کند.
 * @param {string} template - رشته قالب، مثلاً "سلام [CustomerName] عزیز".
 * @param {object} data - آبجکتی از داده‌ها برای جایگزینی، مثلاً { CustomerName: "سارا" }.
 * @returns {string} - رشته نهایی و شخصی‌سازی شده.
 */
function renderTemplate(template, data) {
    if (!template) return '';
  
    // استفاده از یک عبارت منظم (Regex) برای پیدا کردن تمام متغیرها به شکل [key]
    // پرچم 'g' تضمین می‌کند که تمام موارد پیدا شوند، نه فقط اولین مورد.
    return template.replace(/\[(\w+)\]/g, (match, key) => {
      // اگر کلید در آبجکت داده وجود داشت، مقدار آن را برمی‌گردانیم.
      // در غیر این صورت، خود متغیر را برمی‌گردانیم تا ادمین متوجه اشتباهش شود.
      return data.hasOwnProperty(key) ? data[key] : match;
    });
  }
  
  module.exports = { renderTemplate };