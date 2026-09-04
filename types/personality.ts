export type TraitKey =
  | 'sociability'
  | 'energy'
  | 'independence'
  | 'loyalty'
  | 'curiosity'
  | 'expression'
  | 'planning'
  | 'chaos';

export type TraitVector = Record<TraitKey, number>;

export type QuizOption = {
  id: string;
  text: string;
  vector: TraitVector;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
};

export type PersonalityTraitKey =
  | 'extraversion'
  | 'independence'
  | 'warmth'
  | 'conscientiousness'
  | 'curiosity'
  | 'sensitivity'
  | 'stubbornness'
  | 'spontaneity'
  | 'confidence'
  | 'loyalty';

export type PersonalityTraitVector = Record<PersonalityTraitKey, number>;

export type PersonalityQuestion = {
  id: `q${number}`;
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; vector: Partial<PersonalityTraitVector> }>;
};

export type BreedResult = {
  id: string;
  name: string;
  imagePath: string;
  prototype: TraitVector;
  tags: [string, string, string];
  summary: string;
  cuteFlaw: string;
  shareText: string;
};

export type QuizType = 'personality' | 'suitable';

export type SuitableTraitKey =
  | 'activityCapacity'
  | 'trainingCommitment'
  | 'socialPreference'
  | 'attachmentPreference'
  | 'groomingTolerance'
  | 'noiseTolerance'
  | 'chaosTolerance'
  | 'aloneHours'
  | 'sensitivityTolerance'
  | 'independencePreference'
  | 'companionshipNeed'
  | 'trainingEngagement'
  | 'patience'
  | 'independenceFit'
  | 'aloneTimeFit';

export type LegacySuitableTraitKey =
  | 'companionshipNeed'
  | 'trainingEngagement'
  | 'patience'
  | 'independenceFit'
  | 'aloneTimeFit';

export type SuitableTraitVector = Record<string, number>;

export type SuitableQuestion = {
  id: `S${number}`;
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; vector: Partial<SuitableTraitVector> }>;
};

export type DogLifestyleProfile = {
  breedId: BreedResult['id'];
  activityNeed: number;
  trainingNeed: number;
  sociability: number;
  attachment: number;
  groomingNeed: number;
  vocality: number;
  chaosPotential: number;
  aloneToleranceHours: number;
  sensitivity: number;
  independence: number;
};

export type DogPersonalityProfile = {
  breedId: BreedResult['id'];
  traits: PersonalityTraitVector;
};

export type SuitableBreedProfile = {
  breedId: BreedResult['id'];
  traits: SuitableTraitVector;
  cautions: string[];
};
