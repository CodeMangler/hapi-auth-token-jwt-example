/* eslint-disable class-methods-use-this */

import Boom from 'boom';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

export default class AuthenticationController {
  constructor(server) {
    this._server = server;
    this._configureRoutes();
  }

  _configureRoutes() {
    this._server.route({
      method: 'POST',
      path: '/login',
      handler: this._create,
      config: {
        validate: {
          payload: {
            username: Joi.string().required(),
            password: Joi.string().min(2).max(200).required(),
          },
        },
        auth: false,
        tags: ['api'],
        description: 'Get authentication token',
        notes: 'Responds with an authentication token for the provided credentials and sets a cookie',
      },
    });
  }

  async _create(request, h) {
    const { username, password } = request.payload;
    // Authenticate against your auth source (DB?)
    // and optionally keep track of the JWT tokens issued here
    if (username === process.env.USERNAME && password === process.env.PASSWORD) {
      const jwtToken = jwt.sign({ user: username }, process.env.JWT_SECRET);
      const sessionCookie = { authToken: jwtToken };
      // Return the JWT token in response body, AND set it on the auth cookie
      return h.response(jwtToken).state('__AUTH', sessionCookie);
    }

    return Boom.unauthorized('Invalid username or password');
  }
}
