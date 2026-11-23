// D1 (Cloudflare's SQLite) schema and starter data.
// Tables are created automatically on the first request, so a fresh
// database needs no manual setup.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS reservations (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     name        TEXT    NOT NULL,
     phone       TEXT    NOT NULL,
     email       TEXT,
     date        TEXT    NOT NULL,
     time        TEXT    NOT NULL,
     guests      INTEGER NOT NULL,
     occasion    TEXT,
     notes       TEXT,
     status      TEXT    NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','seated','cancelled')),
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS messages (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     name        TEXT    NOT NULL,
     phone       TEXT,
     email       TEXT,
     topic       TEXT    NOT NULL DEFAULT 'general',
     message     TEXT    NOT NULL,
     status      TEXT    NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','done')),
     created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS menu_items (
     id            INTEGER PRIMARY KEY AUTOINCREMENT,
     category      TEXT    NOT NULL CHECK (category IN ('restaurant','bakery','sweets')),
     name          TEXT    NOT NULL,
     description   TEXT,
     price         INTEGER,
     unit          TEXT,
     is_signature  INTEGER NOT NULL DEFAULT 0,
     is_available  INTEGER NOT NULL DEFAULT 1,
     is_sample     INTEGER NOT NULL DEFAULT 0,
     sort_order    INTEGER NOT NULL DEFAULT 0,
     created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
     updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_res_date   ON reservations(date, time)`,
  `CREATE INDEX IF NOT EXISTS idx_res_status ON reservations(status)`,
  `CREATE INDEX IF NOT EXISTS idx_msg_status ON messages(status)`,
  `CREATE INDEX IF NOT EXISTS idx_menu_cat   ON menu_items(category, sort_order)`,
];

// Starter menu: marked is_sample = 1 and shown without prices until the owner edits them.
const STARTER = {
  restaurant: [
    ['Paneer Lababdar', 'Cottage cheese in a rich tomato, cashew and butter gravy.', 1],
    ['Dal Makhani', 'Black lentils slow-cooked overnight with butter and cream.', 1],
    ['Subz Dum Biryani', 'Awadhi-style rice and vegetables sealed and cooked on dum.', 0],
    ['Malai Kofta', 'Soft paneer dumplings in a mild, creamy gravy.', 0],
    ['Cottage Thali', 'A full plate of the day: dal, two sabzi, rice, breads, salad and a sweet.', 1],
    ['Tandoori Breads', 'Butter naan, laccha paratha and tandoori roti.', 0],
  ],
  bakery: [
    ['Celebration Cakes', 'Made to order for birthdays and anniversaries. Order a day ahead.', 1],
    ['Chocolate Truffle Cake', 'Layers of chocolate sponge and dark ganache.', 0],
    ['Fresh Cream Pastries', 'Pineapple, black forest and butterscotch, baked daily.', 0],
    ['Cookies & Rusks', 'Tea-time bakes, packed fresh.', 0],
  ],
  sweets: [
    ['Malai Gilori', 'Lucknow’s classic: delicate rolls of malai filled with dry fruits.', 1],
    ['Kaju Katli', 'Thin cashew fudge finished with silver vark.', 0],
    ['Motichoor Laddoo', 'Fine boondi bound with ghee and saffron.', 0],
    ['Rasmalai', 'Soft chhena discs in chilled saffron milk.', 1],
    ['Festive Gift Hampers', 'Boxed mithai and bakery assortments for every occasion.', 0],
  ],
};

let ready = null; // once per Worker instance

export function ensureSchema(db) {
  if (!ready) {
    ready = (async () => {
      await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
      const row = await db.prepare('SELECT COUNT(*) AS n FROM menu_items').first();
      if (row.n === 0) {
        const insert = db.prepare(
          'INSERT INTO menu_items (category, name, description, is_signature, is_sample, sort_order) VALUES (?, ?, ?, ?, 1, ?)',
        );
        const rows = Object.entries(STARTER).flatMap(([cat, items]) =>
          items.map(([name, desc, sig], i) => insert.bind(cat, name, desc, sig, (i + 1) * 10)),
        );
        await db.batch(rows);
      }
    })().catch((err) => {
      ready = null; // try again on the next request
      throw err;
    });
  }
  return ready;
}

/** SQLite 0/1 flags → booleans for the JSON API. */
export function toMenuItem(row) {
  if (!row) return row;
  return { ...row, is_signature: Boolean(row.is_signature), is_available: Boolean(row.is_available), is_sample: Boolean(row.is_sample) };
}
