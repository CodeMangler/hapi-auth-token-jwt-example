import { expect } from 'chai';
import Hapi from '@hapi/hapi';
import jwt from 'jsonwebtoken';
import App from '../../src/App';

describe('ExampleAuthenticatedController', () => {
  let server = null;
  let authToken = null;

  beforeEach(async () => {
    server = Hapi.server();
    await new App(server).configure();
    authToken = jwt.sign({ user: 'aUser' }, process.env.JWT_SECRET);
  });

  describe('GET /unprotected', () => {
    it('works without authentication', async () => {
      const response = await server.inject({
        url: '/unprotected',
        method: 'GET',
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Unprotected');
    });
  });

  describe('GET /protected', () => {
    it('returns unauthorized without a valid authentication token', async () => {
      const response = await server.inject({
        url: '/protected',
        method: 'GET',
      });
      expect(response.statusCode).to.eq(401);
    });

    it('works with a valid token in query parameter', async () => {
      const response = await server.inject({
        url: `/protected?token=${authToken}`,
        method: 'GET',
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Protected');
    });

    it('works with a valid token in Authorization header', async () => {
      const response = await server.inject({
        url: '/protected',
        method: 'GET',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Protected');
    });

    it('works with a valid token in the auth cookie', async () => {
      const response = await server.inject({
        url: '/protected',
        method: 'GET',
        headers: { Cookie: `__AUTH=${authToken};` },
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq('Protected');
    });
  });
});
