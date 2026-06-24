export type RecommendationWeights = {
  rankWeight: number;
  feesWeight: number;
  placementWeight: number;
};

export type RecommendationConfig = {
  weights: RecommendationWeights;
  rank: {
    minExpectedRank: number;
    maxExpectedRank: number;
    maxRankDifference: number;
  };
  explanationThresholds: {
    rank: number;
    fees: number;
    placement: number;
  };
  topN: number;
};

export type CollegeForRecommendation = {
  id: string;
  fees: number | null;
  rating: number | null;
  highestPackage: number | null;
};

export type RecommendationInput = {
  rank: number;
  maxFees: number;
  preferredLocation?: string;
};

export type RecommendationResult = {
  collegeId: string;
  score: number;
  explanation: string;
};

type SubScores = {
  rankMatchScore: number;
  affordabilityScore: number;
  placementScore: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function minMaxNormalize(value: number, min: number, max: number): number {
  if (max <= min) return 1;
  return clamp((value - min) / (max - min), 0, 1);
}

// Configurable via env; weights should sum to 1
export function getRecommendationConfig(): RecommendationConfig {
  const rankWeight = Number(process.env.RECOMMEND_RANK_WEIGHT) || 0.4;
  const feesWeight = Number(process.env.RECOMMEND_FEES_WEIGHT) || 0.35;
  const placementWeight = Number(process.env.RECOMMEND_PLACEMENT_WEIGHT) || 0.25;

  return {
    weights: { rankWeight, feesWeight, placementWeight },
    rank: {
      minExpectedRank: Number(process.env.RECOMMEND_MIN_EXPECTED_RANK) || 500,
      maxExpectedRank: Number(process.env.RECOMMEND_MAX_EXPECTED_RANK) || 500_000,
      maxRankDifference:
        Number(process.env.RECOMMEND_MAX_RANK_DIFFERENCE) || 100_000,
    },
    explanationThresholds: {
      rank: Number(process.env.RECOMMEND_EXPLAIN_RANK_THRESHOLD) || 0.6,
      fees: Number(process.env.RECOMMEND_EXPLAIN_FEES_THRESHOLD) || 0.6,
      placement:
        Number(process.env.RECOMMEND_EXPLAIN_PLACEMENT_THRESHOLD) || 0.6,
    },
    topN: Number(process.env.RECOMMEND_TOP_N) || 10,
  };
}

// Higher rating → more competitive → lower expected rank
export function expectedRankFromRating(
  rating: number | null,
  config: RecommendationConfig,
): number {
  if (rating === null) return config.rank.maxExpectedRank;

  const normalizedRating = clamp(rating / 5, 0, 1);
  return (
    config.rank.maxExpectedRank -
    normalizedRating *
      (config.rank.maxExpectedRank - config.rank.minExpectedRank)
  );
}

// Closer user rank to expected rank → higher score (0–1)
export function computeRankMatchScore(
  userRank: number,
  expectedRank: number,
  config: RecommendationConfig,
): number {
  const diff = Math.abs(userRank - expectedRank);
  return clamp(1 - diff / config.rank.maxRankDifference, 0, 1);
}

// Lower fees relative to budget → higher score (0–1)
export function computeAffordabilityScore(
  fees: number | null,
  maxFees: number,
): number {
  if (fees === null || maxFees <= 0) return 0;
  return clamp((maxFees - fees) / maxFees, 0, 1);
}

// Higher placement → higher score (0–1), normalized across eligible set
export function computePlacementScore(
  highestPackage: number | null,
  minPlacement: number,
  maxPlacement: number,
): number {
  if (highestPackage === null) return 0;
  return minMaxNormalize(highestPackage, minPlacement, maxPlacement);
}

export function computeSubScores(
  college: CollegeForRecommendation,
  input: RecommendationInput,
  placementRange: { min: number; max: number },
  config: RecommendationConfig,
): SubScores {
  const expectedRank = expectedRankFromRating(college.rating, config);

  return {
    rankMatchScore: computeRankMatchScore(input.rank, expectedRank, config),
    affordabilityScore: computeAffordabilityScore(college.fees, input.maxFees),
    placementScore: computePlacementScore(
      college.highestPackage,
      placementRange.min,
      placementRange.max,
    ),
  };
}

export function computeWeightedScore(
  subScores: SubScores,
  weights: RecommendationWeights,
): number {
  return (
    weights.rankWeight * subScores.rankMatchScore +
    weights.feesWeight * subScores.affordabilityScore +
    weights.placementWeight * subScores.placementScore
  );
}

export function buildRecommendationExplanation(
  subScores: SubScores,
  config: RecommendationConfig,
): string {
  const parts: string[] = [];

  if (subScores.rankMatchScore >= config.explanationThresholds.rank) {
    parts.push("Good rank match");
  }
  if (subScores.affordabilityScore >= config.explanationThresholds.fees) {
    parts.push("affordable fees");
  }
  if (subScores.placementScore >= config.explanationThresholds.placement) {
    parts.push("strong placement");
  }

  if (parts.length === 0) return "Moderate overall fit";

  return parts.join(", ");
}

export function scoreAndRankColleges(
  colleges: CollegeForRecommendation[],
  input: RecommendationInput,
  config: RecommendationConfig = getRecommendationConfig(),
): RecommendationResult[] {
  if (colleges.length === 0) return [];

  const placements = colleges
    .map((c) => toNumber(c.highestPackage))
    .filter((v): v is number => v !== null);

  const placementRange = {
    min: placements.length > 0 ? Math.min(...placements) : 0,
    max: placements.length > 0 ? Math.max(...placements) : 0,
  };

  return colleges
    .map((college) => {
      const subScores = computeSubScores(
        college,
        input,
        placementRange,
        config,
      );
      const score = computeWeightedScore(subScores, config.weights);

      return {
        collegeId: college.id,
        score: Number(score.toFixed(4)),
        explanation: buildRecommendationExplanation(subScores, config),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, config.topN);
}

export function normalizeCollegeForRecommendation(raw: {
  id: string;
  fees: unknown;
  rating: unknown;
  highestPackage: unknown;
}): CollegeForRecommendation {
  return {
    id: raw.id,
    fees: toNumber(raw.fees),
    rating: toNumber(raw.rating),
    highestPackage: toNumber(raw.highestPackage),
  };
}
