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

  test('POST /api/v1/users/sessions with correct login adds cookies to agent', async () => {
    const [agent, user] = await registerAndLogin();
    console.log(agent.jar.getCookie());
    expect(1 + 1).toBe(2);
  });

  afterAll(() => {
    pool.end();
  });
});
