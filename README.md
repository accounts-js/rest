# rest

REST client and server for accounts.

[![npm](https://img.shields.io/npm/v/@accounts/rest.svg?maxAge=2592000)](https://www.npmjs.com/package/@accounts/rest) [![CircleCI](https://circleci.com/gh/js-accounts/rest.svg?style=svg)](https://circleci.com/gh/js-accounts/rest) [![Coverage Status](https://coveralls.io/repos/github/js-accounts/rest/badge.svg?branch=master)](https://coveralls.io/github/js-accounts/rest?branch=master) ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## Getting Started

```
npm i -S @accounts/rest-express
```

```javascript
import express from 'express';
import bodyParser from 'body-parser';
import { AccountsServer } from '@accounts/server';
import accountsExpress from '@accounts/rest-express';

const app = express()
app.use(bodyParser.json());

const accountsServer = new AccountsServer({ ...options });
const accountsExpressOptions = { ...options };
app.use(accountsExpress(accountsServer, accountsExpressOptions));
```
