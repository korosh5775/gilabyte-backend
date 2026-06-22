// const { Expo } = require('expo-server-sdk');

// // ایجاد یک نمونه از کلاینت Expo
// let expo = new Expo();

// /**
//  * ارسال اعلان فشاری (Push Notification) به یک یا چند کاربر
//  * @param {string[]} pushTokens - آرایه‌ای از توکن‌های اکسپو (مثلاً ['ExponentPushToken[xxx]'])
//  * @param {string} title - عنوان اعلان
//  * @param {string} body - متن اعلان
//  * @param {Object} data - داده‌های اضافی (اختیاری)
//  */
// const sendPushNotification = async (pushTokens, title, body, data = {}) => {
//     let messages = [];
    
//     for (let pushToken of pushTokens) {
//         // بررسی معتبر بودن توکن اکسپو
//         if (!Expo.isExpoPushToken(pushToken)) {
//             console.error(`Push token ${pushToken} is not a valid Expo push token`);
//             continue;
//         }

//         const message = {
//             to: pushToken,
//             sound: 'default',
//             title: title,
//             body: body,
//             data: data,
//             priority: 'high',
//             channelId: 'default', // برای اندروید ۸ به بالا
//         };

//         // اگر categoryIdentifier در دیتا وجود دارد، آن را به سطح اول پیام منتقل کن (برای نمایش دکمه‌ها)
//         if (data && data.categoryIdentifier) {
//             message.categoryIdentifier = data.categoryIdentifier;
//         }

//         messages.push(message);
//     }

//     console.log(`Preparing to send ${messages.length} messages...`);

//     // تکه‌تکه کردن پیام‌ها برای ارسال (اکسپو محدودیت تعداد در هر درخواست دارد)
//     let chunks = expo.chunkPushNotifications(messages);
//     console.log(`Messages split into ${chunks.length} chunks.`);
//     let tickets = [];

//     for (let chunk of chunks) {
//         try {
//             let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//             console.log("Ticket chunk received:", ticketChunk);
//             tickets.push(...ticketChunk);
//         } catch (error) {
//             console.error("CRITICAL ERROR sending push notification chunk:", error);
//         }
//     }

//     // در اینجا می‌توان رسیدها (Receipts) را هم بررسی کرد، اما برای سادگی فعلاً به همین بسنده می‌کنیم.
//     return tickets;
// };

// module.exports = {
//     sendPushNotification
// };
