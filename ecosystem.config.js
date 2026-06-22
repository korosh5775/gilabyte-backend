module.exports = {
  apps: [{
    name: "cosmetics-backend",
    script: "./server.js",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000 // ما پورت داخلی کانتینر را روی ۳۰۰۰ فیکس می‌کنیم (ربطی به ۸۰۰۰ بیرون ندارد)
    },
    time: true,
    log_date_format: "YYYY-MM-DD HH:mm Z",
    merge_logs: true,
    log_type: "json",
    
  }]
}