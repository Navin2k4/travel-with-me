import { z } from "zod";

export const PLACE_CATEGORY_VALUES = [
  "TRANSPORT",
  "ATTRACTION",
  "FOOD",
  "STAY",
  "SHOPPING",
  "NATURE",
  "NIGHTLIFE",
  "CULTURE",
  "ENTERTAINMENT",
  "WELLNESS",
  "OTHER",
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORY_VALUES)[number];

const categorySet = new Set<string>(PLACE_CATEGORY_VALUES);

export function asPlaceCategory(value: string): PlaceCategory {
  return categorySet.has(value) ? (value as PlaceCategory) : "OTHER";
}

export const PlaceCategorySchema = z.enum(PLACE_CATEGORY_VALUES);

export const PLACE_CATEGORY_OPTIONS: { value: PlaceCategory; label: string }[] = [
  { value: "TRANSPORT", label: "Transport & transit" },
  { value: "ATTRACTION", label: "Attraction" },
  { value: "FOOD", label: "Food & drink" },
  { value: "STAY", label: "Stay / lodging" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "NATURE", label: "Nature & outdoors" },
  { value: "NIGHTLIFE", label: "Nightlife" },
  { value: "CULTURE", label: "Culture & heritage" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "WELLNESS", label: "Wellness & spa" },
  { value: "OTHER", label: "Other" },
];

const labelByValue: Record<string, string> = Object.fromEntries(
  PLACE_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);

export function placeCategoryLabel(value: string): string {
  return labelByValue[value] ?? value;
}
