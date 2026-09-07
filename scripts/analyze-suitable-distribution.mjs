import { suitableBreedProfilesV2 } from '../data/suitableBreedProfiles.v2.ts';
import { suitableQuestionsV2 } from '../data/suitableQuestions.v2.ts';
import { scoreSuitableAnswers, suitableScoringTraitKeys } from '../domain/suitableScoringModel.ts';

const DEFAULT_SAMPLE_COUNT = 100_000;
const MAX_PRIMARY_SHARE = 16;
const MIN_PRIMARY_SHARE = 3;
const SEED = 0x51a7ab1e;

const requestedSamples = process.argv.find((argument) => argument.startsWith('--samples='));
const sampleCount = requestedSamples ? Number(requestedSamples.split('=')[1]) : DEFAULT_SAMPLE_COUNT;
if (!Number.isInteger(sampleCount) || sampleCount < 1_000) {
  throw new Error('--samples must be an integer greater than or equal to 1000');
}

const preferencePairs = [
  ['socialPreference', 'sociability'],
  ['attachmentPreference', 'attachment'],
  ['noiseTolerance', 'vocality'],
  ['chaosTolerance', 'chaosPotential'],
  ['sensitivityTolerance', 'sensitivity'],
  ['independencePreference', 'independence'],
];
const legacyStats = Object.fromEntries(suitableScoringTraitKeys.map((key) => [key, {
  minimum: suitableQuestionsV2.reduce((sum, question) => sum + Math.min(...question.options.map((option) => option.vector[key] ?? 0)), 0),
  maximum: suitableQuestionsV2.reduce((sum, question) => sum + Math.max(...question.options.map((option) => option.vector[key] ?? 0)), 0),
}]));

const legacyRank = (answers) => {
  const raw = Object.fromEntries(suitableScoringTraitKeys.map((key) => [key, 0]));
  for (const question of suitableQuestionsV2) {
    const option = question.options.find((candidate) => candidate.id === answers[question.id]);
    for (const key of suitableScoringTraitKeys) raw[key] += option.vector[key] ?? 0;
  }
  const normalized = Object.fromEntries(suitableScoringTraitKeys.map((key) => {
    if (key === 'aloneHours') return [key, raw[key]];
    const { minimum, maximum } = legacyStats[key];
    return [key, Math.max(0, Math.min(10, ((raw[key] - minimum) / Math.max(1, maximum - minimum)) * 10))];
  }));
  return suitableBreedProfilesV2.map((profile) => {
    const activityFit = Math.max(0, 10 - Math.max(0, profile.activityNeed - normalized.activityCapacity) * 2);
    const groomingFit = Math.max(0, 10 - Math.max(0, profile.groomingNeed - normalized.groomingTolerance) * 2);
    const aloneFit = normalized.aloneHours <= profile.aloneToleranceHours ? 10 : Math.max(0, 10 - (normalized.aloneHours - profile.aloneToleranceHours) * 2);
    const lifestyleScore = ((activityFit + groomingFit + aloneFit) / 3) * 10;
    const preferenceScore = preferencePairs.reduce((sum, [userKey, dogKey]) => sum + (10 - Math.abs(normalized[userKey] - profile[dogKey])), 0) / preferencePairs.length * 10;
    const trainingFit = Math.max(0, 10 - Math.max(0, profile.trainingNeed - normalized.trainingCommitment) * 2);
    let penalties = 0;
    if (profile.activityNeed - normalized.activityCapacity >= 4) penalties += 20;
    if (normalized.aloneHours - profile.aloneToleranceHours >= 3) penalties += 25;
    if (profile.groomingNeed - normalized.groomingTolerance >= 5) penalties += 15;
    if (profile.trainingNeed - normalized.trainingCommitment >= 5) penalties += 15;
    return { id: profile.breedId, score: Math.max(0, Math.min(100, lifestyleScore * 0.5 + preferenceScore * 0.35 + trainingFit * 10 * 0.15 - penalties)) };
  }).sort((left, right) => right.score - left.score || suitableBreedProfilesV2.findIndex((profile) => profile.breedId === left.id) - suitableBreedProfilesV2.findIndex((profile) => profile.breedId === right.id));
};

const makeCounts = () => Object.fromEntries(suitableBreedProfilesV2.map((profile) => [profile.breedId, 0]));
const legacyPrimaryCounts = makeCounts();
const calibratedPrimaryCounts = makeCounts();
const calibratedSecondaryCounts = makeCounts();
const winningPenaltyCounts = {
  ACTIVITY_SHORTFALL: 0,
  ALONE_TIME_SHORTFALL: 0,
  GROOMING_SHORTFALL: 0,
  TRAINING_SHORTFALL: 0,
};

