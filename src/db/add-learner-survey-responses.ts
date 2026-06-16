// One-time migration: adds learner_survey_responses for profile classification.
// Run with: node --import tsx src/db/add-learner-survey-responses.ts
import pool from './client';

async function run(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS learner_survey_responses (
        student_id                UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
        self_declare_responses    JSONB,
        topic_confidence          JSONB,
        construct_scores          JSONB,
        classification_result     JSONB,
        self_declare_completed_at TIMESTAMPTZ,
        confidence_completed_at   TIMESTAMPTZ,
        created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    console.log('Done: learner_survey_responses table ready.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
