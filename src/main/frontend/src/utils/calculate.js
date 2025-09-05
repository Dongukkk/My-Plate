export function calculateSoloIndex(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  const result = 100-ratings*50;
  return result;
}

export function calculateSoloLevel(value) {
  if (value >= 0 && value < 0.5) {
    return 1;
  } else if (value >= 0.5 && value < 1.5) {
    return 2;
  } else if (value >= 1.5 && value < 2.0) {
    return 3;
  } else {
    return null;
  }
}
