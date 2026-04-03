/** Haversine distance between two points in km */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the closest boundary year that is <= the given year */
export function closestBoundaryYear(year: number, boundaryYears: number[]): number {
  let closest = boundaryYears[0]!;
  for (const by of boundaryYears) {
    if (by <= year) {
      closest = by;
    } else {
      break;
    }
  }
  return closest;
}
