import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config, adminEnabled } from './config.js';
import { seedIfEmpty } from './seed.js';
import { emailAlertsEnabled } from './notify.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

const app = express();
const here = dirname(fileURLToPath(import.meta.url));
const frontendDist = join(here, '..', '..', 'frontend', 'dist');

app.set('trust proxy', 1); // correct client IPs for rate limiting behind a host's proxy
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameSrc: ['https://www.google.com', 'https://maps.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors({ origin: config.frontendOrigins }));
app.use(express.json({ limit: '20kb' }));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// In production, the same server also serves the built React site.
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { maxAge: '7d', index: false }));
  app.get('*', (_req, res) => res.sendFile(join(frontendDist, 'index.html')));
}

// Malformed JSON and unexpected errors
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'The request was not valid JSON.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'That message is too long.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side. Please call us instead.' });
});

if (seedIfEmpty()) console.log('Added starter menu items (marked as samples).');

app.listen(config.port, () => {
  console.log(`The Cottage API running on http://localhost:${config.port}`);
  console.log(`  Admin login:  ${adminEnabled ? 'ready' : 'OFF (set ADMIN_PASSWORD and JWT_SECRET in backend/.env)'}`);
  console.log(`  Email alerts: ${emailAlertsEnabled ? 'on' : 'off'}`);
  console.log(`  Serving site: ${existsSync(frontendDist) ? 'yes (frontend/dist)' : 'no (run the frontend dev server)'}`);
});
