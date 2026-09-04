import { suitableBreedProfilesV2 } from '@/data/suitableBreedProfiles.v2';
import { suitableQuestionsV2 } from '@/data/suitableQuestions.v2';
import type { SuitableTraitKey, SuitableTraitVector } from '@/types/personality';

const traitKeys: SuitableTraitKey[] = ['activityCapacity', 'trainingCommitment', 'socialPreference', 'attachmentPreference', 'groomingTolerance', 'noiseTolerance', 'chaosTolerance', 'aloneHours', 'sensitivityTolerance', 'independencePreference'];
const preferencePairs: Array<[SuitableTraitKey, 'sociability' | 'attachment' | 'vocality' | 'chaosPotential' | 'sensitivity' | 'independence']> = [['socialPreference', 'sociability'], ['attachmentPreference', 'attachment'], ['noiseTolerance', 'vocality'], ['chaosTolerance', 'chaosPotential'], ['sensitivityTolerance', 'sensitivity'], ['independencePreference', 'independence']];
const breedOrder = suitableBreedProfilesV2.map((profile) => profile.breedId);

export const computeSuitableResultV2 = (answers: Record<string, string>) => {
  const questionIds = new Set(suitableQuestionsV2.map((question) => question.id));
  Object.keys(answers).forEach((id) => { if (!questionIds.has(id as `S${number}`)) throw new Error(`Unknown question id: ${id}`); });
  const raw = traitKeys.reduce((result, key) => { result[key] = 0; return result; }, {} as SuitableTraitVector);
  for (const question of suitableQuestionsV2) {
    const optionId = answers[question.id];
    if (!optionId) return { status: 'incomplete' as const };
    const option = question.options.find((item) => item.id === optionId);
    if (!option) throw new Error(`Unknown option id: ${optionId}`);
    traitKeys.forEach((key) => { raw[key] += option.vector[key] ?? 0; });
  }
  const normalized = traitKeys.reduce((result, key) => {
    if (key === 'aloneHours') { result[key] = raw[key]; return result; }
    const minimum = suitableQuestionsV2.reduce((sum, question) => sum + Math.min(...question.options.map((option) => option.vector[key] ?? 0)), 0);
    const maximum = suitableQuestionsV2.reduce((sum, question) => sum + Math.max(...question.options.map((option) => option.vector[key] ?? 0)), 0);
    result[key] = Math.max(0, Math.min(10, ((raw[key] - minimum) / Math.max(1, maximum - minimum)) * 10));
    return result;
  }, {} as SuitableTraitVector);
  const ranked = suitableBreedProfilesV2.map((profile) => {
    const activityFit = Math.max(0, 10 - Math.max(0, profile.activityNeed - normalized.activityCapacity) * 2);
    const groomingFit = Math.max(0, 10 - Math.max(0, profile.groomingNeed - normalized.groomingTolerance) * 2);
    const aloneFit = normalized.aloneHours <= profile.aloneToleranceHours ? 10 : Math.max(0, 10 - (normalized.aloneHours - profile.aloneToleranceHours) * 2);
    const lifestyleScore = ((activityFit + groomingFit + aloneFit) / 3) * 10;
    const preferenceScore = preferencePairs.reduce((sum, [userKey, dogKey]) => sum + (10 - Math.abs(normalized[userKey] - profile[dogKey])), 0) / preferencePairs.length * 10;
    const trainingFit = Math.max(0, 10 - Math.max(0, profile.trainingNeed - normalized.trainingCommitment) * 2);
    const trainingScore = trainingFit * 10;
    let penalties = 0;
    if (profile.activityNeed - normalized.activityCapacity >= 4) penalties += 20;
    if (normalized.aloneHours - profile.aloneToleranceHours >= 3) penalties += 25;
    if (profile.groomingNeed - normalized.groomingTolerance >= 5) penalties += 15;
    if (profile.trainingNeed - normalized.trainingCommitment >= 5) penalties += 15;
    const score = Math.max(0, Math.min(100, lifestyleScore * 0.5 + preferenceScore * 0.35 + trainingScore * 0.15 - penalties));
    return { profile, score };
  }).sort((a, b) => b.score - a.score || breedOrder.indexOf(a.profile.breedId) - breedOrder.indexOf(b.profile.breedId));
  const primary = ranked[0];
  const secondary = ranked[1];
  const tertiary = ranked[2];
  if (!primary || !secondary || !tertiary) throw new Error('Suitable breed profiles are incomplete');
  return { status: 'done' as const, userVector: normalized, primaryBreedId: primary.profile.breedId, secondaryBreedId: secondary.profile.breedId, rankedBreeds: ranked.slice(0, 3).map((item) => ({ breedId: item.profile.breedId, score: Math.round(item.score) })), primaryProfile: primary.profile, secondaryProfile: secondary.profile };
};