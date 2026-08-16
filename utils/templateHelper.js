/**
 * یک موتور قالب‌بندی ساده که متغیرهایی مانند #Placeholder# را جایگزین می‌کند.
 * @param {string} template - رشته قالب، مثلاً "سلام #CustomerName# عزیز".
 * @param {object} data - آبجکتی از داده‌ها برای جایگزینی، مثلاً { CustomerName: "سارا" }.
 * @returns {string} - رشته نهایی و شخصی‌سازی شده.
 */
function renderTemplate(template, data) {
  if (!template) return '';

  // Regex: پیدا کردن تمام #Key#
  return template.replace(/#(\w+)#/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(data, key)
      ? data[key]
      : match; // اگر موجود نبود خود placeholder باقی بماند
  });
}

module.exports = { renderTemplate };