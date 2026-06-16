import { Request, Response } from 'express';
import pool from '../../db/client';
import { AuthRequest } from '../auth/middleware';
import type { CourseLevel, LearnerProfile } from '../../types/schema';
import {
  classify,
  profileNumberForLearnerProfile,
  topicConfidenceScore,
  type ClassifierInput,
} from '../../services/profile-classifier';
import { computeAdaptiveThresholds, deriveStressBaseline } from '../../services/onboarding-survey';

const VALID_COURSE_LEVELS: CourseLevel[] = ['intro', 'intermediate', 'advanced'];

const CONSTRUCT_ITEM_IDS = {
  attentionDifficulty: ['b1_1', 'b1_2', 'b1_3', 'b1_4', 'b1_5'],
  autonomy: ['au_1', 'au_2', 'au_3', 'au_4'],
  competence: ['co_1', 'co_2', 'co_3', 'co_4'],
  selfRegulation: ['sr_1', 'sr_2', 'sr_3', 'sr_4'],
  selfEfficacy: ['se_1', 'se_2', 'se_3', 'se_4'],
} as const;

const ALL_SELF_DECLARE_IDS = Object.values(CONSTRUCT_ITEM_IDS).flat();
const TOPIC_KEYS = ['thevenin_norton', 'mesh_current', 'node_voltage', 'kirchhoff_law'] as const;

type SelfDeclareResponses = Record<string, number>;
type TopicConfidence = Record<(typeof TOPIC_KEYS)[number], number>;

// POST /api/onboarding/self-declare
export async function selfDeclare(req: Request, res: Response): Promise<void> {
  const studentId = (req as AuthRequest).studentId;
  const { adhd_flag, course_level, responses } = req.body as {
    adhd_flag?: unknown;
    course_level?: unknown;
    responses?: unknown;
  };

  if (typeof adhd_flag !== 'boolean') {
    res.status(400).json({ error: 'adhd_flag must be a boolean' });
    return;
  }

  if (!isCourseLevel(course_level)) {
    res.status(400).json({ error: 'course_level must be intro, intermediate, or advanced' });
    return;
  }

  const surveyResponses = validateLikertRecord(responses, ALL_SELF_DECLARE_IDS);
  if (!surveyResponses) {
    res.status(400).json({ error: 'responses must include all 21 survey item ids with values 1-5' });
    return;
  }

  const consentRow = await pool.query<{ consent_given_at: Date | null }>(
    'SELECT consent_given_at FROM students WHERE id = $1',
    [studentId],
  );
  if (!consentRow.rows[0]?.consent_given_at) {
    res.status(403).json({ error: 'Consent required before onboarding. Please accept the privacy notice first.' });
    return;
  }

  const attentionItems = CONSTRUCT_ITEM_IDS.attentionDifficulty.map((id) => surveyResponses[id]);
  const stressBaseline = deriveStressBaseline(attentionItems);
  const { idleThreshold, errorThreshold, hintBudget, responseLength } = computeAdaptiveThresholds(
    adhd_flag,
    stressBaseline,
    course_level,
  );

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE students
          SET adhd_flag=$1, course_level=$2, updated_at=now()
        WHERE id=$3`,
      [adhd_flag, course_level, studentId],
    );

    await client.query(
      `UPDATE cognitive_state SET stress_level=$1, updated_at=now() WHERE student_id=$2`,
      [stressBaseline, studentId],
    );

    await client.query(
      `UPDATE adaptive_config
         SET idle_threshold_s=$1, error_threshold=$2, hint_budget=$3,
             response_length_budget=$4, updated_at=now()
       WHERE student_id=$5`,
      [idleThreshold, errorThreshold, hintBudget, responseLength, studentId],
    );

    await client.query(
      `INSERT INTO learner_survey_responses
         (student_id, self_declare_responses, self_declare_completed_at)
       VALUES ($1, $2, now())
       ON CONFLICT (student_id) DO UPDATE
         SET self_declare_responses=EXCLUDED.self_declare_responses,
             self_declare_completed_at=EXCLUDED.self_declare_completed_at,
             updated_at=now()`,
      [studentId, surveyResponses],
    );

    await client.query('COMMIT');
    res.status(200).json({ self_declared: true });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// POST /api/onboarding/confidence
export async function submitConfidence(req: Request, res: Response): Promise<void> {
  const studentId = (req as AuthRequest).studentId;
  const { topics } = req.body as { topics?: unknown };

  const topicConfidence = validateLikertRecord(topics, TOPIC_KEYS) as TopicConfidence | null;
  if (!topicConfidence) {
    res.status(400).json({ error: 'topics must include all confidence topic keys with values 1-5' });
    return;
  }

  const rowResult = await pool.query<{
    consent_given_at: Date | null;
    self_declare_responses: SelfDeclareResponses | null;
    self_declare_completed_at: Date | null;
  }>(
    `SELECT s.consent_given_at,
            lsr.self_declare_responses,
            lsr.self_declare_completed_at
       FROM students s
       LEFT JOIN learner_survey_responses lsr ON lsr.student_id = s.id
      WHERE s.id = $1`,
    [studentId],
  );
  const row = rowResult.rows[0];

  if (!row?.consent_given_at) {
    res.status(403).json({ error: 'Consent required before onboarding. Please accept the privacy notice first.' });
    return;
  }

  if (!row.self_declare_completed_at || !row.self_declare_responses) {
    res.status(409).json({ error: 'Self-declare survey must be completed before confidence survey' });
    return;
  }

  const classification = classify(buildClassifierInput(row.self_declare_responses));
  if (classification.status !== 'Ok') {
    res.status(422).json({ error: 'Profile classification could not be completed', detail: classification });
    return;
  }

  const topicScore = topicConfidenceScore(TOPIC_KEYS.map((key) => topicConfidence[key]));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE students
          SET learner_profile=$1, updated_at=now()
        WHERE id=$2`,
      [classification.learnerProfile, studentId],
    );

    await client.query(
      `INSERT INTO learner_survey_responses
         (student_id, topic_confidence, construct_scores, classification_result, confidence_completed_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (student_id) DO UPDATE
         SET topic_confidence=EXCLUDED.topic_confidence,
             construct_scores=EXCLUDED.construct_scores,
             classification_result=EXCLUDED.classification_result,
             confidence_completed_at=EXCLUDED.confidence_completed_at,
             updated_at=now()`,
      [studentId, topicConfidence, classification.constructScores, classification],
    );

    await client.query('COMMIT');
    res.status(200).json({ ...classification, topicConfidenceScore: topicScore });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// GET /api/onboarding/status
