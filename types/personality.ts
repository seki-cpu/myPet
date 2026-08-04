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
