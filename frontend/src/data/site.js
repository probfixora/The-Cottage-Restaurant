// Everything factual about the restaurant lives here, in one place.
// Source: the Google Maps listing and @thecottage.lko on Instagram.

export const site = {
  name: 'The Cottage',
  by: 'by Tribhog',
  phoneDisplay: '+91 63917 16969',
  phoneHref: 'tel:+916391716969',
  instagram: 'https://www.instagram.com/thecottage.lko/',
  instagramHandle: '@thecottage.lko',
  googleListing: 'https://share.google/l9lpfWjAQdKfLZgjX',
  directions: 'https://www.google.com/maps/dir/?api=1&destination=26.7808272,81.046949',
  mapEmbed: 'https://maps.google.com/maps?q=26.7808272,81.046949&z=15&output=embed',
  addressLines: ['Khurdahi Bazar, Sultanpur Road', 'near Kisan Path, Marhar Mau Kala', 'Lucknow, Uttar Pradesh 226002'],
  hoursText: 'Every day, 9:00 AM – 11:30 PM',
  openMinutes: 9 * 60,
  closeMinutes: 23 * 60 + 30,
  rating: 4.8,
  priceText: '₹200–400 per person',
};

export const counters = [
  {
    id: 'restaurant',
    title: 'Restaurant',
    photo: 'g18',
    alt: 'Dining tables seen through a white arch at The Cottage',
    text: 'A family dining hall under white vaults and brass light. Home-style North Indian plates, thalis and tandoor breads, all pure vegetarian.',
    good: 'Family lunches, birthday dinners, a long evening out',
  },
  {
    id: 'bakery',
    title: 'Bakery',
    photo: 'g09',
    alt: 'Long glass bakery counters beneath the vaulted ceiling',
    text: 'Glass counters of cakes, pastries and tea-time bakes. Celebration cakes are made to order: tell us the day and the size.',
    good: 'Birthday cakes, office treats, something with your chai',
  },
  {
    id: 'sweets',
    title: 'Tribhog Sweets',
    photo: 'g06',
    alt: 'Festive hampers on a sage-draped table in the grand hall',
    text: 'Tribhog’s mithai counter: traditional Lucknow sweets made fresh, plus boxed hampers for weddings, festivals and gifting.',
    good: 'Festivals, wedding orders, gift boxes',
  },
];

// Gallery photos: all the same 4:5 size, from the Google Maps listing.
// To add one: put gNN.webp (960x1200) and gNN-480.webp (480x600) in public/images/gallery
// and add a line here.
export const gallery = [
  { id: 'g01', title: 'The front doors', alt: 'Glass doors of The Cottage opening onto the lit courtyard at night' },
  { id: 'g02', title: 'The courtyard at night', alt: 'Courtyard strung with fairy lights, with a red carpet to the entrance' },
  { id: 'g03', title: 'The red-carpet welcome', alt: 'Red carpet leading under a flowered arch to the front doors' },
  { id: 'g04', title: 'Lights over the courtyard', alt: 'Strings of warm lights over courtyard tables, seen through the doors' },
  { id: 'g05', title: 'The grand hall', alt: 'The vaulted grand hall with a brass chandelier and festive hampers' },
  { id: 'g06', title: 'Festive hampers', alt: 'Gift hampers on a table draped in sage satin' },
  { id: 'g07', title: 'Brass under the vault', alt: 'A brass chandelier hanging from the white vaulted ceiling' },
  { id: 'g08', title: 'The bakery counters', alt: 'Long glass bakery counters under lit arched niches' },
  { id: 'g09', title: 'Fresh from the bakery', alt: 'Close view of the glass counters filled with bakes and sweets' },
  { id: 'g10', title: 'Lit arches above the counters', alt: 'Softly lit arched niches with shelves above the bakery counters' },
  { id: 'g11', title: 'The vaulted ceiling', alt: 'White vaulted ceiling with a chandelier over the hall' },
  { id: 'g12', title: 'Columns and sage stripes', alt: 'A white column wrapped in leaves beside a sage-striped arch' },
  { id: 'g13', title: 'The brass chandelier', alt: 'Close view of a brass chandelier with glass shades' },
  { id: 'g14', title: 'White columns', alt: 'White columns and arches beneath the vault' },
  { id: 'g15', title: 'The lounge', alt: 'The lounge with a chandelier and an arched doorway' },
  { id: 'g16', title: 'Lounge lights', alt: 'A chandelier in the lounge ceiling medallion' },
  { id: 'g17', title: 'The arcade', alt: 'White arch with columns, a wall sconce and a potted plant' },
  { id: 'g18', title: 'Through the arch', alt: 'The dining room and counters seen through a white arch' },
  { id: 'g19', title: 'Afternoon light', alt: 'Light through an arched window falling across the sage-striped wall' },
];

// Real Google reviews of The Cottage (first name and initial only).
export const reviews = [
  {
    quote: 'A beautiful restaurant with an amazing aesthetic ambience! The interiors are elegant, the lighting is perfect, and every corner has its own charm.',
    name: 'Krishna D.',
  },
  {
    quote: 'The food was delicious, the service was good, and the staff was polite and welcoming. We would love to visit again.',
    name: 'Deeksha G.',
  },
  {
    quote: 'Everything was good, specially the food and staff. Aesthetically impressive as well. Do come here.',
    name: 'Rituraj S.',
  },
  {
    quote: 'Food quality and taste is excellent, and the price is also reasonable.',
    name: 'A guest',
  },
];

export const navLinks = [
  { href: '#counters', label: 'What we serve' },
  { href: '#menu', label: 'Menu' },
  { href: '#spaces', label: 'Spaces' },
  { href: '#visit', label: 'Visit' },
];
