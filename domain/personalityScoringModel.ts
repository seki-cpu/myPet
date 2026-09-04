import type { BreedResult, PersonalityQuestion, PersonalityTraitKey, PersonalityTraitVector } from '@/types/personality';

type ScoringInput = {
  answers: Record<string, string>;
  questions: PersonalityQuestion[];
  breeds: BreedResult[];
  profiles: Record<string, PersonalityTraitVector>;
  traitKeys: PersonalityTraitKey[];
  breedOrder: readonly string[];
};

const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));

export const scorePersonalityAnswers = ({ answers, questions, breeds, profiles, traitKeys, breedOrder }: ScoringInput) => {
  const totals = Object.fromEntries(traitKeys.map((key) => [key, 0])) as PersonalityTraitVector;

  for (const question of questions) {
    const optionId = answers[question.id];
    if (!optionId) return { status: 'incomplete' as const };
    const selectedOption = question.options.find((option) => option.id === optionId);
    if (!selectedOption) throw new Error(`Unknown option id: ${optionId}`);
    traitKeys.forEach((key) => { totals[key] += selectedOption.vector[key] ?? 0; });
  }

  // Each trait gets a neutral baseline and an automatic inverse-variance weight.
  // This prevents frequently mentioned traits from overpowering sparsely covered ones.
  const answerStats = Object.fromEntries(traitKeys.map((key) => {
    let expectedTotal = 0;
    let totalVariance = 0;
    let theoreticalMin = 0;
    let theoreticalMax = 0;

    for (const question of questions) {
      const values = question.options.map((option) => option.vector[key] ?? 0);
      const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
      expectedTotal += mean;
      totalVariance += values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
      theoreticalMin += Math.min(...values);
      theoreticalMax += Math.max(...values);
    }

    return [key, { expectedTotal, standardDeviation: Math.max(1, Math.sqrt(totalVariance)), theoreticalMin, theoreticalMax }];
  })) as Record<PersonalityTraitKey, { expectedTotal: number; standardDeviation: number; theoreticalMin: number; theoreticalMax: number }>;

  const weightedAnswerVector = Object.fromEntries(traitKeys.map((key) => [
    key,
    (totals[key] - answerStats[key].expectedTotal) / answerStats[key].standardDeviation,
  ])) as PersonalityTraitVector;

  const profileMeans = Object.fromEntries(traitKeys.map((key) => [
    key,
    breeds.reduce((sum, breed) => sum + profiles[breed.id][key], 0) / breeds.length,
  ])) as PersonalityTraitVector;

  const answerMagnitude = Math.sqrt(traitKeys.reduce((sum, key) => sum + (weightedAnswerVector[key] ** 2), 0));
  const ranked = breeds.map((breed) => {
    const centeredProfile = Object.fromEntries(traitKeys.map((key) => [key, profiles[breed.id][key] - profileMeans[key]])) as PersonalityTraitVector;
    const profileMagnitude = Math.sqrt(traitKeys.reduce((sum, key) => sum + (centeredProfile[key] ** 2), 0));
    const dotProduct = traitKeys.reduce((sum, key) => sum + (weightedAnswerVector[key] * centeredProfile[key]), 0);
    const cosineSimilarity = dotProduct / Math.max(1e-9, answerMagnitude * profileMagnitude);
    return { breed, similarity: clamp((cosineSimilarity + 1) * 50, 0, 100) };
  }).sort((a, b) => b.similarity - a.similarity || breedOrder.indexOf(a.breed.id) - breedOrder.indexOf(b.breed.id));

  // Keep a 0-10 vector for result display while centering a random answer at 5.
  const displayVector = Object.fromEntries(traitKeys.map((key) => {
    const { expectedTotal, theoreticalMin, theoreticalMax } = answerStats[key];
    const value = totals[key];
    const normalized = value >= expectedTotal
      ? 5 + (5 * (value - expectedTotal)) / Math.max(1, theoreticalMax - expectedTotal)
      : (5 * (value - theoreticalMin)) / Math.max(1, expectedTotal - theoreticalMin);
    return [key, clamp(normalized, 0, 10)];
  })) as PersonalityTraitVector;

  return { status: 'done' as const, totals, displayVector, weightedAnswerVector, ranked };
};
