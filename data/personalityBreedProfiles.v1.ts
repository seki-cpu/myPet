import type { PersonalityTraitKey, PersonalityTraitVector } from '@/types/personality';

export const personalityTraitKeys: PersonalityTraitKey[] = [
  'extraversion',
  'independence',
  'warmth',
  'conscientiousness',
  'curiosity',
  'sensitivity',
  'stubbornness',
  'spontaneity',
  'confidence',
  'loyalty',
];

export const personalityProfiles: Record<string, PersonalityTraitVector> = {
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

export const personalityBreedOrder = [
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
