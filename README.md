# hapi-auth-token JWT Authentication Example

This is an example Hapi application to demonstrate usage of the [hapi-auth-token](https://github.com/CodeMangler/hapi-auth-token) plugin with JWT.
It shows how you can generate and consume JWT tokens with `hapi-auth-token`.
To keep things simple, there's only one user, and the credentials are read off of ENV (`.env`).
See [hapi-auth-token-db-example](https://github.com/CodeMangler/hapi-auth-token-db-example) for an example that shows how to use this with users in a SQL database.

## Setup
- Create `.env` from `.env.example` (`cp .env.example .env`)
- `yarn install`
- Run the server
  ```bash
  yarn start
  ```
- Navigate to [http://localhost:3000/documentation](http://localhost:3000/documentation) to access Swagger documentation for the API and play around with it

## Code Walkthrough
In `App.js`, we begin by registering the `HapiAuthToken` plugin, and in the `_configureAuth` method, we configure an authentication strategy using the plugin.
The authentication strategy overrides some of the cookie options to set the auth cookie name to `__AUTH`, and marks it an insecure cookie (to allow it to be accessed over HTTP in the demo application).
You can turn off cookie authentication by simply setting `cookie: false` in these options.
Similarly, `header: false` and `query: false` will respectively turn off `Authorization` header and query parameter token authentication.

The most important options in strategy configuration are the `validateToken` and `buildAuthCredentials` functions.
The plugin will extract an authentication token from the request, and call `validateToken` with it.
`validateToken` is expected to validate this token and respond back with a boolean indicating whether the token is valid.
If `validateToken` returns true, then the plugin calls the `buildAuthCredentials` function with the same auth token.
`buildAuthCredentials` is expected to return a JSON object, which will be set as the auth credentials for the current request.
This object will be accessible as `request.auth.credentials` in the route endpoints (if the token was successfully validated).

In this implementation, `valiadteToken` simply uses the `jsonwebtoken` package to validate that the
supplied token is a valid JWT token, and that it has a `user` attribute.

`AuthenticationController` has a `login` route which tries to match the supplied `username` and `password` against the user credentials configured in ENV.
If the credentials match:
  - it generates a JWT token containing the username
  - returns this JWT token as the auth token
  - also sets this token on the auth cookie

This is just an example implementation. The key here is the authentication strategy configuration, and particularly the `validateToken` and `buildAuthCredentials` methods.
In addition, if you choose to support cookie authentication, remember to set the session/auth token on your auth cookie in your authentication controller (see `AuthenticationController#_create` for example).

## To try out the API
- Start the server (`yarn start`)
- Open the swagger documentation ([http://localhost:3000/documentation](http://localhost:3000/documentation))
- Invoke the `/login` endpoint with:
  ```json
  {
    "username": "aUser",
    "password": "aPassword"
  }
  ```
- Take note of the token returned by this request
- Invoke `/protected` with this token in either the authorization header (`Authorization: Token <token-value>`) or the `token` query parameter
- `/protected` should respond back with a `200`
