import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, onboarding, type ConfidenceTopicKey } from '../lib/api';

const TOPICS = [
  { key: 'thevenin_norton', label: 'Thevenin Norton Equivalent' },
  { key: 'mesh_current', label: 'Mesh Current' },
  { key: 'node_voltage', label: 'Node Voltage Analysis' },
  { key: 'kirchhoff_law', label: 'Kirchhoff Law' },
] as const;

const LEVELS = [
  'Not confident at all',
  'Not confident',
  'Neutral',
  'Confident',
  'Very confident',
] as const;

export function ConfidenceSurveyRoute() {
  const navigate = useNavigate();
  // Maps a topic index to the chosen proficiency level index.
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === TOPICS.length;

  async function handleSubmit() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const topics = TOPICS.reduce((acc, topic, index) => {
        acc[topic.key] = answers[index] + 1;
        return acc;
      }, {} as Record<ConfidenceTopicKey, number>);
      const classification = await onboarding.confidence({ topics });
      navigate(`/problemset?profile=${classification.profileNumber}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          navigate('/onboarding/self-declare');
          return;
        }
        setError(err.message);
        return;
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(128deg,#EFF6FF_0%,#E0E7FF_100%)] font-['IBM_Plex_Sans',sans-serif]">
      <header className="border-b border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.10)]">
        <div className="mx-auto flex w-full max-w-[1043px] flex-col gap-2 px-6 py-6">
          <h1 className="text-[30px] leading-9 font-medium text-[#101828]">
            Electrical Engineering Onboarding Assessment
          </h1>
          <p className="text-base leading-6 text-[#4A5565]">
            Help us understand your knowledge level in circuit analysis fundamentals
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1043px] flex-col gap-8 px-6 pt-12 pb-12">
        {/* Survey card */}
        <section className="rounded-[10px] bg-white p-8 shadow-[0_4px_6px_rgba(0,0,0,0.10),0_10px_15px_rgba(0,0,0,0.10)]">
          <h2 className="text-2xl leading-8 font-medium text-[#101828]">Instructions</h2>
          <p className="mt-2 text-base leading-6 text-[#4A5565]">
            Please rate your proficiency level for each circuit analysis topic below.
          </p>

          <p className="mt-8 text-lg leading-7 text-[#364153]">
            Rate your understanding of the following topics:
          </p>

          <table className="mt-6 w-full border-collapse border border-[#D1D5DC] text-[#364153]">
            <thead>
              <tr>
                <th className="border border-[#D1D5DC]" />
                {LEVELS.map((level) => (
                  <th
                    key={level}
                    scope="col"
                    className="border border-[#D1D5DC] px-4 py-4 text-center text-base font-normal"
                  >
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((topic, ti) => (
                <tr key={topic.key}>
                  <th
                    scope="row"
                    className="border border-[#D1D5DC] px-4 py-4 text-left text-base font-normal"
                  >
                    {topic.label}
                  </th>
                  {LEVELS.map((level, li) => (
                    <td key={level} className="border border-[#D1D5DC] text-center">
                      <label className="flex cursor-pointer items-center justify-center py-4">
                        <input
                          type="radio"
                          name={`topic-${ti}`}
                          checked={answers[ti] === li}
                          onChange={() => setAnswers((prev) => ({ ...prev, [ti]: li }))}
                          className="size-6 cursor-pointer accent-[#364153]"
                        />
                        <span className="sr-only">{`${topic.label}: ${level}`}</span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Submit card */}
        <section className="rounded-[10px] bg-white p-8 shadow-[0_4px_6px_rgba(0,0,0,0.10),0_10px_15px_rgba(0,0,0,0.10)]">
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-6">
            <p className="text-sm leading-5 text-[#6A7282]">
              {answeredCount} of {TOPICS.length} questions answered
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className={[
                'h-12 rounded-lg px-8 text-base font-medium text-white transition',
                allAnswered
                  ? 'bg-[#615FFF] hover:bg-[#5350e6]'
                  : 'cursor-not-allowed bg-[#9F93F8] opacity-60',
              ].join(' ')}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
