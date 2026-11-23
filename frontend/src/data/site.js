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
  {
    image: '/images/exterior-wide.webp',
    title: 'The courtyard',
    text: 'Strung with lights from dusk, with a red-carpet walk up to the doors.',
    shape: 'wide',
    alt: 'Courtyard lit with fairy lights and a red carpet at night',
  },
  {
    image: '/images/lounge.webp',
    title: 'The lounge',
    text: 'Softer light and quieter tables, made for long family dinners.',
    shape: 'arch',
    alt: 'Lounge with a brass chandelier and an arched doorway',
  },
  {
    image: '/images/arch-corridor.webp',
    title: 'The arcade',
    text: 'White arches and columns linking the rooms, with greenery in every bay.',
    shape: 'arch',
    alt: 'White arch with columns, a wall sconce and a potted plant',
  },
  {
    image: '/images/exterior-night.webp',
    title: 'The evening welcome',
    text: 'An arch of fairy lights frames the way in from the gate.',
    shape: 'arch',
    alt: 'An arch of fairy lights over the red carpet leading to the entrance at night',
  },
  {
    image: '/images/arch-light.webp',
    title: 'Afternoon light',
    text: 'The arched windows cast their shape across the striped walls.',
    shape: 'arch',
    alt: 'Light through an arched window falling across the sage-striped wall',
  },
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
