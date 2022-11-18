const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('secrets routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  test('POST /api/v1/secrets posts new secret', async () => {
    const res = await request(app)
      .post('/api/v1/secrets')
      .send({ title: '418', description: 'The President is a teapot.' });
    expect(res.status).toEqual(200);
    expect(res.body.description).toBe('The President is a teapot.');
  });

  test.skip('GET /api/v1/secrets returns all secrets', async () => {
    const res = await request(app).get('/api/v1/secrets');
    expect(res.status).toBe(200);
    expect(res.body[0].description).toBe(
      "The President slept with a hooker. Don't tell anyone"
    );
  });

  afterAll(() => {
    pool.end();
  });
});
