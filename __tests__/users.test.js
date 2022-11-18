const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  test('POST /api/v1/users signs up new user', async () => {
    const resPost = await request(app)
      .post('/api/v1/users')
      .send({ email: 'nathan@example.com', password: 'helloworld' });
    expect(resPost.body).toMatchInlineSnapshot(`
      Object {
        "email": "nathan@example.com",
        "id": "2",
      }
    `);
  });
  afterAll(() => {
    pool.end();
  });
});
