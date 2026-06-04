export function calculateWPM(charsTyped, seconds) {
  if (!seconds) return 0;

  const words = charsTyped / 5;

  return Math.round(words / (seconds / 60));
}

export function calculateAccuracy(correct, typed) {
  if (!typed) return 100;

  return Math.round((correct / typed) * 100);
}