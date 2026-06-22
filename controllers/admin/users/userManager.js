const User = require("../../../models/usersSchema");
// const Orders = require('../../../models/orderSchema');
// const Comments = require('../../../models/commentsSchema');
// const Products = require("../../../models/productsSchema");
// const Answer = require("../../../models/answerSchema"); // <--- ایمپورت مدل Answer
// const { averageRateCalculator } = require("../../../utils/aRCalculator"); // <--- ایمپورت تابع محاسبه میانگین امتیاز

/**
 * @route   PATCH /admin/users/:userId/status
 * @desc    به‌روزرسانی وضعیت (فعال/غیرفعال) یک کاربر خاص توسط ادمین
 * @access  Private (فقط ادمین)
 * @body    { "status": "active" | "inactive" }
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params; // شناسه کاربر از پارامترهای URL
    const { status } = req.body;   // وضعیت جدید (active یا inactive) از بدنه درخواست

    // اعتبارسنجی ورودی: بررسی می‌کنیم که status ارسال شده معتبر باشد
    if (!status || !['active', 'inactive'].includes(status)) {
      const error = new Error("وضعیت ارسالی نامعتبر است. وضعیت باید 'active' یا 'inactive' باشد.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    // پیدا کردن کاربر مورد نظر با استفاده از شناسه
    const user = await User.findById(userId);

    // بررسی اینکه کاربر با شناسه داده شده وجود دارد یا خیر
    if (!user) {
      const error = new Error("کاربر با شناسه مشخص شده یافت نشد.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    // جلوگیری از تغییر وضعیت کاربر توسط خودش (اگر این کاربر همان ادمین لاگین شده باشد)
    // این یک لایه امنیتی اضافی است.
    if (req.user && req.user._id.toString() === userId.toString()) {
      const error = new Error("شما نمی‌توانید وضعیت فعال/غیرفعال بودن خود را تغییر دهید.");
      error.statusCode = 403; // Forbidden
      throw error;
    }

    // به‌روزرسانی فیلد status
    user.status = status;

    // ذخیره تغییرات در پایگاه داده
    const updatedUser = await user.save();

    // ارسال پاسخ موفقیت‌آمیز به همراه اطلاعات به‌روز شده کاربر
    res.status(200).json({
      message: `وضعیت کاربر با موفقیت به '${status}' تغییر یافت.`,
      user: updatedUser,
    });

  } catch (error) {
    // ارسال خطا به میدل‌ویر مدیریت خطای مرکزی
    next(error);
  }
};



/**
 * @route   GET /admin/users/:userId
 * @desc    دریافت جزئیات یک کاربر خاص توسط ادمین
 * @access  Private (فقط ادمین)
 */
const getUser = async (req, res, next) => {

  try {
    const { userId } = req.params; // دریافت شناسه کاربر از پارامترهای URL
    console.log("درخوست ارسال شد");

    // پیدا کردن کاربر مورد نظر در پایگاه داده با استفاده از شناسه
    const user = await User.findById(userId);

    // بررسی اینکه کاربر با شناسه داده شده وجود دارد یا خیر
    if (!user) {
      const error = new Error("کاربر با شناسه مشخص شده یافت نشد.");
      error.statusCode = 404; // کد خطا 404 به معنی Not Found
      throw error;
    }

    // ارسال پاسخ موفقیت‌آمیز به همراه اطلاعات کاربر
    res.status(200).json(user);

  } catch (error) {
    // ارسال خطا به میدل‌ویر مدیریت خطای مرکزی
    next(error);
  }
};




// /**
//  * @route   Get /api/admin/users/:userId/orders
//  * @desc    دریافت سفارشات یک کاربر خاص توسط ادمین
//  * @access  Private (فقط ادمین)
//  */
// // Define the getOrders function
// // ------------------------------------------------
// const getOrders = async (req, res, next) => {
//   try {
//     // Extract user ID from request
//     // ------------------------------------------------
//     const { userId } = req.params;

//     // Validate user authentication 
//     // ------------------------------------------------
//     if (!userId) {
//       const err = new Error("user not found");
//       err.statusCode = 404; // Not found
//       throw err; // Throw error for handling
//     }

//     // Find orders for the user
//     // ------------------------------------------------
//     const orders = await Orders.find({ user: userId });

