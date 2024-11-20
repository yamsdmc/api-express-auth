export const ProductCondition = {
  NEW: "new",
  LIKE_NEW: "likeNew",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
} as const;

export type ProductConditionType =
  (typeof ProductCondition)[keyof typeof ProductCondition];
