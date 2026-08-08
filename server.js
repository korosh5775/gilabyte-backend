process.env.TZ = "Asia/Tehran";//حل مشکل اختلاف ساعت در صورت اشتباه بودن ساعت کاربر یا سرور
// Import necessary modules
// ------------------------------------------------
require("dotenv").config(); // Load environment variables from .env file
const express = require("express"); // Import the Express framework
const path = require("path");
const cron = require('node-cron');
const indexRoutes = require("./routes/index"); // Import the main application routes
const bodyParser = require("body-parser"); // Import body-parser middleware for parsing request bodies
require("./utils/connection"); // Establish database connection
const errorHandler = require('./middlewares/errorrHandler');
const cookieParser = require("cookie-parser"); // Import cookie-parser
const http = require("http");
const { Server } = require("socket.io");

// Import Shop SMS Services
const { runScheduledCampaigns } = require('./services/scheduler.service');
const { processSmsQueue } = require('./services/sms.worker');

const cors = require("cors");

//نادیده گرفتن لاگ های تعریف شده در محیط پروداکشن
// if (process.env.NODE_ENV === 'production') {
//   console.log = function () {};
//   console.info = function () {};
//   console.warn = function () {};
//   // console.error را نگه می‌داریم تا خطاهای بحرانی در لاگ‌های PM2 ثبت شوند
// }

// Create an Express application instance
// ------------------------------------------------
const app = express();
const server = http.createServer(app); // 🟢 سوکت نیاز به سرور خام http دارد


// تعریف لیست دامنه‌های مجاز
const allowedOrigins = [
  'https://selesao.ir',
  'http://selesao.ir',
  'http://10.31.27.13:8000',
  'http://10.31.27.13:3000',
  'http://localhost:5173',
    'http://localhost:3000',

  'http://10.17.75.13:3000',
  process.env.FRONTEND_URL,
  // در محیط پروداکشن، لوکال‌هاست را حذف می‌کنیم
  ...(process.env.NODE_ENV !== 'production' ? [
    'http://localhost:3000', 
    'http://localhost:8000',
    'http://localhost:5173', // پورت پیش‌فرض Vite/React-Router
    'http://localhost:5174',
    'http://10.17.75.13:3000'
  ] : [])
].filter(Boolean);

// 🟢 راه‌اندازی Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // دامنه‌های مجاز شما
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});

// 🟢 تنظیم رویدادهای سوکت
io.on("connection", (socket) => {
  console.log("🟢 یک کاربر متصل شد:", socket.id);

  // ۱. وقتی کاربر (یا ادمین) وارد یک صفحه تیکت خاص می‌شود، او را به یک Room با نام آن تیکت می‌بریم
  socket.on("joinTicketRoom", (ticketId) => {
    socket.join(ticketId);
console.log(`📌 [Socket Server] کلاینت ${socket.id} وارد اتاق تیکت شد:`, String(ticketId));  });

  // ۲. وقتی کاربر از صفحه تیکت خارج می‌شود
  socket.on("leaveTicketRoom", (ticketId) => {
    socket.leave(ticketId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 کاربر قطع اتصال شد");
  });
});

// 🟢 پاس دادن آبجکت io به ریکوئست‌ها تا در کنترلرها بتوانیم به آن دسترسی داشته باشیم
app.use((req, res, next) => {
  req.io = io;
  next();
});



app.use(cors({
  origin: function (origin, callback) {
    // اگر درخواست از سمت سرور به سرور باشد (مثل Postman یا Cron)، مقدار origin وجود ندارد (null)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies

// Define static folder for images
app.use("/images", express.static(path.join(__dirname, "images")));

// Set up root route  
// ------------------------------------------------
app.use("/", indexRoutes); // Map the root route to the index routes

app.use(errorHandler);


// ۵. زمان‌بند کمپین‌های فروشگاه: هر روز ساعت 10 صبح اجرا می‌شود
cron.schedule('0 10 * * *', () => {
  console.log('Running daily shop campaign scheduler...');
  runScheduledCampaigns();
}, {
  timezone: "Asia/Tehran"
});

// ۶. پردازشگر صف پیامک‌های فروشگاه: هر دقیقه اجرا می‌شود
cron.schedule('* * * * *', () => {
  processSmsQueue();
});



// Configure server port
// ------------------------------------------------
const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000
// Start the server
// ------------------------------------------------
// 🟢 حتماً به جای app.listen از server.listen استفاده کنید
server.listen(port, '0.0.0.0', () => {
  console.log(`app is running on ${port}`);
});