//     // Check if any orders exist
//     // ------------------------------------------------
//     if (!orders) {
//       const err = new Error("There are no orders to show");
//       err.statusCode = 404; // Not found
//       throw err; // Throw error for handling
//     }

//     // Send a success response with the orders
//     // ------------------------------------------------
//     res.status(200).json(orders);
//   } catch (error) {
//     // Pass errors to error handling middleware
//     // ------------------------------------------------
//     next(error);
//   }
// };

// /**
//  * @route   Get /api/admin/users/:userId/comments
//  * @desc    دریافت کامنت های یک کاربر خاص توسط ادمین
//  * @access  Private (فقط ادمین)
//  */
// // Define the getOrders function
// // ------------------------------------------------
// const getComments = async (req, res, next) => {
//   try {
//     const { userId } = req.params; // شناسه کاربر از پارامترهای URL

//     // 1. اعتبارسنجی ساده برای وجود userId (اگر لازم است)
//     // findById یا find به تنهایی هم با ObjectId نامعتبر null برمی‌گردانند یا خطا می‌دهند
//     // که بلاک catch می‌تواند آن را مدیریت کند.
//     // اگر می‌خواهید حتماً کاربر (User) وجود داشته باشد، می‌توانید آن را هم پیدا کنید:
//     const userExists = await User.findById(userId);
//     if (!userExists) {
//       const err = new Error("کاربر مورد نظر یافت نشد.");
//       err.statusCode = 404;
//       throw err;
//     }


//     // 2. پیدا کردن تمام کامنت‌های مربوط به این کاربر
//     // با استفاده از populate، اطلاعات محصول و پاسخ ادمین مربوط به هر کامنت را نیز دریافت می‌کنیم.
//     const comments = await Comments.find({ user: userId })
//       .populate('product', 'nameFa images') // نام محصول و تصاویر آن
//       .populate('answer', 'answer createdAt'); // <--- اضافه شدن populate برای پاسخ ادمین (فیلدهای مورد نیاز)

//     // 3. بررسی اینکه آیا کامنتی پیدا شده است یا خیر
//     if (comments.length === 0) { // بررسی طول آرایه
//       return res.status(200).json({
//         message: "این کاربر هیچ نظری ثبت نکرده است.",
//         comments: [] // ارسال یک آرایه خالی برای فرانت‌اند
//       });
//     }

//     // 4. ارسال پاسخ موفقیت‌آمیز به همراه کامنت‌های یافت شده (که حاوی اطلاعات محصول نیز هستند)
//     res.status(200).json({
//       message: "نظرات کاربر با موفقیت دریافت شد.",
//       comments: comments
//     });

//   } catch (error) {
//     // ارسال خطا به میدل‌ویر مدیریت خطای مرکزی
//     console.error("خطا در دریافت نظرات کاربر:", error); // برای دیباگ
//     // اگر خطای CastError (برای ObjectId نامعتبر) باشد، یک پیام مناسب بدهید
//     if (error.name === 'CastError' && error.path === '_id') {
//       error.message = "شناسه کاربری نامعتبر است.";
//       error.statusCode = 400;
//     }
//     next(error);
//   }
// };

// /**
//  * @route   PATCH /api/admin/comments/:commentId/status
//  * @desc    به‌روزرسانی وضعیت (status) یک کامنت خاص توسط ادمین
//  * @access  Private (فقط ادمین)
//  * @body    { "status": "pending" | "approved" | "rejected" }
//  */
// const updateCommentStatus = async (req, res, next) => {
//   try {
//     const { commentId } = req.params; // شناسه کامنت از پارامترهای URL
//     const { status } = req.body;     // وضعیت جدید از بدنه درخواست

//     // اعتبارسنجی ورودی: بررسی می‌کنیم که status ارسال شده معتبر باشد
//     if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
//       const error = new Error("وضعیت ارسالی نامعتبر است. وضعیت باید 'pending', 'approved' یا 'rejected' باشد.");
//       error.statusCode = 400; // Bad Request
//       throw error;
//     }

//     // ⭐ فقط این خط برای پیدا کردن کامنت کافی است
//     const comment = await Comments.findById(commentId);

//     if (!comment) {
//       const error = new Error("کامنت با شناسه مشخص شده یافت نشد.");
//       error.statusCode = 404;
//       throw error;
//     }

//     const oldStatus = comment.status; // وضعیت قبلی کامنت را ذخیره می‌کنیم

