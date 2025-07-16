/* eslint-disable global-require,no-new,import/no-dynamic-require */

import Blipp from 'blipp';
import dotenv from 'dotenv';
import fs from 'fs';
import hapiAuthJwt2 from 'hapi-auth-jwt2';
import HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert';
import jwt from 'jsonwebtoken';
import path from 'path';
import Vision from '@hapi/vision';

export default class App {
  constructor(server) {
    this._server = server;
    dotenv.config();
  }

  async configure() {
    await this._registerPlugins();
    this._configureAuth();
    this._loadControllers();
  }

  async _registerPlugins() {
    await this._server.register({
      plugin: Blipp,
    });

    await this._server.register(hapiAuthJwt2);

    await this._server.register({
      plugin: Inert,
    });

    await this._server.register({
      plugin: Vision,
    });

    await this._server.register({
      plugin: HapiSwagger,
      options: {
        info: {
          title: 'API Documentation',
          version: '1.0.0',
        },
      },
    });
  }

  _configureAuth() {
    this._server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT_SECRET,
      validate: async (decoded, request, h) => {
        // your validation logic
        return { isValid: true };
      },
      verifyOptions: { algorithms: ['HS256'] },
      urlKey: 'token',
      cookieKey: '__AUTH',
    });
    this._server.auth.default('jwt');
  }

  _loadControllers() {
    fs.readdirSync(path.join(__dirname, 'controllers'))
      .filter((file) => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))
      .forEach((file) => {
        const Controller = require(path.resolve(__dirname, 'controllers', file)).default;
        new Controller(this._server);
      });
  }

  async start() {
    await this.configure();
    await this._server.start();
  }
}
