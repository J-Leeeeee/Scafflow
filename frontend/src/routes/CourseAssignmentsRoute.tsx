import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, onboarding } from '../lib/api';

interface AssignmentRow {
  n: number;
  active: boolean;
  released?: string;
  due?: string;
  dueNote?: string;
}

// HW 1 is the only active assignment in the demo flow; the rest are placeholders.
const ASSIGNMENTS: AssignmentRow[] = [
  { n: 1, active: true, released: 'Sep 29 at 12:00 AM', due: 'Oct 6 at 11:59 PM', dueNote: 'No submission yet' },
  ...Array.from({ length: 8 }, (_, i) => ({ n: i + 2, active: false })),
];

// Shared grid template so the header and every row keep their columns aligned.
const GRID = 'grid grid-cols-[2fr_1.4fr_1.4fr_2fr_1.3fr] items-center gap-4 px-6';

export function CourseAssignmentsRoute() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [loadingHomework, setLoadingHomework] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openHomework(n: number) {
    if (loadingHomework !== null) return;

    setLoadingHomework(n);
    setError(null);
    try {
      const status = await onboarding.status();
      if (!status.consentGiven) {
        navigate('/onboarding/consent');
      } else if (!status.selfDeclareComplete) {
        navigate('/onboarding/self-declare');
      } else if (!status.confidenceComplete || !status.profileNumber) {
        navigate(`/courses/${courseId}/hw/${n}/confidence`);
      } else {
        navigate(`/problemset?profile=${status.profileNumber}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to check onboarding status');
      navigate('/onboarding/self-declare');
    } finally {
      setLoadingHomework(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-['IBM_Plex_Sans',sans-serif] text-black">
      <header className="border-b border-[#E1E1E1] bg-white">
        <div className="mx-auto w-full max-w-[1400px] px-8 py-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-4 inline-flex items-center gap-2 text-sm leading-[21px] text-[#5D5D5D] transition hover:text-black"
          >
            <BackIcon />
            Back to Dashboard
          </button>
          <h1 className="text-[32px] leading-10 font-bold text-black">Circuit Theory</h1>
          <p className="mt-2 text-base leading-6 text-[#5D5D5D]">Autumn 2026</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-8 py-8">
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.10)]">
          {/* Column header */}
          <div className={`${GRID} border-b border-[#E5E7EB] py-4 text-sm leading-[21px] font-bold text-[#5D5D5D]`}>
            <span>Assignment</span>
            <span>Status</span>
            <span>Released</span>
            <span>Due Date</span>
            <span>Score</span>
          </div>

          {ASSIGNMENTS.map((hw) =>
            hw.active ? (
              <div
                key={hw.n}
                role="button"
                tabIndex={0}
                onClick={() => openHomework(hw.n)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openHomework(hw.n);
                  }
                }}
                aria-label={`Open Homework Set ${hw.n}`}
                className={`${GRID} cursor-pointer border-b border-[#E5E7EB] py-5 transition hover:bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#615FFF]/30 ${loadingHomework === hw.n ? 'opacity-70' : ''}`}
              >
                <span className="text-[15px] leading-[22.5px] font-bold text-black">
                  Homework Set {hw.n}
                </span>
                <span className="flex items-center gap-2 text-sm leading-[21px] font-medium text-[#3B82F6]">
                  <ClockIcon />
                  In Submission
                </span>
                <span className="text-sm leading-[21px] text-[#5D5D5D]">{hw.released}</span>
                <span className="text-sm leading-[21px] text-[#5D5D5D]">
                  {hw.due}
                  {hw.dueNote && (
                    <span className="mt-1 block text-xs leading-[18px] text-[#99A1AF]">{hw.dueNote}</span>
                  )}
                </span>
                <span className="text-sm leading-[21px] font-bold text-black">Not graded</span>
              </div>
            ) : (
              <div
                key={hw.n}
                aria-disabled="true"
                className={`${GRID} border-b border-[#E5E7EB] py-5 text-[#99A1AF] last:border-b-0`}
              >
                <span className="text-[15px] leading-[22.5px] font-bold">Homework Set {hw.n}</span>
                <span className="flex items-center gap-2 text-sm leading-[21px] font-medium">
                  <LockIcon />
                  Coming soon
                </span>
                <span className="text-sm leading-[21px]">—</span>
                <span className="text-sm leading-[21px]">—</span>
                <span className="text-sm leading-[21px]">—</span>
              </div>
            ),
          )}
        </div>
      </main>
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12.5 16 6 10l6.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.25" y="7" width="9.5" height="6.75" rx="1.25" />
      <path d="M5.25 7V5.25a2.75 2.75 0 0 1 5.5 0V7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
