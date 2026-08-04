import type { BreedResult, TraitKey, TraitVector } from '@/types/personality';
import { breedResults } from '@/data/breedResults.v1';
import { quizQuestions } from '@/data/quiz.v1';

const traitKeys: TraitKey[] = ['sociability', 'energy', 'independence', 'loyalty', 'curiosity', 'expression', 'planning', 'chaos'];
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
  const userVector: TraitVector = {
    sociability: 0,
    energy: 0,
    independence: 0,
    loyalty: 0,
    curiosity: 0,
    expression: 0,
    planning: 0,
    chaos: 0,
  };

  let currentQuestionCount = 0;

  for (const question of quizQuestions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const selectedOption = question.options.find((option) => option.id === optionId);
    if (!selectedOption) throw new Error(`Unknown option id: ${optionId}`);
    currentQuestionCount += 1;
    traitKeys.forEach((key) => {
      userVector[key] += selectedOption.vector[key];
    });
  }

  if (currentQuestionCount < quizQuestions.length) {
    return { status: 'incomplete' as const };
  }

  const maxPossible = quizQuestions.reduce((sum, question) => {
    const eachMax = question.options.reduce((max, option) => Math.max(max, option.vector.sociability + option.vector.energy + option.vector.independence + option.vector.loyalty + option.vector.curiosity + option.vector.expression + option.vector.planning + option.vector.chaos), 0);
    return sum + eachMax;
  }, 0);

  const normalized = traitKeys.reduce((acc, key) => {
    const sum = userVector[key];
    const possibleMax = quizQuestions.reduce((total, question) => {
      return total + Math.max(...question.options.map((option) => option.vector[key]));
    }, 0);
    acc[key] = Math.round((sum / possibleMax) * 100);
    return acc;
  }, {} as TraitVector);

  const distances = breedResults.map((breed) => {
    const distance = Math.sqrt(
      traitKeys.reduce((sum, key) => sum + Math.pow(normalized[key] - breed.prototype[key], 2), 0)
    );
    return { breed, distance };
  }).sort((a, b) => a.distance - b.distance);

  const primary = distances[0];
  const secondary = distances.find((item) => item.breed.id !== primary.breed.id) ?? distances[1];

  return {
    status: 'done' as const,
    userVector: normalized,
    primaryBreed: primary.breed,
    secondaryBreed: secondary?.breed,
    primaryDistance: primary.distance,
    secondaryDistance: secondary?.distance ?? primary.distance,
  };
};

export const getBreedById = (id: string) => breedResults.find((breed) => breed.id === id) ?? breedResults[0];
export const breedMap = Object.fromEntries(breedResults.map((breed) => [breed.id, breed]));
export const isResultRouteValid = (breedId: string) => breedOrder.includes(breedId as (typeof breedOrder)[number]);
