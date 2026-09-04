import { breedResults } from '@/data/breedResults.v1';
import { personalityQuestions } from '@/data/personalityQuestions.v2';
import { personalityBreedOrder, personalityProfiles, personalityTraitKeys } from '@/data/personalityBreedProfiles.v1';
import { scorePersonalityAnswers } from '@/domain/personalityScoringModel';

export const computeResult = (answers: Record<string, string>) => {
  const scored = scorePersonalityAnswers({
    answers,
    questions: personalityQuestions,
    breeds: breedResults,
    profiles: personalityProfiles,
    traitKeys: personalityTraitKeys,
    breedOrder: personalityBreedOrder,
  });
  if (scored.status === 'incomplete') return scored;

  const primary = scored.ranked[0];
  const secondary = scored.ranked[1];
  const primaryWeight = primary.similarity / Math.max(1, primary.similarity + secondary.similarity);
  const keywordOrder = [...personalityTraitKeys].sort((a, b) => scored.weightedAnswerVector[b] - scored.weightedAnswerVector[a]);

  return {
    status: 'done' as const,
    userVector: scored.displayVector,
    primaryBreed: primary.breed,
    secondaryBreed: secondary.breed,
    rankedBreeds: scored.ranked.slice(0, 3).map((item) => ({ breed: item.breed, score: item.similarity })),
    primarySimilarity: primary.similarity,
    secondarySimilarity: secondary.similarity,
    primaryWeight,
    secondaryWeight: 1 - primaryWeight,
    keywords: keywordOrder.slice(0, 5),
  };
};

export const getBreedById = (id: string) => breedResults.find((breed) => breed.id === id) ?? breedResults[0];
export const breedMap = Object.fromEntries(breedResults.map((breed) => [breed.id, breed]));
export const isResultRouteValid = (breedId: string) => personalityBreedOrder.includes(breedId as (typeof personalityBreedOrder)[number]);
