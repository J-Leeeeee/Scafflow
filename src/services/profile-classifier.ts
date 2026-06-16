import type { LearnerProfile } from '../types/schema';

export type ConstructKey =
  | 'attentionDifficulty'
  | 'autonomy'
  | 'competence'
  | 'selfRegulation'
  | 'selfEfficacy';

export type Level = 'Low' | 'Medium' | 'High';
export type AssignedProfile = 'Profile1' | 'Profile2' | 'Profile3' | 'Profile4';
export type ProfileNumber = 1 | 2 | 3 | 4;

export interface ClassifierInput {
  attentionDifficulty: Array<number | null | undefined>;
  autonomy: Array<number | null | undefined>;
  competence: Array<number | null | undefined>;
  selfRegulation: Array<number | null | undefined>;
  selfEfficacy: Array<number | null | undefined>;
}

export type ConstructScores = Record<ConstructKey, number>;
export type ConstructLevels = Record<ConstructKey, Level>;
export type ProfileScores = Record<'profile1' | 'profile2' | 'profile3' | 'profile4', number>;

export type ClassificationResult =
  | {
      status: 'Ok';
      constructScores: ConstructScores;
      levels: ConstructLevels;
      profileScores: ProfileScores;
      assignedProfile: AssignedProfile;
      profileNumber: ProfileNumber;
      learnerProfile: LearnerProfile;
      confidence: number;
      flag: 'Ambiguous' | null;
      tieBreakUsed: boolean;
    }
  | { status: 'Incomplete'; incompleteConstructs: ConstructKey[] }
  | { status: 'ValidationError'; invalid: Array<{ construct: ConstructKey; index: number; value: unknown }> };

const CONSTRUCTS: ConstructKey[] = [
  'attentionDifficulty',
  'autonomy',
  'competence',
  'selfRegulation',
  'selfEfficacy',
];

const TIE_PRIORITY: ConstructKey[] = [
  'selfEfficacy',
  'selfRegulation',
  'attentionDifficulty',
  'autonomy',
  'competence',
];

const LEVEL_ORDINAL: Record<Level, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const PROFILE_RULES: Record<AssignedProfile, Record<ConstructKey, Level[]>> = {
  Profile1: {
    selfEfficacy: ['Low'],
    selfRegulation: ['Low'],
    attentionDifficulty: ['High'],
    autonomy: ['Low'],
    competence: ['Low'],
  },
  Profile2: {
    selfEfficacy: ['Low', 'Medium'],
    selfRegulation: ['Low'],
    attentionDifficulty: ['Low', 'Medium'],
    autonomy: ['Medium', 'High'],
    competence: ['Low', 'Medium'],
  },
  Profile3: {
    selfEfficacy: ['Medium', 'High'],
    selfRegulation: ['Medium', 'High'],
    attentionDifficulty: ['High'],
    autonomy: ['Medium', 'High'],
    competence: ['Medium'],
  },
  Profile4: {
    selfEfficacy: ['High'],
    selfRegulation: ['High'],
    attentionDifficulty: ['Low'],
    autonomy: ['High'],
    competence: ['Medium', 'High'],
  },
};

export const PROFILE_TO_LEARNER: Record<AssignedProfile, LearnerProfile> = {
  Profile1: 'starter',
  Profile2: 'exploring',
  Profile3: 'distracted',
  Profile4: 'independent',
};

const PROFILE_TO_NUMBER: Record<AssignedProfile, ProfileNumber> = {
  Profile1: 1,
  Profile2: 2,
  Profile3: 3,
  Profile4: 4,
};

export const LEARNER_TO_PROFILE_NUMBER: Record<LearnerProfile, ProfileNumber> = {
  starter: 1,
  exploring: 2,
  distracted: 3,
  independent: 4,
};

const PROFILES: AssignedProfile[] = ['Profile1', 'Profile2', 'Profile3', 'Profile4'];

