const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('secrets routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  test('GET /api/v1/secrets returns all secrets', async () => {
    const res = await request(app).get('/api/v1/secrets');
    console.log(res.body[0]);
    expect(res.body[0].description).toBe(
      "The President slept with a hooker. Don't tell anyone"
    );
  });
  afterAll(() => {
    pool.end();
  });
});
