export type NormalizedCollege = {
  id: string;
  name: string;
  city: string;
  state: string;
  fees: number | null;
  rating: number | null;
  highestPackage: number | null;
  averagePackage: number | null;
};

type NumericComparison = {
  values: (number | null)[];
  best: number | null;
};

export type CollegeComparisonResult = {
  colleges: NormalizedCollege[];
  comparison: {
    fees: NumericComparison;
    placement: NumericComparison;
    rating: NumericComparison;
    location: { values: string[] };
  };
};

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatLocation(city: string, state: string): string {
  if (city && state) return `${city}, ${state}`;
  return city || state || "N/A";
}

// best = lowest for fees, highest for rating/placement; skips null values
function findBestIndex(
  values: (number | null)[],
  direction: "low" | "high",
): number | null {
  let bestIndex: number | null = null;
  let bestValue: number | null = null;

  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (value === null) continue;

    if (
      bestValue === null ||
      (direction === "low" ? value < bestValue : value > bestValue)
    ) {
      bestValue = value;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export function normalizeCollege(raw: {
  id: string;
  name: string;
  city: string;
  state: string;
  fees: unknown;
  rating: unknown;
  highestPackage: unknown;
  averagePackage: unknown;
}): NormalizedCollege {
  return {
    id: raw.id,
    name: raw.name,
    city: raw.city,
    state: raw.state,
    fees: toNumber(raw.fees),
    rating: toNumber(raw.rating),
    highestPackage: toNumber(raw.highestPackage),
    averagePackage: toNumber(raw.averagePackage),
  };
}

export function buildCollegeComparison(
  colleges: NormalizedCollege[],
): CollegeComparisonResult {
  const feesValues = colleges.map((c) => c.fees);
  const placementValues = colleges.map((c) => c.highestPackage);
  const ratingValues = colleges.map((c) => c.rating);
  const locationValues = colleges.map((c) =>
    formatLocation(c.city, c.state),
  );

  return {
    colleges,
    comparison: {
      fees: { values: feesValues, best: findBestIndex(feesValues, "low") },
      placement: {
        values: placementValues,
        best: findBestIndex(placementValues, "high"),
      },
      rating: { values: ratingValues, best: findBestIndex(ratingValues, "high") },
      location: { values: locationValues },
    },
  };
}
