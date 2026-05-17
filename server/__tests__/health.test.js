const request = require('supertest');
const app = require('../server');

describe('Health', () => {
  it('GET /health returns ok or error based on DB', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
  });
});

describe('Auth validation', () => {
  it('POST /api/register rejects short password', async () => {
    const res = await request(app).post('/api/register').send({
      firstName: 'Test',
      lastName: 'User',
      contact: 'test-short@example.com',
      password: 'short',
      pseudo: 'testshort',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/login rejects missing fields', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(400);
  });
});
