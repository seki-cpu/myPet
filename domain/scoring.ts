import type { BreedResult, PersonalityTraitKey, PersonalityTraitVector } from '@/types/personality';
import { breedResults } from '@/data/breedResults.v1';
import { personalityQuestions } from '@/data/personalityQuestions.v2';

const traitKeys: PersonalityTraitKey[] = ['extraversion', 'independence', 'warmth', 'conscientiousness', 'curiosity', 'sensitivity', 'stubbornness', 'spontaneity', 'confidence', 'loyalty'];
const personalityProfiles: Record<string, PersonalityTraitVector> = {
  'golden-retriever': { extraversion: 8, independence: 3, warmth: 10, conscientiousness: 6, curiosity: 6, sensitivity: 5, stubbornness: 2, spontaneity: 5, confidence: 7, loyalty: 10 },
  labrador: { extraversion: 9, independence: 3, warmth: 9, conscientiousness: 5, curiosity: 8, sensitivity: 4, stubbornness: 2, spontaneity: 8, confidence: 8, loyalty: 9 },
  poodle: { extraversion: 6, independence: 6, warmth: 6, conscientiousness: 9, curiosity: 9, sensitivity: 6, stubbornness: 5, spontaneity: 3, confidence: 7, loyalty: 7 },
  'border-collie': { extraversion: 5, independence: 5, warmth: 6, conscientiousness: 10, curiosity: 10, sensitivity: 6, stubbornness: 5, spontaneity: 2, confidence: 7, loyalty: 9 },
  'shiba-inu': { extraversion: 3, independence: 10, warmth: 5, conscientiousness: 6, curiosity: 6, sensitivity: 5, stubbornness: 9, spontaneity: 3, confidence: 8, loyalty: 8 },
  husky: { extraversion: 8, independence: 9, warmth: 7, conscientiousness: 2, curiosity: 10, sensitivity: 5, stubbornness: 7, spontaneity: 10, confidence: 8, loyalty: 5 },
  samoyed: { extraversion: 9, independence: 4, warmth: 9, conscientiousness: 4, curiosity: 6, sensitivity: 6, stubbornness: 3, spontaneity: 7, confidence: 7, loyalty: 8 },
  'german-shepherd': { extraversion: 4, independence: 6, warmth: 7, conscientiousness: 10, curiosity: 6, sensitivity: 5, stubbornness: 5, spontaneity: 2, confidence: 9, loyalty: 10 },
  greyhound: { extraversion: 3, independence: 7, warmth: 5, conscientiousness: 5, curiosity: 4, sensitivity: 8, stubbornness: 3, spontaneity: 4, confidence: 5, loyalty: 7 },
  corgi: { extraversion: 8, independence: 7, warmth: 8, conscientiousness: 7, curiosity: 8, sensitivity: 5, stubbornness: 6, spontaneity: 7, confidence: 8, loyalty: 8 },
  beagle: { extraversion: 8, independence: 7, warmth: 7, conscientiousness: 3, curiosity: 10, sensitivity: 5, stubbornness: 6, spontaneity: 9, confidence: 7, loyalty: 6 },
  'french-bulldog': { extraversion: 6, independence: 5, warmth: 8, conscientiousness: 3, curiosity: 4, sensitivity: 6, stubbornness: 5, spontaneity: 4, confidence: 6, loyalty: 8 },
};
const breedOrder = [
  'golden-retriever',
  'labrador',
  'poodle',
  'border-collie',
  'shiba-inu',
  'husky',
  'samoyed',
  'german-shepherd',
  'greyhound',
  'corgi',
  'beagle',
  'french-bulldog',
] as const;

export const computeResult = (answers: Record<string, string>) => {
  const userVector = traitKeys.reduce((result, key) => { result[key] = 0; return result; }, {} as PersonalityTraitVector);

  let currentQuestionCount = 0;

  for (const question of personalityQuestions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const selectedOption = question.options.find((option) => option.id === optionId);
    if (!selectedOption) throw new Error(`Unknown option id: ${optionId}`);
    currentQuestionCount += 1;
    traitKeys.forEach((key) => {
      userVector[key] += selectedOption.vector[key] ?? 0;
    });
  }

  if (currentQuestionCount < personalityQuestions.length) {
    return { status: 'incomplete' as const };
  }

  const normalized = traitKeys.reduce((acc, key) => {
    const sum = userVector[key];
    const possibleValues = personalityQuestions.flatMap((question) => question.options.map((option) => option.vector[key] ?? 0));
    const theoreticalMin = personalityQuestions.reduce((total, question) => total + Math.min(...question.options.map((option) => option.vector[key] ?? 0)), 0);
    const possibleMax = personalityQuestions.reduce((total, question) => total + Math.max(...question.options.map((option) => option.vector[key] ?? 0)), 0);
    acc[key] = Math.max(0, Math.min(10, ((sum - theoreticalMin) / Math.max(1, possibleMax - theoreticalMin)) * 10));
    return acc;
  }, {} as PersonalityTraitVector);

  const distances = breedResults.map((breed) => {
    const profile = personalityProfiles[breed.id];
    const distance = traitKeys.reduce((sum, key) => sum + Math.abs(normalized[key] - profile[key]), 0);
    return { breed, distance, similarity: Math.max(0, 100 - distance) };
  }).sort((a, b) => a.distance - b.distance || breedOrder.indexOf(a.breed.id as (typeof breedOrder)[number]) - breedOrder.indexOf(b.breed.id as (typeof breedOrder)[number]));

  const primary = distances[0];
  const secondary = distances[1];
  const primaryWeight = primary.similarity / Math.max(1, primary.similarity + secondary.similarity);
  const keywordOrder = [...traitKeys].sort((a, b) => normalized[b] - normalized[a]);

  return {
    status: 'done' as const,
    userVector: normalized,
    primaryBreed: primary.breed,
    secondaryBreed: secondary.breed,
    rankedBreeds: distances.slice(0, 3).map((item) => ({ breed: item.breed, score: item.similarity })),
    primarySimilarity: primary.similarity,
    secondarySimilarity: secondary.similarity,
    primaryWeight,
    secondaryWeight: 1 - primaryWeight,
    keywords: keywordOrder.slice(0, 5),
  };
};

export const getBreedById = (id: string) => breedResults.find((breed) => breed.id === id) ?? breedResults[0];
export const breedMap = Object.fromEntries(breedResults.map((breed) => [breed.id, breed]));
export const isResultRouteValid = (breedId: string) => breedOrder.includes(breedId as (typeof breedOrder)[number]);