export function classify(input: ClassifierInput): ClassificationResult {
  const invalid = validateInput(input);
  if (invalid.length > 0) {
    return { status: 'ValidationError', invalid };
  }

  const incompleteConstructs = CONSTRUCTS.filter((construct) => {
    const values = input[construct];
    const answered = values.filter((value) => value !== null && value !== undefined).length;
    return answered / values.length < 0.75;
  });

  if (incompleteConstructs.length > 0) {
    return { status: 'Incomplete', incompleteConstructs };
  }

  const constructScores = Object.fromEntries(
    CONSTRUCTS.map((construct) => [construct, meanAnswered(input[construct])]),
  ) as ConstructScores;
  const levels = Object.fromEntries(
    CONSTRUCTS.map((construct) => [construct, levelForScore(constructScores[construct])]),
  ) as ConstructLevels;

  const profileScores = Object.fromEntries(
    PROFILES.map((profile) => [profileScoreKey(profile), scoreProfile(profile, levels)]),
  ) as ProfileScores;

  const highestScore = Math.max(...Object.values(profileScores));
  const tiedProfiles = PROFILES.filter((profile) => profileScores[profileScoreKey(profile)] === highestScore);
  const tieBreakUsed = tiedProfiles.length > 1;
  const assignedProfile = tieBreakUsed ? breakTie(tiedProfiles, levels) : tiedProfiles[0];
  const confidence = highestScore / 5;

  return {
    status: 'Ok',
    constructScores,
    levels,
    profileScores,
    assignedProfile,
    profileNumber: PROFILE_TO_NUMBER[assignedProfile],
    learnerProfile: PROFILE_TO_LEARNER[assignedProfile],
    confidence,
    flag: highestScore < 3 ? 'Ambiguous' : null,
    tieBreakUsed,
  };
}

export function topicConfidenceScore(scores: Array<number | null | undefined>): number | null {
  const answered = scores.filter((score): score is number => score !== null && score !== undefined);
  if (answered.length === 0) return null;
  return answered.reduce((sum, score) => sum + score, 0) / answered.length;
}

export function profileNumberForLearnerProfile(profile: LearnerProfile | null): ProfileNumber | null {
  return profile ? LEARNER_TO_PROFILE_NUMBER[profile] : null;
}

function validateInput(input: ClassifierInput): Array<{ construct: ConstructKey; index: number; value: unknown }> {
  const invalid: Array<{ construct: ConstructKey; index: number; value: unknown }> = [];

  for (const construct of CONSTRUCTS) {
    input[construct].forEach((value, index) => {
      if (value === null || value === undefined) return;
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        invalid.push({ construct, index, value });
      }
    });
  }

  return invalid;
}

function meanAnswered(values: Array<number | null | undefined>): number {
  const answered = values.filter((value): value is number => value !== null && value !== undefined);
  return answered.reduce((sum, value) => sum + value, 0) / answered.length;
}

function levelForScore(score: number): Level {
  if (score < 2.75) return 'Low';
  if (score <= 3.5) return 'Medium';
  return 'High';
}

function scoreProfile(profile: AssignedProfile, levels: ConstructLevels): number {
  return CONSTRUCTS.reduce((score, construct) => (
    PROFILE_RULES[profile][construct].includes(levels[construct]) ? score + 1 : score
  ), 0);
}

function breakTie(tiedProfiles: AssignedProfile[], levels: ConstructLevels): AssignedProfile {
  let remaining = tiedProfiles;

  for (const construct of TIE_PRIORITY) {
    const distances = remaining.map((profile) => ({
      profile,
      distance: distanceToRule(levels[construct], PROFILE_RULES[profile][construct]),
    }));
    const lowestDistance = Math.min(...distances.map(({ distance }) => distance));
    const closest = distances
      .filter(({ distance }) => distance === lowestDistance)
      .map(({ profile }) => profile);

    if (closest.length === 1) return closest[0];
    remaining = closest;
  }

  return remaining.sort((a, b) => PROFILE_TO_NUMBER[a] - PROFILE_TO_NUMBER[b])[0];
}

function distanceToRule(level: Level, requiredLevels: Level[]): number {
  return Math.min(
    ...requiredLevels.map((required) => Math.abs(LEVEL_ORDINAL[level] - LEVEL_ORDINAL[required])),
  );
}

function profileScoreKey(profile: AssignedProfile): keyof ProfileScores {
  return `profile${PROFILE_TO_NUMBER[profile]}` as keyof ProfileScores;
}
