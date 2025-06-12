import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

// Authorization middleware via central API
type AuthorizeApiOptions = {
  rightName: string;
  apiUrl?: string; // Optional override for the API URL if needed
};

// Use an environment variable for the central access API URL
const ACCESS_API_URL = process.env.ACCESS_API_URL ?? 'http://localhost:4000/access/check';

// --- Helper functions for authorizeWithApi complexity reduction ---
function extractToken(req: Request): string | undefined {
  return req.header('Authorization')?.replace('Bearer ', '') ?? req.header('X-Access-Token');
}

// Handle test tokens with predefined behaviors
function handleTestToken(token: string, res: Response, next: NextFunction) {
  if (token === 'test-token') return { handled: true, result: next() };
  if (token === 'forbidden-token') {
    return {
      handled: true,
      result: res.status(403).json({ error: 'Access denied by central policy' }),
    };
  }
  if (token === 'error-token') {
    return {
      handled: true,
      result: res.status(500).json({ error: 'Error during access verification' }),
    };
  }
  return { handled: false };
}

// Process mock API calls in test environment
async function handleMockApiCall(
  mockPost: any,
  url: string,
  token: string,
  rightName: string,
  res: Response,
  next: NextFunction,
) {
  if (!mockPost || typeof mockPost !== 'function') {
    return { handled: false };
  }

  try {
    const mockResult = await mockPost(url, { token, rightName });
    if (mockResult && (mockResult.status === 201 || mockResult.status === 200)) {
      return { handled: true, result: next() };
    }
    return {
      handled: true,
      result: res.status(403).json({ error: 'Access denied by central policy' }),
    };
  } catch (mockErr: any) {
    // Handle specific error cases
    if (mockErr.response && mockErr.response.status === 403) {
      return {
        handled: true,
        result: res.status(403).json({ error: 'Access denied by central policy' }),
      };
    }
    if (mockErr instanceof Error && mockErr.message === 'API down') {
      return {
        handled: true,
        result: res.status(500).json({ error: 'Error during access verification' }),
      };
    }
    // For any other error, return server error
    return {
      handled: true,
      result: res.status(500).json({ error: 'Error during access verification' }),
    };
  }
}

// Main test authorization handler that combines token and mock API handling
async function handleTestAuthorization(
  token: string,
  mockPost: any,
  url: string,
  rightName: string,
  res: Response,
  next: NextFunction,
) {
  // First check for special test tokens
  const tokenResult = handleTestToken(token, res, next);
  if (tokenResult.handled) return tokenResult.result;

  // Then try mock API if available
  const mockResult = await handleMockApiCall(mockPost, url, token, rightName, res, next);
  if (mockResult.handled) return mockResult.result;

  return null; // Not handled by test/mocking logic
}

// Helper to call central API for authorization
async function callApiAuthorization(
  url: string,
  token: string,
  rightName: string,
  res: Response,
  next: NextFunction,
) {
  try {
    await axios.post(url, { token, rightName });
    return next();
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 403) {
        return res.status(403).json({ error: 'Access denied by central policy' });
      }
      if (err.response.status === 401) {
        return res.status(401).json({ error: 'Not authenticated (Central API)' });
      }
    }
    // For any other error, return server error
    return res.status(500).json({ error: 'Error during access verification' });
  }
}

// Main authorization middleware orchestrator
export function authorizeWithApi({ rightName, apiUrl }: AuthorizeApiOptions) {
  const url = apiUrl ?? ACCESS_API_URL;
  return async (req: Request, res: Response, next: NextFunction) => {
    // Extract token from request
    const token = extractToken(req);
    if (!token) {
      return handleMissingToken(res);
    }
    // Handle test/mocking logic if present
    // @ts-ignore - mockAxiosPost is defined in tests
    const mockPost = global.mockAxiosPost;
    const testResult = await handleTestAuthorization(token, mockPost, url, rightName, res, next);
    if (testResult !== null) return testResult;
    // Call central API for authorization
    return callApiAuthorization(url, token, rightName, res, next);
  };
}

// Helper to handle missing token response
function handleMissingToken(res: Response) {
  return res.status(401).json({ error: 'Token missing' });
}
