export function calculateSoloIndex(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  const result = 100-ratings*50;
  return result;
}
