# FFDC OAuth2 Back-end for B2B and B2C

Simple back-end to use with [fusionfabric.cloud](https://www.fusionfabric.cloud) [api](https://developer.fusionfabric.cloud)
This will serve any front-end or web pages disposed in the ```dist``` folder as well.
[Contact Author](mailto:pierre.quemard@finastra.com)

## Project setup

> This project has little to no dependency, it will use cache token until expiration.
> The project will also serve any website put in the ```dist``` folder.
> That allow simple integration to existing *vuejs* or any other framework project.
> Token Lifecycle is manage we need to add REFRESH system.

### Install

Make sure you have [nodejs](https://nodejs.org/en/) installed.

Load dependencies for the project
```
npm install
```


### Deploy locally

> Assuming you want to deploy to an existing nodejs framework like *vuejs*

Copy files from ```src``` directory inside your project.

Add dependencies:
* axios
* dotenv
* express
* (Dev-only) nodemon

```bash
npm install axios 
npm install dotenv
npm install express
npm install --save-dev nodemon
```

Add a *start server* section in your ```package.json```

```json
  "scripts": {
    "test": "npx nodemon --exec node -r dotenv/config ./src/server.js",
    "run": "node -r dotenv/config ./src/server.js",
    "build": "babel ./src --out-dir ./build"
  }
```

### Configure

Set ```.env``` file

```bash
# FFDC Related details
CLIENT_ID_B2C=
CLIENT_SECRET_B2C=
CLIENT_ID_B2B=
CLIENT_SECRET_B2B=
TOKEN_URL=https://api.fusionfabric.cloud/login/v1/sandbox/oidc/token
AUTH_URL=https://api.fusionfabric.cloud/login/v1/sandbox/oidc/authorize
CALLBACK_URL=http://localhost:8000/callback

# Server configuration
BACK_PORT=A_NUMBER
```

## Usage

### Test and run

Test back-end on configured port
```
npm run test
```

### Compile project

> Optionally you can compile the project with babel or any other compiler providing the right dependencies.
> This project being as simple as possible we did not use compiler to test.

Build the backend to the *build* directory
```
npm run build
```

## Libraries

### Native OAuth2 B2B *client_credentials* library

> Allow to get token from the id generated in FFDC.
> Will cache token locally until expiry.

Import the Authenticator library:
```js
const Authenticator = require('./authenticator.js');
```

Either specify *client_id*, *client_secret* and *token_url*
```js
const myAuth = new Authenticator('client_id', 'client_secret', 'token_url');
```
Or it will load from ```.env``` file
```js
const myAuth = new Authenticator();
```

Call the method to access the token:
```js
var token = await myAuth.getToken();
```
This will return the following json:

```json
{
    token: "MY_SECRET_TOKEN"
}
```

### Native OAuth B2C *authorization_code* library

> Allow to get token from the id generated in FFDC.
> Will cache token locally until expiry.
> You will need to manage redirection on your web server

Import the Authenticator library:
```js
const Authorization = require('./authorization.js');
```

Either specify *client_id*, *client_secret* and *token_url*
```js
const myAuth = new Authorization(client_id, client_secret, token_url, auth_url, callback_url);
```
Or it will load from ```.env``` file
```js
const myAuth = new Authorization();
```

Make sure you redirect to the proper url when getting login (example with express)
```js
app.get('/api/b2c/login',(req, res) => {
    // Redirecting to the right URL
    var URL = B2C.getURL();
    res.redirect(URL);
})
```
Implement the callback Method
```js
app.get('/callback', async (req, res) => {
    
    if (req.query.code) {
        try {
            var token = await B2C.getToken(req.query.code);
            console.log(token);
            res.setHeader('Content-Type', 'application/json');
            res.json(token);
        } catch(err) {
            res.status(500).send(err);
        };   

    } else {
        res.status(500)
        res.send("could not get authorization code");
    }
})
```
This will return the following json:

```json
{
    token: "MY_SECRET_TOKEN"
}
```



### FFDC Call library

> Provide token, data and url to call FFDC and manage response.

Import the FFDC lib:
```js
const FFDC = require('./ffdc.js');
```
Initiate FFDC with a *token*
```js
const myCalltoFFDC = new FFDC("JWT_TOKEN");
```

Call to FFDC with the *data* and *url* **Careful this is an asyncronous function**
```js
const result = await ffdc.callAPI(url, data);
```

### MISC

If you navigate to [localhost:8000](http://localhost:8000) you will have a sample web application that use payment APIs from FFDC.


