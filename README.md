# FFDC OAuth2 Back-end for B2B

Simple back-end to use with [fusionfabric.cloud](https://www.fusionfabric.cloud) [api](https://developer.fusionfabric.cloud)

[Contact Author](mailto:pierre.quemard@finastra.com)

## Project setup

> This project has little to no dependency, it does not manage refresh token life-cycle.

### Install

Make sure you have [nodejs](https://nodejs.org/en/) installed.

Load dependencies for the project
```
npm install
```

### Configure

Set ```.env``` file

```bash
# FFDC Related details
CLIENT_ID=MyClient_ID
CLIENT_SECRET=MyClient_Secret
TOKEN_URL=

# Server configuration
PORT=A_NUMBER
```

## Test and run

Test back-end on configured port
```
npm run test
```

## Compile project

> Optionally you can compile the project with babel or any other compiler providing the right dependencies.
> This project being as simple as possible we did not use compiler to test.

Build the backend to the *build* directory
```
npm run build
```


