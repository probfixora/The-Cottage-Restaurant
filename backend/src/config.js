// Reads settings from environment variables (loaded from .env by `npm run dev`).
const env = process.env;

export const config = {
  port: Number(env.PORT) || 5050,
  frontendOrigins: (env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  adminPassword: env.ADMIN_PASSWORD || '',
  jwtSecret: env.JWT_SECRET || '',
  dbPath: env.DB_PATH || './data/cottage.db',
  isProduction: env.NODE_ENV === 'production',
  smtp: {
    host: env.SMTP_HOST || '',
    port: Number(env.SMTP_PORT) || 465,
    secure: (env.SMTP_SECURE || 'true') === 'true',
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
    notify: env.NOTIFY_EMAIL || '',
  },
};

const weak = new Set(['', 'change-me-to-a-long-password', 'replace-with-a-long-random-string']);
export const adminEnabled =
  !weak.has(config.adminPassword) && config.adminPassword.length >= 10 &&
  !weak.has(config.jwtSecret) && config.jwtSecret.length >= 24;
