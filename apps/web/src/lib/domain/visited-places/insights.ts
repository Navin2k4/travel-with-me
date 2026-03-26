type PlaceInsightInput = {
  id: string;
  name: string;
  category: "ATTRACTION" | "FOOD" | "STAY" | "SHOPPING" | "OTHER";
  rating: number | null;
};

export function getTotalPlacesVisited(places: PlaceInsightInput[]) {
  return places.length;
}

export function getFavoritePlace(places: PlaceInsightInput[]) {
  const rated = places.filter((place) => typeof place.rating === "number");
  if (rated.length === 0) return null;
  return rated.reduce((best, current) => ((current.rating ?? 0) > (best.rating ?? 0) ? current : best));
}

export function getMostVisitedCategory(places: PlaceInsightInput[]) {
  if (places.length === 0) return null;
  const countByCategory = new Map<string, number>();
  for (const place of places) {
    countByCategory.set(place.category, (countByCategory.get(place.category) ?? 0) + 1);
  }
  let top: { category: string; count: number } | null = null;
  for (const [category, count] of countByCategory.entries()) {
    if (!top || count > top.count) top = { category, count };
  }
  return top;
}

export function getGroupAverageRating(places: PlaceInsightInput[]) {
  const rated = places.filter((place) => typeof place.rating === "number");
  if (rated.length === 0) return null;
  const avg = rated.reduce((sum, place) => sum + (place.rating ?? 0), 0) / rated.length;
  return Number(avg.toFixed(2));
}
