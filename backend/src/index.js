// Cloudflare Worker entry point.
// /api/*  → this code (bookings, messages, menu, staff panel)
// anything else → the built React website in frontend/dist (served by Cloudflare's static assets)
import { ensureSchema } from './db.js';
import { HttpError, error } from './http.js';
import { handlePublic } from './routes/public.js';
import { handleAdmin } from './routes/admin.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    try {
      if (!env.DB) return error(503, 'The database is not connected to this Worker.');
      await ensureSchema(env.DB);

      const path = url.pathname.slice(4).replace(/\/+$/, '') || '/'; // "/api/menu" → "/menu"
      if (path === '/admin' || path.startsWith('/admin/')) {
        return await handleAdmin(request, env, path.slice(6) || '/', url);
      }
      return (await handlePublic(request, env, path)) ?? error(404, 'Not found.');
    } catch (err) {
      if (err instanceof HttpError) return error(err.status, err.message, err.fields);
      console.error('API error', url.pathname, err);
      return error(500, 'Something went wrong on our side. Please call us instead.');
    }
  },
};
