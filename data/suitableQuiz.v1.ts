import type { SuitableQuestion, SuitableTraitKey, SuitableTraitVector } from '@/types/personality';

const traitKeys: SuitableTraitKey[] = [
  'activityCapacity',
  'companionshipNeed',
  'socialPreference',
  'trainingEngagement',
  'patience',
  'independenceFit',
  'groomingTolerance',
  'noiseTolerance',
  'aloneTimeFit',
];

const vector = (values: Partial<Record<SuitableTraitKey, number>>): SuitableTraitVector => {
  return traitKeys.reduce((result, key) => {
    result[key] = values[key] ?? 0;
    return result;
  }, {} as SuitableTraitVector);
};

export const suitableQuestions: SuitableQuestion[] = [
  { id: 'S1', options: [{ id: 'A', vector: vector({ activityCapacity: 15, independenceFit: 85, aloneTimeFit: 80 }) }, { id: 'B', vector: vector({ activityCapacity: 35, independenceFit: 60, aloneTimeFit: 65 }) }, { id: 'C', vector: vector({ activityCapacity: 75, companionshipNeed: 60, aloneTimeFit: 35 }) }, { id: 'D', vector: vector({ activityCapacity: 95, companionshipNeed: 75, trainingEngagement: 55, aloneTimeFit: 20 }) }] },
  { id: 'S2', options: [{ id: 'A', vector: vector({ activityCapacity: 15, companionshipNeed: 25, aloneTimeFit: 85 }) }, { id: 'B', vector: vector({ activityCapacity: 35, companionshipNeed: 45, aloneTimeFit: 65 }) }, { id: 'C', vector: vector({ activityCapacity: 70, companionshipNeed: 70, aloneTimeFit: 35 }) }, { id: 'D', vector: vector({ activityCapacity: 95, companionshipNeed: 90, trainingEngagement: 85, aloneTimeFit: 15 }) }] },
  { id: 'S3', options: [{ id: 'A', vector: vector({ companionshipNeed: 20, independenceFit: 90, aloneTimeFit: 85 }) }, { id: 'B', vector: vector({ companionshipNeed: 45, independenceFit: 65, aloneTimeFit: 65 }) }, { id: 'C', vector: vector({ companionshipNeed: 75, socialPreference: 65, aloneTimeFit: 35 }) }, { id: 'D', vector: vector({ companionshipNeed: 95, socialPreference: 80, aloneTimeFit: 15 }) }] },
  { id: 'S4', options: [{ id: 'A', vector: vector({ socialPreference: 20, noiseTolerance: 25, independenceFit: 75 }) }, { id: 'B', vector: vector({ socialPreference: 40, noiseTolerance: 45, independenceFit: 60 }) }, { id: 'C', vector: vector({ socialPreference: 70, noiseTolerance: 70, companionshipNeed: 65 }) }, { id: 'D', vector: vector({ socialPreference: 95, noiseTolerance: 90, companionshipNeed: 80 }) }] },
  { id: 'S5', options: [{ id: 'A', vector: vector({ patience: 15, trainingEngagement: 15, independenceFit: 70 }) }, { id: 'B', vector: vector({ patience: 40, trainingEngagement: 35, independenceFit: 55 }) }, { id: 'C', vector: vector({ patience: 75, trainingEngagement: 70, companionshipNeed: 60 }) }, { id: 'D', vector: vector({ patience: 95, trainingEngagement: 95, companionshipNeed: 75 }) }] },
  { id: 'S6', options: [{ id: 'A', vector: vector({ activityCapacity: 25, companionshipNeed: 45, noiseTolerance: 30, independenceFit: 65 }) }, { id: 'B', vector: vector({ companionshipNeed: 90, socialPreference: 70, noiseTolerance: 65 }) }, { id: 'C', vector: vector({ trainingEngagement: 80, patience: 70, independenceFit: 55 }) }, { id: 'D', vector: vector({ activityCapacity: 85, socialPreference: 75, noiseTolerance: 85, trainingEngagement: 65 }) }] },
  { id: 'S7', options: [{ id: 'A', vector: vector({ groomingTolerance: 15 }) }, { id: 'B', vector: vector({ groomingTolerance: 40 }) }, { id: 'C', vector: vector({ groomingTolerance: 70 }) }, { id: 'D', vector: vector({ groomingTolerance: 95 }) }] },
  { id: 'S8', options: [{ id: 'A', vector: vector({ noiseTolerance: 15, patience: 55 }) }, { id: 'B', vector: vector({ noiseTolerance: 40, patience: 65 }) }, { id: 'C', vector: vector({ noiseTolerance: 70, activityCapacity: 65, trainingEngagement: 70 }) }, { id: 'D', vector: vector({ noiseTolerance: 95, activityCapacity: 75, patience: 80 }) }] },
  { id: 'S9', options: [{ id: 'A', vector: vector({ aloneTimeFit: 15, companionshipNeed: 90 }) }, { id: 'B', vector: vector({ aloneTimeFit: 40, companionshipNeed: 70 }) }, { id: 'C', vector: vector({ aloneTimeFit: 65, companionshipNeed: 45 }) }, { id: 'D', vector: vector({ aloneTimeFit: 95, companionshipNeed: 20 }) }] },
  { id: 'S10', options: [{ id: 'A', vector: vector({ trainingEngagement: 25, patience: 40, independenceFit: 70 }) }, { id: 'B', vector: vector({ companionshipNeed: 75, patience: 75, trainingEngagement: 55 }) }, { id: 'C', vector: vector({ trainingEngagement: 85, patience: 80, noiseTolerance: 60 }) }, { id: 'D', vector: vector({ activityCapacity: 85, trainingEngagement: 95, patience: 95, companionshipNeed: 85 }) }] },
];