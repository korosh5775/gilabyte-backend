// // services/audienceBuilder.service.js

// const mongoose = require('mongoose');
// const User = require('../models/usersSchema');
// const Order = require('../models/orderSchema');
// const CampaignLog = require('../models/campaignLog');

// /**
//  * اپراتورهای فرانت‌اند را به زبان کوئری مانگودیبی ترجمه می‌کند.
//  */
// const getMongoOperator = (operator) => {
//     switch (operator) {
//         case 'eq': return '$eq';
//         case 'gt': return '$gt';
//         case 'lt': return '$lt';
//         default: return '$gte';
//     }
// };

// const findTargetUsers = async (campaign) => {
//     const { conditions, _id: campaignId } = campaign;
//     const pipeline = [];

//     // --- دسته‌بندی شرایط بر اساس نیاز به lookup ---
//     const preLookupConditions = conditions.filter(c => ['registration_date', 'birthday_is_today', 'birthday_is_this_month'].includes(c.type));
//     const postLookupConditions = conditions.filter(c => !preLookupConditions.map(p => p.type).includes(c.type));

//     // --- مرحله 1: اجرای فیلترهای سبک و اولیه ---
//     const preLookupMatch = { $and: [] };
//     for (const condition of preLookupConditions) {
//         const now = new Date();
//         if (condition.type === 'registration_date') {
//             const dateThreshold = new Date(new Date().setDate(now.getDate() - condition.value.days));
//             const mongoOp = getMongoOperator(condition.operator);
//             const finalOp = mongoOp === '$gt' ? '$lt' : '$gte';
//             preLookupMatch.$and.push({ createdAt: { [finalOp]: dateThreshold } });
//         } else if (condition.type === 'birthday_is_today') {
//             preLookupMatch.$and.push({
//                 $expr: {
//                     $and: [
//                         { $eq: [{ $dayOfMonth: { date: '$birthDate', timezone: 'Asia/Tehran' } }, { $dayOfMonth: { date: now, timezone: 'Asia/Tehran' } }] },
//                         { $eq: [{ $month: { date: '$birthDate', timezone: 'Asia/Tehran' } }, { $month: { date: now, timezone: 'Asia/Tehran' } }] }
//                     ]
//                 }
//             });
//         } else if (condition.type === 'birthday_is_this_month') {
//             preLookupMatch.$and.push({
//                 $expr: {
//                     $eq: [{ $month: { date: '$birthDate', timezone: 'Asia/Tehran' } }, { $month: { date: now, timezone: 'Asia/Tehran' } }]
//                 }
//             });
//         }
//     }
//     if (preLookupMatch.$and.length > 0) {
//         pipeline.push({ $match: preLookupMatch });
//     }

//     // --- مرحله 2: اجرای lookup های سنگین برای واکشی اطلاعات سفارشات ---
//     // فقط سفارشات Completed در نظر گرفته می‌شوند
//     pipeline.push({
//         $lookup: {
//             from: Order.collection.name,
//             let: { userId: '$_id' },
//             pipeline: [
//                 {
//                     $match: {
//                         $expr: { $eq: ['$userId', '$$userId'] },
//                         status: 'Completed' // فقط سفارشات تکمیل شده
//                     }
//                 },
//                 { $sort: { createdAt: -1 } }
//             ],
//             as: 'completedOrders'
//         }
//     });

//     // --- مرحله 3: ساخت فیلدهای مجازی جدید بر اساس اطلاعات lookup ---
//     pipeline.push({
//         $addFields: {
//             lastOrder: { $first: '$completedOrders' },
//             totalOrders: { $size: '$completedOrders' },
//         }
//     });

//     // --- مرحله 4: اجرای فیلترهای سنگین که به اطلاعات سفارشات نیاز داشتند ---
//     const postLookupMatch = { $and: [] };
//     for (const condition of postLookupConditions) {
//         const now = new Date();
//         const mongoOp = getMongoOperator(condition.operator);

//         if (condition.type === 'last_purchase') {
//             const dateThreshold = new Date(new Date().setDate(now.getDate() - condition.value.days));
//             postLookupMatch.$and.push({ 'lastOrder.createdAt': { [mongoOp]: dateThreshold } });
//         }
//         else if (condition.type === 'purchase_count') {
//             const dateThreshold = new Date(new Date().setDate(now.getDate() - condition.value.days));

//             const countInTimeWindow = {
//                 $size: {
//                     $filter: {
//                         input: '$completedOrders',
//                         as: 'order',
//                         cond: { $gte: ['$$order.createdAt', dateThreshold] }
//                     }
//                 }
//             };
//             postLookupMatch.$and.push({ $expr: { [mongoOp]: [countInTimeWindow, condition.value.count] } });
//         }
//         else if (condition.type === 'specific_product') {
//             const dateThreshold = condition.value.days
//                 ? new Date(new Date().setDate(now.getDate() - condition.value.days))
//                 : new Date(0);

//             const countOfProduct = {
//                 $size: {
//                     $filter: {
//                         input: '$completedOrders',
//                         as: 'order',
//                         cond: {
//                             $and: [
//                                 { $gte: ['$$order.createdAt', dateThreshold] },
//                                 {
//                                     $gt: [
//                                         {
//                                             $size: {
//                                                 $filter: {
//                                                     input: '$$order.products',
//                                                     as: 'product',
//                                                     cond: { $eq: ['$$product.productId', new mongoose.Types.ObjectId(condition.value.productId)] }
//                                                 }
//                                             }
//                                         },
//                                         0
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             };
//             postLookupMatch.$and.push({ $expr: { [mongoOp]: [countOfProduct, condition.value.count] } });
//         }
//     }
//     if (postLookupMatch.$and.length > 0) {
//         pipeline.push({ $match: postLookupMatch });
//     }

//     // --- مرحله 5: حذف کاربرانی که قبلاً این پیام را دریافت کرده‌اند ---
//     const sentUsers = await CampaignLog.find({
//         campaignId,
//         expiresAt: { $gt: new Date() }
//     }).distinct('userId');

//     console.log(`[DEBUG] ${sentUsers.length} users already received this shop campaign recently`);

//     if (sentUsers.length > 0) {
//         pipeline.push({ $match: { _id: { $nin: sentUsers } } });
//     }

//     // --- مرحله 6: انتخاب فیلدهای خروجی نهایی ---
//     pipeline.push({
//         $project: {
//             fullName: 1,
//             phoneNumber: 1,
//             totalOrders: 1,
//         }
//     });

//     const users = await User.aggregate(pipeline);

//     return users;
// };

// module.exports = { findTargetUsers };
