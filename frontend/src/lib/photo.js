// Responsive photos: phones download the small file, large screens the full one.
// Every photo has a "-720" (or other width) copy next to it in public/images.

const FULL_WIDTH = {
  'hall-chandelier': 1200,
  chandelier: 1200,
  'arch-view': 900,
  'bakery-counter': 900,
  'grand-hall': 900,
  'exterior-night': 1351,
  lounge: 900,
  'arch-corridor': 830,
  'arch-light': 900,
  'entrance-doors': 1200,
  'exterior-wide': 1801,
  'entrance-wide': 2400,
};
const SMALL_WIDTH = { 'exterior-wide': 960, 'entrance-wide': 1600 };

/** photo('/images/lounge.webp') → { src, srcSet } */
export function photo(path) {
  const name = path.replace(/^\/images\//, '').replace(/\.webp$/, '');
  const full = FULL_WIDTH[name];
  if (!full) return { src: path };
  const small = SMALL_WIDTH[name] ?? 720;
  return { src: path, srcSet: `/images/${name}-${small}.webp ${small}w, ${path} ${full}w` };
}
