const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '12345',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;
  const agent = request.agent(app);
  const user = await UserService.create({ ...mockUser, ...userProps });
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  test('POST /api/v1/users signs up new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'nathan@example.com', password: 'helloworld' });
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "email": "nathan@example.com",
        "id": "2",
      }
    `);
  });

  test('GET /api/v1/secrets only returns secrets if user is logged in', async () => {
    const res1 = await request(app).get('/api/v1/secrets');
    expect(res1.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
    const [agent, user] = await registerAndLogin();
    const res2 = await agent.get('/api/v1/secrets');
    expect(res2.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "created_at": "2022-11-18T21:36:53.140Z",
          "description": "The President slept with a hooker. Don't tell anyone",
          "id": "1",
          "title": "President Secret",
        },
      ]
    `);
  });

  afterAll(() => {
    pool.end();
  });
});