//     comment.status = status;
//     const updatedComment = await comment.save();

//     // ⭐ منطق فراخوانی averageRateCalculator بر اساس تغییر وضعیت ⭐
//     // اگر وضعیت کامنت تغییر کند و بر گروه کامنت‌های "approved" تاثیر بگذارد:
//     if (oldStatus !== 'approved' && status === 'approved') {
//       // اگر از pending/rejected به approved تغییر کرد
//       await averageRateCalculator(updatedComment.product);
//     } else if (oldStatus === 'approved' && status !== 'approved') {
//       // اگر از approved به pending/rejected تغییر کرد
//       await averageRateCalculator(updatedComment.product);
//     }
//     // اگر تغییر وضعیتی رخ ندهد یا تغییری بین pending و rejected باشد، نیازی به محاسبه نیست.

//     res.status(200).json({
//       message: `وضعیت نظر با موفقیت به '${status}' تغییر یافت.`,
//       comment: updatedComment,
//     });

//   } catch (error) {
//     console.error("خطا در به‌روزرسانی وضعیت نظر:", error);
//     if (error.name === 'CastError' && error.path === '_id') {
//       error.message = "شناسه کامنت نامعتبر است.";
//       error.statusCode = 400;
//     }
//     next(error);
//   }
// };

// /**
//  * @route   DELETE /api/admin/comments/:commentId/answer
//  * @desc    حذف پاسخ ادمین از یک کامنت خاص
//  * @access  Private (فقط ادمین)
//  */
// const deleteAnswer = async (req, res, next) => {
//   try {
//     const { commentId } = req.params; // شناسه کامنت از پارامترهای URL

//     // 1. کامنت را پیدا می‌کنیم تا مطمئن شویم وجود دارد و به پاسخ ارجاع می‌دهد
//     const comment = await Comments.findById(commentId);
//     if (!comment) {
//       const error = new Error("کامنت مورد نظر یافت نشد.");
//       error.statusCode = 404;
//       throw error;
//     }
//     if (!comment.answer) {
//       return res.status(404).json({ message: "این کامنت پاسخی ندارد که حذف شود." });
//     }

//     const answerId = comment.answer; // شناسه پاسخ را از کامنت می‌گیریم

//     // 2. سند پاسخ را از کالکشن Answer حذف می‌کنیم
//     const deletedAnswer = await Answer.findByIdAndDelete(answerId);
//     if (!deletedAnswer) {
//       const error = new Error("پاسخ مورد نظر یافت نشد یا قبلاً حذف شده بود.");
//       error.statusCode = 404;
//       throw error;
//     }

//     // 3. فیلد answer در سند کامنت را به null تغییر می‌دهیم
//     comment.answer = null; // یا undefined
//     await comment.save();

//     // در اینجا نیازی به فراخوانی averageRateCalculator نیست، چون حذف پاسخ روی امتیاز محصول تأثیری ندارد.

//     res.status(200).json({
//       message: "پاسخ ادمین با موفقیت حذف شد.",
//     });

//   } catch (error) {
//     console.error("خطا در حذف پاسخ ادمین:", error);
//     if (error.name === 'CastError' && error.path === '_id') {
//       error.message = "شناسه کامنت نامعتبر است.";
//       error.statusCode = 400;
//     }
//     next(error);
//   }
// };

// /**
//  * @route   DELETE /api/admin/comments/:commentId
//  * @desc    حذف یک کامنت خاص کاربر توسط ادمین
//  * @access  Private (فقط ادمین)
//  */
// const deleteComment = async (req, res, next) => {
//   try {
//     const { commentId } = req.params; // شناسه کامنت از پارامترهای URL

//     // 1. کامنت را از کالکشن Comments پیدا می‌کنیم تا اطلاعات محصول و پاسخ را بگیریم
//     const comment = await Comments.findById(commentId);
//     if (!comment) {
//       const error = new Error("کامنت مورد نظر یافت نشد.");
//       error.statusCode = 404;
//       throw error;
//     }

//     const productId = comment.product; // شناسه محصول مربوط به کامنت
//     const commentStatus = comment.status; // وضعیت کامنت قبل از حذف

//     // 2. اگر کامنت پاسخ دارد، ابتدا پاسخ آن را حذف می‌کنیم
//     if (comment.answer) {
//       await Answer.findByIdAndDelete(comment.answer);
//       console.log(`Answer ${comment.answer} for comment ${commentId} deleted.`);
//     }

