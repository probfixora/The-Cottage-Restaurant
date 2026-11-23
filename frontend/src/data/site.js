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
  reviewCount: 31,
  priceText: '₹200–400 per person',
};

export const counters = [
  {
    id: 'restaurant',
    title: 'Restaurant',
    image: '/images/arch-view.webp',
    alt: 'Dining tables seen through a white arch at The Cottage',
    text: 'A family dining hall under white vaults and brass light. Home-style North Indian plates, thalis and tandoor breads, all pure vegetarian.',
    good: 'Family lunches, birthday dinners, a long evening out',
  },
  {
    id: 'bakery',
    title: 'Bakery',
    image: '/images/bakery-counter.webp',
    alt: 'Long glass bakery counters beneath the vaulted ceiling',
    text: 'Glass counters of cakes, pastries and tea-time bakes. Celebration cakes are made to order: tell us the day and the size.',
    good: 'Birthday cakes, office treats, something with your chai',
  },
  {
    id: 'sweets',
    title: 'Tribhog Sweets',
    image: '/images/grand-hall.webp',
    alt: 'Festive hampers on a sage-draped table in the grand hall',
    text: 'Tribhog’s mithai counter: traditional Lucknow sweets made fresh, plus boxed hampers for weddings, festivals and gifting.',
    good: 'Festivals, wedding orders, gift boxes',
  },
];

export const spaces = [
  { image: '/images/hall-chandelier.webp', title: 'The grand hall', shape: 'arch', alt: 'Vaulted grand hall with a brass chandelier and bakery counters' },
  { image: '/images/exterior-wide.webp', title: 'The courtyard at night', shape: 'wide', alt: 'Courtyard lit with fairy lights and a red carpet at night' },
  { image: '/images/lounge.webp', title: 'The lounge', shape: 'tall', alt: 'Lounge with chandelier and an arched doorway' },
  { image: '/images/arch-corridor.webp', title: 'The arcade', shape: 'arch', alt: 'White arch with columns, a wall sconce and a potted plant' },
  { image: '/images/entrance-doors.webp', title: 'The front doors', shape: 'tall', alt: 'Glass entrance doors opening onto the lit courtyard' },
  { image: '/images/chandelier.webp', title: 'Brass light', shape: 'arch', alt: 'Brass chandelier under a white vault' },
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
    name: 'Google reviewer',
  },
];

export const navLinks = [
  { href: '#counters', label: 'What we serve' },
  { href: '#menu', label: 'Menu' },
  { href: '#spaces', label: 'Spaces' },
  { href: '#visit', label: 'Visit' },
];
