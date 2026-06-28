import { classify, topicConfidenceScore, type ClassifierInput } from './profile-classifier';

function values(score: number, count: number): number[] {
  return Array.from({ length: count }, () => score);
}

function input(overrides: Partial<ClassifierInput> = {}): ClassifierInput {
  return {
    attentionDifficulty: values(1, 5),
    autonomy: values(1, 4),
    competence: values(1, 4),
    selfRegulation: values(1, 4),
    selfEfficacy: values(1, 4),
    ...overrides,
  };
}

describe('profile classifier', () => {
  it.each([
    [
      'Profile1',
      input({
        attentionDifficulty: values(5, 5),
        autonomy: values(1, 4),
        competence: values(1, 4),
        selfRegulation: values(1, 4),
        selfEfficacy: values(1, 4),
      }),
      'starter',
      1,
    ],
    [
      'Profile2',
      input({
        attentionDifficulty: values(1, 5),
        autonomy: values(4, 4),
        competence: values(3, 4),
        selfRegulation: values(1, 4),
        selfEfficacy: values(3, 4),
      }),
      'exploring',
      2,
    ],
    [
      'Profile3',
      input({
        attentionDifficulty: values(5, 5),
        autonomy: values(4, 4),
        competence: values(3, 4),
        selfRegulation: values(4, 4),
        selfEfficacy: values(4, 4),
      }),
      'distracted',
      3,
    ],
    [
      'Profile4',
      input({
        attentionDifficulty: values(1, 5),
        autonomy: values(4, 4),
        competence: values(4, 4),
        selfRegulation: values(4, 4),
        selfEfficacy: values(4, 4),
      }),
      'independent',
      4,
    ],
  ] as const)('assigns a clean %s fixture', (_name, fixture, learnerProfile, profileNumber) => {
    const result = classify(fixture);

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.learnerProfile).toBe(learnerProfile);
    expect(result.profileNumber).toBe(profileNumber);
    expect(result.confidence).toBe(1);
    expect(result.flag).toBeNull();
  });

  it('maps 2.75 to Medium and keeps the spec example at Profile3 with full confidence', () => {
    const result = classify(input({
      attentionDifficulty: [4, 4, 4, 4, 5],
      autonomy: [2, 3, 3, 3],
      competence: [3, 3, 3, 4],
      selfRegulation: [4, 4, 4, 3],
      selfEfficacy: [4, 4, 4, 4],
    }));

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.constructScores.autonomy).toBe(2.75);
    expect(result.levels.autonomy).toBe('Medium');
    expect(result.assignedProfile).toBe('Profile3');
    expect(result.profileScores.profile3).toBe(5);
    expect(result.confidence).toBe(1);
    expect(result.flag).toBeNull();
  });

  it('breaks top-score ties by self-efficacy distance first', () => {
    const result = classify(input({
      attentionDifficulty: values(4, 5),
      autonomy: values(3, 4),
      competence: values(1, 4),
      selfRegulation: values(1, 4),
      selfEfficacy: values(4, 4),
    }));

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.assignedProfile).toBe('Profile3');
    expect(result.tieBreakUsed).toBe(true);
  });

  it('continues tie-breaking to later constructs when earlier distances are equal', () => {
    const result = classify(input({
      attentionDifficulty: values(3, 5),
      autonomy: values(4, 4),
      competence: values(3, 4),
      selfRegulation: values(4, 4),
      selfEfficacy: values(3, 4),
    }));

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.assignedProfile).toBe('Profile3');
    expect(result.tieBreakUsed).toBe(true);
  });

  it('falls back to the lowest profile number when tie distances are exhausted', () => {
    const result = classify(input({
      attentionDifficulty: values(3, 5),
      autonomy: values(4, 4),
      competence: values(3, 4),
      selfRegulation: values(4, 4),
      selfEfficacy: values(4, 4),
    }));

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.profileScores.profile3).toBe(result.profileScores.profile4);
    expect(result.assignedProfile).toBe('Profile3');
    expect(result.tieBreakUsed).toBe(true);
  });

  it('flags ambiguous classifications below 3 matches and not at 3 matches', () => {
    const ambiguous = classify(input({
      attentionDifficulty: values(3, 5),
      autonomy: values(1, 4),
      competence: values(4, 4),
      selfRegulation: values(4, 4),
      selfEfficacy: values(1, 4),
    }));
    expect(ambiguous.status).toBe('Ok');
    if (ambiguous.status !== 'Ok') return;
    expect(Math.max(...Object.values(ambiguous.profileScores))).toBe(2);
    expect(ambiguous.confidence).toBe(0.4);
    expect(ambiguous.flag).toBe('Ambiguous');

    const notAmbiguous = classify(input({
      attentionDifficulty: values(4, 5),
      autonomy: values(3, 4),
      competence: values(1, 4),
      selfRegulation: values(1, 4),
      selfEfficacy: values(4, 4),
    }));
    expect(notAmbiguous.status).toBe('Ok');
    if (notAmbiguous.status !== 'Ok') return;
    expect(Math.max(...Object.values(notAmbiguous.profileScores))).toBe(3);
    expect(notAmbiguous.confidence).toBe(0.6);
    expect(notAmbiguous.flag).toBeNull();
  });

  it('enforces the 75 percent answered threshold per construct', () => {
    expect(classify(input({ autonomy: [1, 2, null, null] })).status).toBe('Incomplete');
    expect(classify(input({ autonomy: [1, 2, 3, null] })).status).toBe('Ok');
    expect(classify(input({ attentionDifficulty: [5, 5, 5, null, null] })).status).toBe('Incomplete');
    expect(classify(input({ attentionDifficulty: [5, 5, 5, 5, null] })).status).toBe('Ok');
  });

  it('returns validation errors before incomplete data', () => {
    const result = classify(input({
      attentionDifficulty: [0, null, null, null, null],
      autonomy: [1, 2, null, null],
      competence: [6, 1, 1, 1],
      selfRegulation: [3.5, 1, 1, 1],
    }));

    expect(result.status).toBe('ValidationError');
    if (result.status !== 'ValidationError') return;
    expect(result.invalid).toEqual(expect.arrayContaining([
      { construct: 'attentionDifficulty', index: 0, value: 0 },
      { construct: 'competence', index: 0, value: 6 },
      { construct: 'selfRegulation', index: 0, value: 3.5 },
    ]));
  });

  it('computes topic confidence as the mean of answered topics', () => {
    expect(topicConfidenceScore([1, 3, null, 5])).toBe(3);
    expect(topicConfidenceScore([null, undefined])).toBeNull();
  });

  it('assigns Profile 2 when leftmost answers are selected everywhere (user-reported repro)', () => {
    const result = classify(input({
      attentionDifficulty: values(1, 5),
      autonomy: values(1, 4),
      competence: values(1, 4),
      selfRegulation: values(1, 4),
      selfEfficacy: values(1, 4),
    }));

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.levels).toEqual({
      attentionDifficulty: 'Low',
      autonomy: 'Low',
      competence: 'Low',
      selfRegulation: 'Low',
      selfEfficacy: 'Low',
    });
    expect(result.profileScores.profile1).toBe(4);
    expect(result.profileScores.profile2).toBe(4);
    expect(result.assignedProfile).toBe('Profile2');
    expect(result.learnerProfile).toBe('exploring');
    expect(result.profileNumber).toBe(2);
    expect(result.tieBreakUsed).toBe(true);
    expect(result.confidence).toBe(0.8);
    expect(result.flag).toBeNull();
  });

  it('assigns Profile 1 for semantically worst student answers (high attention difficulty, low elsewhere)', () => {
    const result = classify(input({
      attentionDifficulty: values(5, 5),
      autonomy: values(1, 4),
      competence: values(1, 4),
      selfRegulation: values(1, 4),
      selfEfficacy: values(1, 4),
    }));

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.levels.attentionDifficulty).toBe('High');
    expect(result.levels.autonomy).toBe('Low');
    expect(result.levels.competence).toBe('Low');
    expect(result.levels.selfRegulation).toBe('Low');
    expect(result.levels.selfEfficacy).toBe('Low');
    expect(result.profileScores.profile1).toBe(5);
    expect(result.assignedProfile).toBe('Profile1');
    expect(result.learnerProfile).toBe('starter');
    expect(result.profileNumber).toBe(1);
    expect(result.tieBreakUsed).toBe(false);
    expect(result.confidence).toBe(1);
    expect(result.flag).toBeNull();
  });

  it('assigns Profile 3 when all maximum answers are selected everywhere', () => {
    const result = classify(input({
      attentionDifficulty: values(5, 5),
      autonomy: values(5, 4),
      competence: values(5, 4),
      selfRegulation: values(5, 4),
      selfEfficacy: values(5, 4),
    }));

    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.profileScores.profile3).toBe(4);
    expect(result.profileScores.profile4).toBe(4);
    expect(result.assignedProfile).toBe('Profile3');
    expect(result.learnerProfile).toBe('distracted');
    expect(result.profileNumber).toBe(3);
    expect(result.tieBreakUsed).toBe(true);
  });

  it('maps construct score boundaries to Low, Medium, and High levels', () => {
    const lowAutonomy = classify(input({ autonomy: [2, 2, 3, 3] }));
    expect(lowAutonomy.status).toBe('Ok');
    if (lowAutonomy.status !== 'Ok') return;
    expect(lowAutonomy.constructScores.autonomy).toBe(2.5);
    expect(lowAutonomy.levels.autonomy).toBe('Low');

    const mediumAutonomy = classify(input({ autonomy: [2, 3, 3, 3] }));
    expect(mediumAutonomy.status).toBe('Ok');
    if (mediumAutonomy.status !== 'Ok') return;
    expect(mediumAutonomy.constructScores.autonomy).toBe(2.75);
    expect(mediumAutonomy.levels.autonomy).toBe('Medium');

    const mediumHighBoundary = classify(input({ competence: [3, 3, 4, 4] }));
    expect(mediumHighBoundary.status).toBe('Ok');
    if (mediumHighBoundary.status !== 'Ok') return;
    expect(mediumHighBoundary.constructScores.competence).toBe(3.5);
    expect(mediumHighBoundary.levels.competence).toBe('Medium');

    const highCompetence = classify(input({ competence: [4, 3, 4, 4] }));
    expect(highCompetence.status).toBe('Ok');
    if (highCompetence.status !== 'Ok') return;
    expect(highCompetence.constructScores.competence).toBe(3.75);
    expect(highCompetence.levels.competence).toBe('High');
  });

  it('does not change profile assignment based on topic confidence scores', () => {
    const selfDeclare = input({
      attentionDifficulty: values(1, 5),
      autonomy: values(1, 4),
      competence: values(1, 4),
      selfRegulation: values(1, 4),
      selfEfficacy: values(1, 4),
    });

    const lowTopics = topicConfidenceScore([1, 1, 1, 1]);
    const highTopics = topicConfidenceScore([5, 5, 5, 5]);

    const result = classify(selfDeclare);
    expect(result.status).toBe('Ok');
    if (result.status !== 'Ok') return;
    expect(result.assignedProfile).toBe('Profile2');
    expect(lowTopics).toBe(1);
    expect(highTopics).toBe(5);
  });
});
