import { suitableBreedProfiles } from '@/data/suitableBreedProfiles.v1';
import { suitableQuestions } from '@/data/suitableQuiz.v1';
import type { SuitableTraitKey, SuitableTraitVector } from '@/types/personality';

const traitKeys: SuitableTraitKey[] = ['activityCapacity', 'companionshipNeed', 'socialPreference', 'trainingEngagement', 'patience', 'independenceFit', 'groomingTolerance', 'noiseTolerance', 'aloneTimeFit'];
const weights: Record<SuitableTraitKey, number> = { activityCapacity: 3, companionshipNeed: 1.5, socialPreference: 1, trainingEngagement: 3, patience: 2.5, independenceFit: 1.5, groomingTolerance: 3, noiseTolerance: 1.5, aloneTimeFit: 3 };
const breedOrder = suitableBreedProfiles.map((profile) => profile.breedId);

export const computeSuitableResult = (answers: Record<string, string>) => {
  const questionIds = new Set(suitableQuestions.map((question) => question.id));
  for (const questionId of Object.keys(answers)) {
    if (!questionIds.has(questionId as never)) throw new Error(`Unknown question id: ${questionId}`);
  }

  const userVector = traitKeys.reduce((result, key) => {
    result[key] = 0;
    return result;
  }, {} as SuitableTraitVector);

  for (const question of suitableQuestions) {
    const optionId = answers[question.id];
    if (!optionId) return { status: 'incomplete' as const };
    const option = question.options.find((item) => item.id === optionId);
    if (!option) throw new Error(`Unknown option id: ${optionId}`);
    traitKeys.forEach((key) => { userVector[key] += option.vector[key] ?? 0; });
  }

  const normalized = traitKeys.reduce((result, key) => {
    const maximum = suitableQuestions.reduce((sum, question) => sum + Math.max(...question.options.map((option) => option.vector[key] ?? 0)), 0);
    result[key] = Math.round((userVector[key] / maximum) * 100);
    return result;
  }, {} as SuitableTraitVector);

  const ranked = suitableBreedProfiles.map((profile) => {
    const distance = Math.sqrt(traitKeys.reduce((sum, key) => sum + weights[key] * Math.pow(normalized[key] - profile.traits[key], 2), 0));
    const hardMismatch = (normalized.activityCapacity < 35 && profile.traits.activityCapacity > 80)
      || (normalized.trainingEngagement < 30 && profile.traits.trainingEngagement > 80)
      || (normalized.groomingTolerance < 30 && profile.traits.groomingTolerance > 80)
      || (normalized.aloneTimeFit > 75 && profile.traits.aloneTimeFit < 30);
    return { profile, distance: distance + (hardMismatch ? 10000 : 0), hardMismatch };
  }).sort((a, b) => a.distance - b.distance || breedOrder.indexOf(a.profile.breedId) - breedOrder.indexOf(b.profile.breedId));

  const primary = ranked[0];
  const secondary = ranked.find((item) => item.profile.breedId !== primary.profile.breedId);
  if (!primary || !secondary) throw new Error('Suitable breed profiles are incomplete');
  return { status: 'done' as const, userVector: normalized, primaryBreedId: primary.profile.breedId, secondaryBreedId: secondary.profile.breedId, primaryProfile: primary.profile, secondaryProfile: secondary.profile, primaryDistance: primary.distance, secondaryDistance: secondary.distance };
};