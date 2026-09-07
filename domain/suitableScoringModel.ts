import type { DogLifestyleProfile, SuitableQuestion, SuitableTraitVector } from '@/types/personality';

export const suitableScoringTraitKeys = [
  'activityCapacity',
  'trainingCommitment',
  'socialPreference',
  'attachmentPreference',
  'groomingTolerance',
  'noiseTolerance',
  'chaosTolerance',
  'aloneHours',
  'sensitivityTolerance',
  'independencePreference',
] as const;

type SuitableScoringTraitKey = (typeof suitableScoringTraitKeys)[number];
type ProfileTraitKey = Exclude<keyof DogLifestyleProfile, 'breedId'>;

const profileTraitByUserTrait: Record<SuitableScoringTraitKey, ProfileTraitKey> = {
  activityCapacity: 'activityNeed',
  trainingCommitment: 'trainingNeed',
  socialPreference: 'sociability',
  attachmentPreference: 'attachment',
  groomingTolerance: 'groomingNeed',
  noiseTolerance: 'vocality',
  chaosTolerance: 'chaosPotential',
  aloneHours: 'aloneToleranceHours',
  sensitivityTolerance: 'sensitivity',
  independencePreference: 'independence',
};

export type SuitablePenaltyCode =
  | 'ACTIVITY_SHORTFALL'
  | 'ALONE_TIME_SHORTFALL'
  | 'GROOMING_SHORTFALL'
  | 'TRAINING_SHORTFALL';

type SuitableScoringInput = {
  answers: Record<string, string>;
  questions: SuitableQuestion[];
  profiles: DogLifestyleProfile[];
};

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));

export const scoreSuitableAnswers = ({ answers, questions, profiles }: SuitableScoringInput) => {
  const questionIds = new Set(questions.map((question) => question.id));
  Object.keys(answers).forEach((id) => {
    if (!questionIds.has(id as `S${number}`)) throw new Error(`Unknown question id: ${id}`);
  });

  const totals = Object.fromEntries(suitableScoringTraitKeys.map((key) => [key, 0])) as SuitableTraitVector;
  for (const question of questions) {
    const optionId = answers[question.id];
    if (!optionId) return { status: 'incomplete' as const };
    const option = question.options.find((item) => item.id === optionId);
    if (!option) throw new Error(`Unknown option id: ${optionId}`);
    suitableScoringTraitKeys.forEach((key) => { totals[key] += option.vector[key] ?? 0; });
  }

  const answerStats = Object.fromEntries(suitableScoringTraitKeys.map((key) => {
    let expectedTotal = 0;
    let totalVariance = 0;
    let theoreticalMinimum = 0;
    let theoreticalMaximum = 0;
    for (const question of questions) {
      const values = question.options.map((option) => option.vector[key] ?? 0);
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      expectedTotal += mean;
      totalVariance += values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
      theoreticalMinimum += Math.min(...values);
      theoreticalMaximum += Math.max(...values);
    }
    return [key, {
      expectedTotal,
      standardDeviation: Math.max(1, Math.sqrt(totalVariance)),
      theoreticalMinimum,
      theoreticalMaximum,
    }];
  })) as Record<SuitableScoringTraitKey, {
    expectedTotal: number;
    standardDeviation: number;
    theoreticalMinimum: number;
    theoreticalMaximum: number;
  }>;

  const weightedUserVector = Object.fromEntries(suitableScoringTraitKeys.map((key) => [
    key,
    (totals[key] - answerStats[key].expectedTotal) / answerStats[key].standardDeviation,
  ])) as SuitableTraitVector;

  const normalized = Object.fromEntries(suitableScoringTraitKeys.map((key) => {
    if (key === 'aloneHours') return [key, totals[key]];
    const { expectedTotal, theoreticalMinimum, theoreticalMaximum } = answerStats[key];
    const value = totals[key];
    const result = value >= expectedTotal
      ? 5 + (5 * (value - expectedTotal)) / Math.max(1, theoreticalMaximum - expectedTotal)
      : (5 * (value - theoreticalMinimum)) / Math.max(1, expectedTotal - theoreticalMinimum);
    return [key, clamp(result, 0, 10)];
  })) as SuitableTraitVector;

  const profileMeans = Object.fromEntries(suitableScoringTraitKeys.map((key) => {
    const profileKey = profileTraitByUserTrait[key];
    return [key, profiles.reduce((sum, profile) => sum + profile[profileKey], 0) / profiles.length];
  })) as SuitableTraitVector;
  const userMagnitude = Math.sqrt(suitableScoringTraitKeys.reduce((sum, key) => sum + (weightedUserVector[key] ** 2), 0));

  const breedOrder = profiles.map((profile) => profile.breedId);
  const ranked = profiles.map((profile) => {
    const centeredProfile = Object.fromEntries(suitableScoringTraitKeys.map((key) => {
      const profileKey = profileTraitByUserTrait[key];
      return [key, profile[profileKey] - profileMeans[key]];
    })) as SuitableTraitVector;
    const profileMagnitude = Math.sqrt(suitableScoringTraitKeys.reduce((sum, key) => sum + (centeredProfile[key] ** 2), 0));
    const dotProduct = suitableScoringTraitKeys.reduce((sum, key) => sum + (weightedUserVector[key] * centeredProfile[key]), 0);
    const cosineSimilarity = dotProduct / Math.max(1e-9, userMagnitude * profileMagnitude);
    const baseScore = clamp((cosineSimilarity + 1) * 50, 0, 100);

    const penalties: Array<{ code: SuitablePenaltyCode; amount: number }> = [];
    if (profile.activityNeed - normalized.activityCapacity >= 4) penalties.push({ code: 'ACTIVITY_SHORTFALL', amount: 30 });
    if (normalized.aloneHours - profile.aloneToleranceHours >= 3) penalties.push({ code: 'ALONE_TIME_SHORTFALL', amount: 60 });
    if (profile.groomingNeed - normalized.groomingTolerance >= 5) penalties.push({ code: 'GROOMING_SHORTFALL', amount: 20 });
    if (profile.trainingNeed - normalized.trainingCommitment >= 5) penalties.push({ code: 'TRAINING_SHORTFALL', amount: 20 });
    const penaltyTotal = penalties.reduce((sum, penalty) => sum + penalty.amount, 0);

    return {
      profile,
      score: clamp(baseScore - penaltyTotal, 0, 100),
      baseScore,
      penaltyTotal,
      penalties,
    };
  }).sort((left, right) => right.score - left.score || breedOrder.indexOf(left.profile.breedId) - breedOrder.indexOf(right.profile.breedId));

  return { status: 'done' as const, totals, userVector: normalized, weightedUserVector, ranked };
};