//     // 3. کامنت را از کالکشن Comments حذف می‌کنیم
//     const deletedComment = await Comments.findByIdAndDelete(commentId);
//     if (!deletedComment) {
//       // این چک اضافی است، چون اگر comment پیدا شده باشد، باید حذف شود.
//       const error = new Error("خطا در حذف کامنت.");
//       error.statusCode = 500;
//       throw error;
//     }

//     // 4. ObjectId کامنت را از آرایه comments محصول مربوطه حذف می‌کنیم
//     await Products.updateOne(
//       { _id: productId },
//       { $pull: { comments: commentId } }
//     );
//     console.log(`Comment ID ${commentId} removed from product ${productId}.`);

//     // میانگین امتیاز محصول را مجدداً محاسبه می‌کنیم،
//     // زیرا حذف یک کامنت (چه approved باشد چه نباشد) می‌تواند بر محاسبات آینده تأثیر بگذارد،
//     // اما در اصل فقط approved ها در میانگین فعلی تأثیر دارند.
//     // اگر کامنت حذف شده approved بوده، حتما باید میانگین باز محاسبه شود.
//     // اگر approved نبوده، حذف آن بر میانگین فعلی تاثیر ندارد، اما بهتر است برای اطمینان صدا زده شود.
//     if (commentStatus === 'approved') { // فقط اگر کامنت حذف شده قبلا تایید شده بود
//       await averageRateCalculator(productId);
//       console.log(`Average rate for product ${productId} recalculated after approved comment deletion.`);
//     } else {
//       // اگر کامنت حذف شده pending یا rejected بوده، میانگین فعلی را تحت تاثیر قرار نمی‌دهد
//       console.log(`Comment ${commentId} was not approved, average rate not directly affected by its deletion.`);
//     }


//     res.status(200).json({
//       message: "کامنت و پاسخ مرتبط (در صورت وجود) با موفقیت حذف شدند.",
//     });

//   } catch (error) {
//     if (error.name === 'CastError' && error.path === '_id') {
//       error.message = "شناسه کامنت نامعتبر است.";
//       error.statusCode = 400;
//     }
//     next(error);
//   }
// };

/**
 * @route   PATCH /admin/users/:userId/role
 * @desc    تغییر نقش کاربر به ادمین یا کاربر عادی
 * @access  Private (فقط مالک)
 * @body    { "role": "admin" | "user" }
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // ۰. بررسی اینکه درخواست‌دهنده حتما مالک باشد (لایه امنیتی اضافی)
    if (!req.user || req.user.role !== 'owner') {
      const error = new Error("فقط مالک سایت مجاز به تغییر نقش کاربران است.");
      error.statusCode = 403;
      throw error;
    }

    // اعتبارسنجی نقش جدید (جلوگیری از ارتقا به owner طبق محدودیت پنل)
    if (!role || !['admin', 'user'].includes(role)) {
      const error = new Error("نقش ارسالی نامعتبر است. نقش باید 'admin' یا 'user' باشد.");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("کاربر با شناسه مشخص شده یافت نشد.");
      error.statusCode = 404;
      throw error;
    }

    // ۱. مالک نمی‌تواند نقش خودش را تغییر دهد
    if (req.user && req.user._id.toString() === userId.toString()) {
      const error = new Error("شما نمی‌توانید نقش خود را تغییر دهید.");
      error.statusCode = 403;
      throw error;
    }

    // ۲. مالک نمی‌تواند نقش یک مالک دیگر را تغییر دهد
    if (user.role === 'owner') {
      const error = new Error("شما نمی‌توانید نقش یک مالک دیگر را تغییر دهید.");
      error.statusCode = 403;
      throw error;
    }

    user.role = role;
    const updatedUser = await user.save();

    res.status(200).json({
      message: `نقش کاربر با موفقیت به '${role}' تغییر یافت.`,
      user: updatedUser,
    });

  } catch (error) {
    next(error);
  }
};

// خروجی گرفتن از توابع جدید برای استفاده در فایل روت
module.exports = {
  updateUserStatus,
  getUser,
  // getOrders,
  // getComments,
  // updateCommentStatus,
  // deleteAnswer,
  // deleteComment,
  changeUserRole
};
