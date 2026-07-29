
```
gilabyte-backend
├─ Dockerfile
├─ clean_comments.js
├─ cleanup_blocks.js
├─ controllers
│  ├─ admin
│  │  ├─ mainPageEditor
│  │  │  ├─ ImageSlider
│  │  │  │  ├─ RemoveSliderImages.js
│  │  │  │  ├─ createSliderImages.js
│  │  │  │  ├─ getSliderImages.js
│  │  │  │  └─ updateSliderImages.js
│  │  │  └─ footer
│  │  │     ├─ deleteFooter.js
│  │  │     ├─ getDefaultFooter.js
│  │  │     ├─ getFooter.js
│  │  │     ├─ newFooter.js
│  │  │     └─ updateFooter.js
│  │  ├─ sms
│  │  │  ├─ automatedSms.js
│  │  │  ├─ campaign.js
│  │  │  ├─ manualSms.js
│  │  │  └─ report.js
│  │  └─ users
│  │     ├─ getUsers.js
│  │     ├─ searchUsers.js
│  │     └─ userManager.js
│  ├─ shared
│  │  └─ utils
│  │     └─ getTime.js
│  └─ user
│     ├─ footer
│     │  └─ getFooter.js
│     ├─ profile
│     │  ├─ getUserDetails.js
│     │  ├─ updatePushToken.js
│     │  └─ updateUserDetails.js
│     ├─ seo
│     │  └─ sitemap.js
│     └─ userAuth
│        ├─ auth.js
│        ├─ changePassword.js
│        ├─ forgetPassword.js
│        ├─ login.js
│        └─ register.js
├─ drop_comments.js
├─ ecosystem.config.js
├─ images
│  └─ footer
│     └─ costum
│        └─ brandImage
│           └─ logo-1782239392118-885189362.png
├─ middlewares
│  ├─ authorization.js
│  ├─ errorrHandler.js
│  └─ hasRole.js
├─ models
│  ├─ automatedSmsTemplate.js
│  ├─ campaign.js
│  ├─ campaignLog.js
│  ├─ footerSchema.js
│  ├─ service.js
│  ├─ sliderImagesSchema.js
│  ├─ smsJob.js
│  └─ usersSchema.js
├─ package-lock.json
├─ package.json
├─ rename_refs.sh
├─ routes
│  ├─ api
│  │  └─ v1.1
│  │     ├─ admin.js
│  │     ├─ shared.js
│  │     └─ users.js
│  └─ index.js
├─ server.js
├─ services
│  ├─ audienceBuilder.service.js
│  ├─ pushNotificationService.js
│  ├─ scheduler.service.js
│  ├─ sms.worker.js
│  └─ transactionalSmsService.js
└─ utils
   ├─ connection.js
   ├─ emailSender.js
   ├─ multer.js
   ├─ smsService.js
   ├─ templateHelper.js
   └─ zarinpal.js

```