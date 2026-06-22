import express from 'express';
import request from 'supertest';
import { asyncHandler } from './asyncHandler';

// Mirrors the global error middleware registered in src/app.ts so the test
// asserts the real end-to-end behavior: a rejected promise must reach it.
function buildApp(handler: express.RequestHandler) {
  const app = express();
  app.get('/route', handler);
  app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );
  return app;
}

describe('asyncHandler', () => {
  it('forwards a rejected promise to the error middleware (500, no hung socket)', async () => {
    const handler = asyncHandler(async () => {
      throw new Error('kaboom');
    });

    const res = await request(buildApp(handler)).get('/route');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });

  it('passes a successful async handler response through untouched', async () => {
    const handler = asyncHandler(async (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const res = await request(buildApp(handler)).get('/route');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
