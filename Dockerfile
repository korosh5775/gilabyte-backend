# استفاده از ورژن دقیق نود سیستم خودت برای هماهنگی ۱۰۰٪
FROM node:18.19.1-alpine

# تنظیم محیط
ENV NODE_ENV=production

WORKDIR /app

# نصب ابزارهای گلوبال
RUN npm install -g pm2

# تغییر مالکیت (امنیت)
RUN chown -R node:node /app

# سوییچ به کاربر امن
USER node

# نصب پکیج‌ها
COPY --chown=node:node package*.json ./
RUN npm ci && npm cache clean --force

# کپی کدها (فایل‌های داخل .dockerignore کپی نمی‌شوند)
COPY --chown=node:node . .

EXPOSE 3000

# اجرای نهایی
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]