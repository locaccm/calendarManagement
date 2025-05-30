import request from 'supertest';
import express from 'express';
import { authorizeWithApi } from '../middleware/authorizationApi';

// Ajout pour TypeScript
declare global {
  var mockAxiosPost: jest.Mock;
}

// Create a mock function for axios.post
const mockPost = jest.fn();

// Mock axios pour simuler l'API centrale
jest.mock('axios', () => ({
  post: (...args: any[]) => mockPost(...args),
}));

// Assign the mock to the global object to make it accessible everywhere
global.mockAxiosPost = mockPost;

const app = express();
app.use(express.json());
app.get('/protected', authorizeWithApi({ rightName: 'getAllEvents' }), (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

describe('authorizeWithApi middleware', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('grants access if central API responds with 201', async () => {
    // Simulate a positive response from the authorization API
    mockPost.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 201,
        data: { authorized: true },
      });
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Access granted');
  });

  it('denies access if central API responds with 403', async () => {
    // Simulate a 403 error response from the authorization API
    mockPost.mockImplementationOnce(() => {
      return Promise.reject({
        response: {
          status: 403,
          data: { error: 'Access denied' },
        },
      });
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/denied/);
  });

  it('denies access if no token is sent', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Token manquant/);
  });

  it("retourne 500 si l'API centrale plante", async () => {
    mockPost.mockImplementationOnce(() => {
      return Promise.reject(new Error('API down'));
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error during access verification/);
  });
});
