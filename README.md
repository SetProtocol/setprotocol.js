<p align="center"><img src="https://s3-us-west-1.amazonaws.com/set-protocol/img/assets/set-protocol-logo.png" width="64" /></p>

<p align="center">
  <a href="https://circleci.com/gh/SetProtocol/setprotocol.js/tree/master" target="_blank" rel="noopener">
    <img src="https://circleci.com/gh/SetProtocol/setprotocol.js.svg" />
  </a>
  <a href='https://github.com/SetProtocol/setProtocol.js/blob/master/LICENSE' target="_blank" rel="noopener">
    <img src='https://img.shields.io/badge/License-Apache%202.0-blue.svg' alt='License' />
  </a>
  <a href='https://www.npmjs.com/package/setprotocol.js'>
    <img src='https://img.shields.io/npm/v/setprotocol.js.svg' alt='NPM' />
  </a>
</p>

# setprotocol.js
`setprotocol.js` is a library for interacting with Set Protocol smart contracts.
This library enables you to create, issue, redeem, and create and fill issuance orders for Sets. You can find extensive documentation [here](https://docs.setprotocol.com/).

<a href="https://t.me/joinchat/Fx8D6wyprLUlM1jMVnaRdg" target="_blank" rel="noopener">
  Join us on Telegram
</a>

Note: This is Alpha software, and is subject to non-backwards compatible changes.
## :computer: Installation
### setprotocol.js
##### Using yarn:
```shell
$ yarn add setprotocol.js@^1.0.0-alpha.18
```
##### Using npm:
```shell
$ npm i --save setprotocol.js@^1.0.0-alpha.18
```

### web3 & bignumber
We also need `web3@0.20.6` and `bignumber.js@^4.1.0`.

`web3 ^1.0.0` and `bignumber.js@^5.0.0` introduce breaking changes that don’t work with the current version of setprotocol.js at the moment. You can install the dependencies like this:
```shell
yarn add web3@0.20.6
yarn add bignumber.js@^4.1.0
```

##### Setup
To initialize a `SetProtocol` instance, we need to first import our library and initialize a web3 instance([learn how to set that up here](https://github.com/ethereum/web3.js/)), and 4 addresses of the Set smart contracts that’ll be provided below:

## :raising_hand: Contributing
### Testing
##### Compile & Migrate Contracts

Start `testrpc` and setup dependencies:
```
yarn chain
```
Wait until the `dependency migration complete` message appears before interacting with the contracts.
In a new terminal window, run:
```
yarn test:watch
```

## Troubleshooting
Do not use Node version 10+ as it may have issues during `npm install` or `yarn install` with the `sha3` package.  Use `nvm install 9.11.1 && nvm use 9.11.1` for now.

Occasionally, you may need to run `yarn run chain --reset` or just re-run `yarn chain` to make sure that you have up to date contracts after running `yarn install` with an update to the `set-protocol-contracts` package.
