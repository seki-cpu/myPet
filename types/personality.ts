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
  | 'companionshipNeed'
  | 'socialPreference'
  | 'trainingEngagement'
  | 'patience'
  | 'independenceFit'
  | 'groomingTolerance'
  | 'noiseTolerance'
  | 'aloneTimeFit';

export type SuitableTraitVector = Record<SuitableTraitKey, number>;

export type SuitableQuestion = {
  id: `S${number}`;
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; vector: Partial<SuitableTraitVector> }>;
};

export type SuitableBreedProfile = {
  breedId: BreedResult['id'];
  traits: SuitableTraitVector;
  cautions: string[];
};
