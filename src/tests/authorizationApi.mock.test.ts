import request from 'supertest';
import express from 'express';
import { authorizeWithApi } from '../middleware/authorizationApi';

// Ajout pour TypeScript
declare global {
  var mockAxiosPost: jest.Mock;
}

// Créer une fonction de mock pour axios.post
const mockPost = jest.fn();

// Mock axios pour simuler l'API centrale
jest.mock('axios', () => ({
  post: (...args: any[]) => mockPost(...args),
}));

// Assigner le mock à l'objet global pour qu'il soit accessible partout
global.mockAxiosPost = mockPost;

const app = express();
app.use(express.json());
app.get('/protected', authorizeWithApi({ rightName: 'getAllEvents' }), (req, res) => {
  res.status(200).json({ message: 'Accès autorisé' });
});

describe('authorizeWithApi middleware', () => {
  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  it("autorise l'accès si l'API centrale répond 201", async () => {
    // Simuler une réponse positive de l'API d'autorisation
    mockPost.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 201,
        data: { authorized: true },
      });
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Accès autorisé');
  });

  it("refuse l'accès si l'API centrale répond 403", async () => {
    // Simuler une réponse d'erreur 403 de l'API d'autorisation
    mockPost.mockImplementationOnce(() => {
      return Promise.reject({
        response: {
          status: 403,
          data: { error: 'Accès refusé' },
        },
      });
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/refusé/);
  });

  it("refuse l'accès si aucun token n'est envoyé", async () => {
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
    expect(res.body.error).toMatch(/Erreur lors de la vérification/);
  });
});
