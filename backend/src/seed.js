// Adds a starter menu the first time the database is created.
// Every starter item is marked is_sample = 1 and has no price, so nothing
// shows a price until the owner sets one in the admin panel.
import { db } from './db.js';

const starter = {
  restaurant: [
    ['Paneer Lababdar', 'Cottage cheese in a rich tomato, cashew and butter gravy.', true],
    ['Dal Makhani', 'Black lentils slow-cooked overnight with butter and cream.', true],
    ['Subz Dum Biryani', 'Awadhi-style rice and vegetables sealed and cooked on dum.', false],
    ['Malai Kofta', 'Soft paneer dumplings in a mild, creamy gravy.', false],
    ['Cottage Thali', 'A full plate of the day: dal, two sabzi, rice, breads, salad and a sweet.', true],
    ['Tandoori Breads', 'Butter naan, laccha paratha and tandoori roti.', false],
  ],
  bakery: [
    ['Celebration Cakes', 'Made to order for birthdays and anniversaries. Order a day ahead.', true],
    ['Chocolate Truffle Cake', 'Layers of chocolate sponge and dark ganache.', false],
    ['Fresh Cream Pastries', 'Pineapple, black forest and butterscotch, baked daily.', false],
    ['Cookies & Rusks', 'Tea-time bakes, packed fresh.', false],
  ],
  sweets: [
    ['Malai Gilori', 'Lucknow’s classic: delicate rolls of malai filled with dry fruits.', true],
    ['Kaju Katli', 'Thin cashew fudge finished with silver vark.', false],
    ['Motichoor Laddoo', 'Fine boondi bound with ghee and saffron.', false],
    ['Rasmalai', 'Soft chhena discs in chilled saffron milk.', true],
    ['Festive Gift Hampers', 'Boxed mithai and bakery assortments for every occasion.', false],
  ],
};

export function seedIfEmpty() {
  const { n } = db.prepare('SELECT COUNT(*) n FROM menu_items').get();
  if (n > 0) return false;
  const insert = db.prepare(
    `INSERT INTO menu_items (category, name, description, is_signature, is_sample, sort_order)
     VALUES (?, ?, ?, ?, 1, ?)`,
  );
  db.exec('BEGIN');
  try {
    for (const [category, items] of Object.entries(starter)) {
      items.forEach(([name, description, signature], i) => insert.run(category, name, description, signature ? 1 : 0, (i + 1) * 10));
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return true;
}

// Allow `npm run seed`
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('seed.js')) {
  console.log(seedIfEmpty() ? 'Starter menu added.' : 'Menu already has items; nothing added.');
}
