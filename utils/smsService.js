

const axios = require("axios");
require("dotenv").config();

class SmsService {
  constructor() {
    this.apiKey = process.env.SMSIR_API_KEY;
    this.lineNumber = process.env.SMSIR_LINE_NUMBER;
    this.otpTemplateId = process.env.SMSIR_OTP_TEMPLATE_ID;

    this.baseUrl = "https://api.sms.ir/v1";

    if (!this.apiKey || !this.lineNumber) {
      throw new Error("SMS.ir credentials (API key, line number) are not configured.");
    }

    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  // ارسال پیامک تکی
async sendSingle(to, text) {
  try {
    const sanitizedText = text?.trim() ?? "";
    const mobileNumber = to;

    console.log(`Sending single SMS via likeToLike to ${mobileNumber} with text: "${sanitizedText}"`);

    if (!sanitizedText) {
      throw new Error("Text for single SMS is empty after sanitization.");
    }
    if (!mobileNumber) {
       throw new Error("Mobile number is required for sending single SMS.");
    }

    // ساخت payload برای متد likeToLike
    const payload = {
      lineNumber: this.lineNumber, // شماره خط ارسال کننده
      messageTexts: [sanitizedText], // آرایه‌ای از متن پیام‌ها (در اینجا فقط یک پیام)
      mobiles: [mobileNumber],      // آرایه‌ای از شماره‌های مقصد (در اینجا فقط یک شماره)
      // senddatetime: null // برای ارسال فوری، این فیلد لازم نیست یا null است
    };

    // ارسال درخواست POST به endpoint likeToLike
    // ما از this.http که قبلاً با baseURL و headers پیکربندی شده، استفاده می‌کنیم.
    const response = await this.http.post("/send/likeToLike", payload);

    // response.data شامل نتیجه API است (مثلا وضعیت موفقیت یا شکست)
    return response.data;

  } catch (error) {
    // مدیریت خطاها، شامل خطاهای شبکه و خطاهای پاسخ API
    let errorMessage = "Unknown error occurred.";
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      console.error(`API Error response:`, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = `No response received from server. Request details: ${JSON.stringify(error.request)}`;
      console.error(`No response received:`, error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = `Request setup error: ${error.message}`;
      console.error(`Request setup error:`, error.message);
    }
    console.error("خطا در ارسال پیامک تکی (likeToLike):", errorMessage);
    throw new Error(errorMessage); // پرتاب خطا برای مدیریت بالاتر
  }
}



  // ارسال OTP با پترن
  async sendOtp(to, code) {
    try {
      if (!this.otpTemplateId) {
        throw new Error("SMSIR_OTP_TEMPLATE_ID is missing in .env");
      }

      const response = await this.http.post("/send/verify", {
        mobile: to,
        templateId: parseInt(this.otpTemplateId),
        parameters: [
          {
            NAME: "OTP",
            VALUE: code,
          },
        ],
      });

      return response.data;
    } catch (error) {
      console.error("خطا در ارسال OTP:", error?.response?.data || error.message);
      console.log("ارسال OTP با روش پیامک ساده...");

      return this.sendSingle(to, `کد تایید شما: ${code}`);
    }
  }

  // ارسال پیامک انبوه
  async sendBulk(messages) {
    try {
      const req = {
        lineNumber: this.lineNumber,
        message: null,
        bulkData: messages.map((msg) => ({
          mobile: msg.to,
          message: msg.text.replace(/\n/g, " "),
        })),
      };

      const response = await this.http.post("/send/bulk", req);

      return response.data;
    } catch (error) {
      console.error("خطا در ارسال پیامک انبوه:", error?.response?.data || error.message);
      throw error;
    }
  }



  // ارسال پیامک پترن سفارشی (متغیرهای متعدد)
  async sendPattern(to, patternId, paramsObj) {
    try {
      console.log("paramsObj : ", paramsObj);
      const parameters = Object.entries(paramsObj).map(([key, value]) => ({
        name: key,
        value: String(value),
      }));

      console.log("parameters are:" , parameters)

      const response = await this.http.post("/send/verifyy", {
        mobile: to,
        templateId: parseInt(patternId),
        parameters,
      });

      return response.data;
    } catch (error) {
      console.error("خطا در ارسال پیامک پترن:", error?.response?.data || error.message);
      throw error;
    }
  }

  // پیامک شخصی‌سازی‌شده (هر کاربر یک متن متفاوت)
  async sendPersonalized(users, template) {
    const bulkMessages = users.map((user) => {
      let personalizedText = template;
      for (const key in user) {
        personalizedText = personalizedText.replaceAll(`##${key}##`, user[key]);
      }
      return {
        to: user.phone,
        text: personalizedText,
      };
    });

    return this.sendBulk(bulkMessages);
  }
}

module.exports = new SmsService();


