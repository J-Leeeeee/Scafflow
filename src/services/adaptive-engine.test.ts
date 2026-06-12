import { checkAfterSubmit } from './adaptive-engine';
import pool from '../db/client';

jest.mock('../db/client', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

const mockPool = pool as jest.Mocked<typeof pool>;

beforeEach(() => jest.clearAllMocks());

// ── checkAfterSubmit ──────────────────────────────────────────────────────────

describe('checkAfterSubmit', () => {
  it('returns null when adaptive_config not found', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });
    const result = await checkAfterSubmit('sess-1', 'stu-1', 0, 0);
    expect(result).toBeNull();
  });

  it('returns null when below all thresholds', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue({ rows: [{ error_threshold: 3, hint_budget: 3 }] });
    const result = await checkAfterSubmit('sess-1', 'stu-1', 2, 2);
    expect(result).toBeNull();
  });

  it('fires error_streak trigger when consecutive errors >= threshold', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ error_threshold: 3, hint_budget: 3 }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await checkAfterSubmit('sess-1', 'stu-1', 3, 1);
    expect(result?.type).toBe('error_streak');
  });

  it('fires hint_budget_exhausted trigger when hints >= budget', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ error_threshold: 3, hint_budget: 3 }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await checkAfterSubmit('sess-1', 'stu-1', 0, 3);
    expect(result?.type).toBe('hint_budget_exhausted');
  });

  it('error_streak takes priority over hint_budget_exhausted', async () => {
    (mockPool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ error_threshold: 3, hint_budget: 3 }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await checkAfterSubmit('sess-1', 'stu-1', 3, 3);
    expect(result?.type).toBe('error_streak');
  });
});