let randomState = SEED;
const random = () => {
  randomState = (Math.imul(randomState, 1_664_525) + 1_013_904_223) >>> 0;
  return randomState / 4_294_967_296;
};

for (let index = 0; index < sampleCount; index += 1) {
  const answers = Object.fromEntries(suitableQuestionsV2.map((question) => [
    question.id,
    question.options[Math.floor(random() * question.options.length)].id,
  ]));
  legacyPrimaryCounts[legacyRank(answers)[0].id] += 1;
  const calibrated = scoreSuitableAnswers({ answers, questions: suitableQuestionsV2, profiles: suitableBreedProfilesV2 });
  if (calibrated.status !== 'done') throw new Error('Generated a partial answer set');
  calibratedPrimaryCounts[calibrated.ranked[0].profile.breedId] += 1;
  calibratedSecondaryCounts[calibrated.ranked[1].profile.breedId] += 1;
  for (const penalty of calibrated.ranked[0].penalties) winningPenaltyCounts[penalty.code] += 1;
}

const percent = (count) => (count * 100) / sampleCount;
console.log(`Seed: 0x${SEED.toString(16)} | Samples: ${sampleCount.toLocaleString('en-US')}`);
console.log('');
console.log('| Breed | Legacy primary | Calibrated primary | Calibrated secondary |');
console.log('| --- | ---: | ---: | ---: |');
for (const id of Object.keys(calibratedPrimaryCounts).sort((left, right) => calibratedPrimaryCounts[right] - calibratedPrimaryCounts[left])) {
  console.log(`| ${id} | ${percent(legacyPrimaryCounts[id]).toFixed(2)}% | ${percent(calibratedPrimaryCounts[id]).toFixed(2)}% | ${percent(calibratedSecondaryCounts[id]).toFixed(2)}% |`);
}
console.log('');
console.log('Winning-result penalty rates:');
for (const [code, count] of Object.entries(winningPenaltyCounts)) console.log(`- ${code}: ${percent(count).toFixed(2)}%`);

const fixtures = {
  'quiet-low-maintenance': {
    expected: 'greyhound',
    answers: { S1: 'A', S2: 'A', S3: 'C', S4: 'B', S5: 'A', S6: 'A', S7: 'A', S8: 'A', S9: 'A', S10: 'B', S11: 'A', S12: 'A', S13: 'A', S14: 'A' },
  },
  'active-social-low-alone-time': {
    expected: 'husky',
    answers: { S1: 'D', S2: 'D', S3: 'A', S4: 'D', S5: 'D', S6: 'D', S7: 'D', S8: 'D', S9: 'D', S10: 'D', S11: 'D', S12: 'D', S13: 'D', S14: 'D' },
  },
  'steady-affectionate-family': {
    expected: 'golden-retriever',
    answers: { S1: 'C', S2: 'C', S3: 'A', S4: 'C', S5: 'C', S6: 'D', S7: 'B', S8: 'C', S9: 'B', S10: 'B', S11: 'B', S12: 'B', S13: 'B', S14: 'B' },
  },
  'independent-with-long-alone-time': {
    expected: 'greyhound',
    answers: { S1: 'B', S2: 'B', S3: 'D', S4: 'B', S5: 'A', S6: 'A', S7: 'A', S8: 'A', S9: 'A', S10: 'B', S11: 'A', S12: 'A', S13: 'C', S14: 'A' },
  },
};

const failures = [];
const shares = Object.values(calibratedPrimaryCounts).map(percent);
const maximumShare = Math.max(...shares);
const minimumShare = Math.min(...shares);
if (maximumShare > MAX_PRIMARY_SHARE) failures.push(`maximum primary share ${maximumShare.toFixed(2)}% exceeds ${MAX_PRIMARY_SHARE}%`);
if (minimumShare < MIN_PRIMARY_SHARE) failures.push(`minimum primary share ${minimumShare.toFixed(2)}% is below ${MIN_PRIMARY_SHARE}%`);
for (const [name, fixture] of Object.entries(fixtures)) {
  const result = scoreSuitableAnswers({ answers: fixture.answers, questions: suitableQuestionsV2, profiles: suitableBreedProfilesV2 });
  const actual = result.status === 'done' ? result.ranked[0].profile.breedId : 'incomplete';
  if (actual !== fixture.expected) failures.push(`${name} expected ${fixture.expected}, received ${actual}`);
}

console.log('');
if (failures.length > 0) {
  console.error(`Suitable distribution check failed: ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log(`Suitable distribution check passed (each primary breed ${MIN_PRIMARY_SHARE}%-${MAX_PRIMARY_SHARE}%, plus four lifestyle fixtures).`);
}
