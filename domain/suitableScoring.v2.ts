import { suitableBreedProfilesV2 } from '@/data/suitableBreedProfiles.v2';
import { suitableQuestionsV2 } from '@/data/suitableQuestions.v2';
import { scoreSuitableAnswers } from '@/domain/suitableScoringModel';

export const computeSuitableResultV2 = (answers: Record<string, string>) => {
  const result = scoreSuitableAnswers({ answers, questions: suitableQuestionsV2, profiles: suitableBreedProfilesV2 });
  if (result.status === 'incomplete') return result;
  const primary = result.ranked[0];
  const secondary = result.ranked[1];
  const tertiary = result.ranked[2];
  if (!primary || !secondary || !tertiary) throw new Error('Suitable breed profiles are incomplete');
  return {
    status: 'done' as const,
    userVector: result.userVector,
    primaryBreedId: primary.profile.breedId,
    secondaryBreedId: secondary.profile.breedId,
    rankedBreeds: result.ranked.slice(0, 3).map((item) => ({ breedId: item.profile.breedId, score: Math.round(item.score) })),
    primaryProfile: primary.profile,
    secondaryProfile: secondary.profile,
  };
};
