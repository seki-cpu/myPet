import { breedResults } from '../data/breedResults.v1.ts';
import { personalityBreedOrder, personalityProfiles, personalityTraitKeys } from '../data/personalityBreedProfiles.v1.ts';
import { personalityQuestions } from '../data/personalityQuestions.v2.ts';
import { scorePersonalityAnswers } from '../domain/personalityScoringModel.ts';

const DEFAULT_SAMPLE_COUNT = 100_000;
const MAX_PRIMARY_SHARE = 18;
const MIN_PRIMARY_SHARE = 2;
const SEED = 0x5eed1234;

const requestedSamples = process.argv.find((argument) => argument.startsWith('--samples='));
const sampleCount = requestedSamples ? Number(requestedSamples.split('=')[1]) : DEFAULT_SAMPLE_COUNT;
if (!Number.isInteger(sampleCount) || sampleCount < 1_000) {
  throw new Error('--samples must be an integer greater than or equal to 1000');
}

const legacyStats = Object.fromEntries(personalityTraitKeys.map((key) => [key, {
  minimum: personalityQuestions.reduce((sum, question) => sum + Math.min(...question.options.map((option) => option.vector[key] ?? 0)), 0),
  maximum: personalityQuestions.reduce((sum, question) => sum + Math.max(...question.options.map((option) => option.vector[key] ?? 0)), 0),
}]));

const legacyPrimaryBreed = (answers) => {
  const totals = Object.fromEntries(personalityTraitKeys.map((key) => [key, 0]));
  for (const question of personalityQuestions) {
    const option = question.options.find((candidate) => candidate.id === answers[question.id]);
    for (const key of personalityTraitKeys) totals[key] += option.vector[key] ?? 0;
  }
  const normalized = Object.fromEntries(personalityTraitKeys.map((key) => {
    const { minimum, maximum } = legacyStats[key];
    return [key, Math.max(0, Math.min(10, ((totals[key] - minimum) / Math.max(1, maximum - minimum)) * 10))];
  }));
  return breedResults.map((breed) => ({
    id: breed.id,
    distance: personalityTraitKeys.reduce((sum, key) => sum + Math.abs(normalized[key] - personalityProfiles[breed.id][key]), 0),
  })).sort((left, right) => left.distance - right.distance || personalityBreedOrder.indexOf(left.id) - personalityBreedOrder.indexOf(right.id))[0].id;
};

const makeCounts = () => Object.fromEntries(personalityBreedOrder.map((id) => [id, 0]));
const legacyCounts = makeCounts();
const calibratedCounts = makeCounts();
let randomState = SEED;
const random = () => {
  randomState = (Math.imul(randomState, 1_664_525) + 1_013_904_223) >>> 0;
  return randomState / 4_294_967_296;
};

for (let index = 0; index < sampleCount; index += 1) {
  const answers = Object.fromEntries(personalityQuestions.map((question) => [
    question.id,
    question.options[Math.floor(random() * question.options.length)].id,
  ]));
  legacyCounts[legacyPrimaryBreed(answers)] += 1;
  const calibrated = scorePersonalityAnswers({
    answers,
    questions: personalityQuestions,
    breeds: breedResults,
    profiles: personalityProfiles,
    traitKeys: personalityTraitKeys,
    breedOrder: personalityBreedOrder,
  });
  if (calibrated.status !== 'done') throw new Error('Generated a partial answer set');
  calibratedCounts[calibrated.ranked[0].breed.id] += 1;
}

const percent = (count) => (count * 100) / sampleCount;
console.log(`Seed: 0x${SEED.toString(16)} | Samples: ${sampleCount.toLocaleString('en-US')}`);
console.log('');
console.log('| Breed | Legacy | Calibrated |');
console.log('| --- | ---: | ---: |');
for (const id of [...personalityBreedOrder].sort((left, right) => calibratedCounts[right] - calibratedCounts[left])) {
  console.log(`| ${id} | ${percent(legacyCounts[id]).toFixed(2)}% | ${percent(calibratedCounts[id]).toFixed(2)}% |`);
}

const shares = Object.values(calibratedCounts).map(percent);
const maximumShare = Math.max(...shares);
const minimumShare = Math.min(...shares);
const failures = [];
if (maximumShare > MAX_PRIMARY_SHARE) failures.push(`maximum share ${maximumShare.toFixed(2)}% exceeds ${MAX_PRIMARY_SHARE}%`);
if (minimumShare < MIN_PRIMARY_SHARE) failures.push(`minimum share ${minimumShare.toFixed(2)}% is below ${MIN_PRIMARY_SHARE}%`);

const repeatedAnswerExpectations = { A: 'labrador', B: 'golden-retriever', D: 'shiba-inu' };
for (const [optionId, expectedBreed] of Object.entries(repeatedAnswerExpectations)) {
  const answers = Object.fromEntries(personalityQuestions.map((question) => [question.id, optionId]));
  const result = scorePersonalityAnswers({ answers, questions: personalityQuestions, breeds: breedResults, profiles: personalityProfiles, traitKeys: personalityTraitKeys, breedOrder: personalityBreedOrder });
  const actualBreed = result.status === 'done' ? result.ranked[0].breed.id : 'incomplete';
  if (actualBreed !== expectedBreed) failures.push(`all-${optionId} fixture expected ${expectedBreed}, received ${actualBreed}`);
}

console.log('');
if (failures.length > 0) {
  console.error(`Distribution check failed: ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  console.log(`Distribution check passed (each breed ${MIN_PRIMARY_SHARE}%-${MAX_PRIMARY_SHARE}%, plus fixed-answer fixtures).`);
}
