import { expect } from 'chai';
import Hapi from '@hapi/hapi';
import jwt from 'jsonwebtoken';
import App from '../../src/App';

describe('AuthenticationController', () => {
  let server = null;

  beforeEach(async () => {
    server = Hapi.server();
    await new App(server).configure();
  });

  describe('POST /login', () => {
    it('returns a valid JWT token', async () => {
      const response = await server.inject({
        url: '/login',
        method: 'POST',
        payload: { username: 'aUser', password: 'aPassword' },
      });
      expect(response.statusCode).to.eq(200);
      expect(response.payload).to.eq(jwt.sign({ user: 'aUser' }, process.env.JWT_SECRET));
    });

    it(
      'responds with unauthorized when the credentials are incorrect',
      async () => {
        const response = await server.inject({
          url: '/login',
          method: 'POST',
          payload: JSON.stringify({ username: 'aUser', password: 'invalidPassword' }),
        });
        expect(response.statusCode).to.eq(401);
      },
    );
  });
});
