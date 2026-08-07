
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
```
gilabyte-backend
├─ Dockerfile
├─ README.md
├─ clean_comments.js
├─ cleanup_blocks.js
├─ controllers
│  ├─ admin
│  │  ├─ about
│  │  │  └─ updateAbout.js
│  │  ├─ banner
│  │  │  └─ updateBanner.js
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
│  │  ├─ orders
│  │  │  ├─ getOrders.js
│  │  │  └─ updateOrderStatus.js
│  │  ├─ portfolio
│  │  │  ├─ createPortfolio.js
│  │  │  ├─ deletePortfolio.js
│  │  │  ├─ getPortfolioById.js
│  │  │  ├─ swapPortfolioOrder.js
│  │  │  └─ updatePortfolio.js
│  │  ├─ services
│  │  │  ├─ createService.js
│  │  │  ├─ deleteService.js
│  │  │  ├─ getAdminServiceById.js
│  │  │  ├─ getAdminServices.js
│  │  │  ├─ toggleServiceStatus.js
│  │  │  └─ updateService.js
│  │  ├─ sms
│  │  │  ├─ automatedSms.js
│  │  │  ├─ campaign.js
│  │  │  ├─ manualSms.js
│  │  │  └─ report.js
│  │  ├─ tickets
│  │  │  ├─ getAdminSingleTicket.js
│  │  │  ├─ getAllTickets.js
│  │  │  ├─ replyTicketAdmin.js
│  │  │  └─ toggleTicketStatus.js
│  │  └─ users
│  │     ├─ getAdminProfile.js
│  │     ├─ getUsers.js
│  │     ├─ searchUsers.js
│  │     └─ userManager.js
│  ├─ shared
│  │  ├─ about
│  │  │  └─ getAbout.js
│  │  ├─ banner
│  │  │  └─ getBanner.js
│  │  ├─ portfolio
│  │  │  └─ getPortfolios.js
│  │  └─ utils
│  │     └─ getTime.js
│  └─ user
│     ├─ footer
│     │  └─ getFooter.js
│     ├─ orders
│     │  └─ createOrder.js
│     ├─ profile
│     │  ├─ getUserDetails.js
│     │  ├─ updatePushToken.js
│     │  └─ updateUserDetails.js
│     ├─ seo
│     │  └─ sitemap.js
│     ├─ services
│     │  ├─ getServiceBySlug.js
│     │  └─ getServices.js
│     ├─ tickets
│     │  ├─ closeTicket.js
│     │  ├─ createTicket.js
│     │  ├─ getSingleTicket.js
│     │  ├─ getUnreadCount.js
│     │  ├─ getUserTickets.js
│     │  ├─ markAsRead.js
│     │  └─ replyTicket.js
│     └─ userAuth
│        ├─ auth.js
│        ├─ changePassword.js
│        ├─ forgetPassword.js
│        ├─ login.js
│        └─ register.js
├─ drop_comments.js
├─ ecosystem.config.js
├─ images
│  ├─ about
│  │  ├─ founder
│  │  │  └─ founderImage-1785942380921-226561948.jpg
│  │  └─ team
│  │     ├─ teamImage_0-1785942380925-974090226.jpg
│  │     └─ teamImage_1-1785942380963-921254894.jpg
│  ├─ banner
│  │  ├─ bannerImageDark-1785961361199-684409127.png
│  │  └─ bannerImageLight-1785960904960-809636326.png
│  ├─ footer
│  │  └─ costum
│  │     └─ brandImage
│  │        ├─ logo-1782239392118-885189362.png
│  │        └─ logo-1785771143417-393932262.png
│  ├─ portfolios
│  │  ├─ portfolioImage-1785785669104-448659995.png
│  │  ├─ portfolioImage-1785785801552-146462744.webp
│  │  ├─ portfolioImage-1785785974644-954094486.webp
│  │  ├─ portfolioImage-1785786000180-252256938.webp
│  │  └─ portfolioImage-1785786342045-510120656.jpg
│  └─ services
│     └─ thumbnails
│        ├─ serviceThumbnail-1785350957570-312452301.png
│        ├─ serviceThumbnail-1785351751822-185763004.png
│        ├─ serviceThumbnail-1785351996298-339338871.png
│        ├─ serviceThumbnail-1785352570765-138836545.png
│        ├─ serviceThumbnail-1785354294143-997870510.png
│        └─ serviceThumbnail-1785774297968-704701115.png
├─ middlewares
│  ├─ authorization.js
│  ├─ errorrHandler.js
│  └─ hasRole.js
├─ models
│  ├─ about.js
│  ├─ automatedSmsTemplate.js
│  ├─ banner.js
│  ├─ campaign.js
│  ├─ campaignLog.js
│  ├─ footerSchema.js
│  ├─ order.js
│  ├─ portfolio.js
│  ├─ service.js
│  ├─ sliderImagesSchema.js
│  ├─ smsJob.js
│  ├─ ticket.js
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