export async function getOnboardingStatus(req: Request, res: Response): Promise<void> {
  const studentId = (req as AuthRequest).studentId;

  const result = await pool.query<{
    consent_given_at: Date | null;
    learner_profile: LearnerProfile | null;
    self_declare_completed_at: Date | null;
    confidence_completed_at: Date | null;
  }>(
    `SELECT s.consent_given_at,
            s.learner_profile,
            lsr.self_declare_completed_at,
            lsr.confidence_completed_at
       FROM students s
       LEFT JOIN learner_survey_responses lsr ON lsr.student_id = s.id
      WHERE s.id = $1`,
    [studentId],
  );

  const row = result.rows[0];
  if (!row) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  res.status(200).json({
    consentGiven: row.consent_given_at !== null,
    selfDeclareComplete: row.self_declare_completed_at !== null,
    confidenceComplete: row.confidence_completed_at !== null,
    learnerProfile: row.learner_profile,
    profileNumber: profileNumberForLearnerProfile(row.learner_profile),
  });
}

function buildClassifierInput(responses: SelfDeclareResponses): ClassifierInput {
  return {
    attentionDifficulty: CONSTRUCT_ITEM_IDS.attentionDifficulty.map((id) => responses[id]),
    autonomy: CONSTRUCT_ITEM_IDS.autonomy.map((id) => responses[id]),
    competence: CONSTRUCT_ITEM_IDS.competence.map((id) => responses[id]),
    selfRegulation: CONSTRUCT_ITEM_IDS.selfRegulation.map((id) => responses[id]),
    selfEfficacy: CONSTRUCT_ITEM_IDS.selfEfficacy.map((id) => responses[id]),
  };
}

function validateLikertRecord(input: unknown, keys: readonly string[]): SelfDeclareResponses | null {
  if (!isRecord(input)) return null;

  const output: SelfDeclareResponses = {};
  for (const key of keys) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
      return null;
    }
    output[key] = value;
  }

  return output;
}

function isCourseLevel(value: unknown): value is CourseLevel {
  return typeof value === 'string' && VALID_COURSE_LEVELS.includes(value as CourseLevel);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
