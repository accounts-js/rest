# rest

REST client and server for accounts.

[![CircleCI](https://circleci.com/gh/accounts-js/rest.svg?style=svg)](https://circleci.com/gh/accounts-js/rest)
[![codecov](https://codecov.io/gh/accounts-js/rest/branch/master/graph/badge.svg)](https://codecov.io/gh/accounts-js/rest)
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## Getting Started

```
npm i -S @accounts/rest-express
```

```javascript
import express from 'express';
import bodyParser from 'body-parser';
import { AccountsServer } from '@accounts/server';
import accountsExpress from '@accounts/rest-express';

const app = express();
app.use(bodyParser.json());

const accountsServer = new AccountsServer({ ...options });
const accountsExpressOptions = { ...options };
app.use(accountsExpress(accountsServer, accountsExpressOptions));
```
