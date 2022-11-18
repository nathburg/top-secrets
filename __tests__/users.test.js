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
  test('POST /api/v1/users signs up new user if email ends in @defense.gov', async () => {
    const res1 = await request(app)
      .post('/api/v1/users')
      .send({ email: 'nathan@example.com', password: 'helloworld' });
    expect(res1.body).toMatchInlineSnapshot(`
      Object {
        "message": "You do not have access to view this page",
        "status": 403,
      }
    `);
    const res2 = await request(app)
      .post('/api/v1/users')
      .send({ email: 'nathan@defense.gov', password: 'helloworld' });
    expect(res2.body).toMatchInlineSnapshot(`
      Object {
        "email": "nathan@defense.gov",
        "id": "2",
      }
    `);
  });

  test('POST /api/v1/secrets posts new secret if user is logged in', async () => {
    const res1 = await request(app)
      .post('/api/v1/secrets')
      .send({ title: '418', description: 'The President is a teapot.' });
    expect(res1.body).toEqual({
      message: 'You must be signed in to continue',
      status: 401,
    });
    const [agent, user] = await registerAndLogin();
    const res2 = await agent
      .post('/api/v1/secrets')
      .send({ title: '418', description: 'The President is a teapot.' });
    expect(res2.body.description).toBe('The President is a teapot.');
  });

  test('DELETE /api/v1/users/sessions logs out the user', async () => {
    const [agent, user] = await registerAndLogin();
    const res = await agent.delete('/api/v1/users/sessions');
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "message": "Signed out successfully!",
        "success": true,
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
    expect(res2.body[0].description).toBe(
      // eslint-disable-next-line quotes
      "The President slept with a hooker. Don't tell anyone"
    );
  });

  afterAll(() => {
    pool.end();
  });
});
