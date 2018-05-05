# setProtocol.js
{Set} Protocol Library for Interacting With Smart Contracts

Note: This is pre-alpha software. Things will constantly be changing and getting updated.

Build the project by performing the following:
```shell
$ yarn run build
```

## Installation
Using npm:
```shell
$ npm i -g npm
$ npm i --save setprotocol.js
```
Using yarn:
```shell
$ brew install yarn
$ yarn add setprotocol.js
```

In Node.js:
```js
// Import
import SetProtocol from 'setprotocol.js';

// or
const SetProtocol = require('setprotocol.js');

// Like with web3, instantiate a new instance and pass in the provider
const setProtocolInstance = new SetProtocol(currentProvider);
```

For now, you will have to look at the source code itself for documentation, but we will be working to provide a rich set of documentation for this.

## Testing
##### Compile & Migrate Contracts

Start `testrpc` and setup dependencies:
```
yarn chain
```
Wait until the `dependency migration complete` message appears before interacting with the contracts.

#### Testing
```
yarn test:watch
```

## Troubleshooting
Do not use Node version 10+ as it may have issues during `npm install` or `yarn install` with the `sha3` package.  Use `nvm install 9.11.1 && nvm use 9.11.1` for now.
You also will need to be on `ganache-cli@6.0.3`.  Newer versions may work but some of the newer ones do not work so it is currently pegged to an earlier version.

## setProtocol.js API Reference
* [contracts](documentation/classes/_contracts_api_.contractsapi.md)
  * [getERC20TokenCacheKey](documentation/classes/_contracts_api_.contractsapi.md#geterc20tokencachekey)
  * [getSetTokenCacheKey](documentation/classes/_contracts_api_.contractsapi.md#getsettokencachekey)
  * [loadERC20TokenAsync](documentation/classes/_contracts_api_.contractsapi.md#loaderc20tokenasync)
  * [loadSetTokenAsync](documentation/classes/_contracts_api_.contractsapi.md#loadsettokenasync)
* [erc20](documentation/classes/_erc20_api_.erc20api.md)
  * [getDecimals](documentation/classes/_erc20_api_.erc20api.md#getdecimals)
  * [getTokenName](documentation/classes/_erc20_api_.erc20api.md#gettokenname)
  * [getTokenSymbol](documentation/classes/_erc20_api_.erc20api.md#gettokensymbol)
  * [getTotalSupply](documentation/classes/_erc20_api_.erc20api.md#gettotalsupply)
  * [getUserBalance](documentation/classes/_erc20_api_.erc20api.md#getuserbalance)
  * [getUserBalancesForTokens](documentation/classes/_erc20_api_.erc20api.md#getuserbalancesfortokens)
  * [setAllowanceAsync](documentation/classes/_erc20_api_.erc20api.md#setallowanceasync)
  * [setUnlimitedAllowanceAsync](documentation/classes/_erc20_api_.erc20api.md#setunlimitedallowanceasync)
  * [transferAsync](_erc20_api_.erc20api.md#transferasync)

* [setToken](documentation/classes/_set_token_api_.settokenapi.md)
  * [getComponents](documentation/classes/_set_token_api_.settokenapi.md#getcomponents)
  * [getNaturalUnit](documentation/classes/_set_token_api_.settokenapi.md#getnaturalunit)
  * [issueSetAsync](documentation/classes/_set_token_api_.settokenapi.md#issuesetasync)
  * [redeemSetAsync](documentation/classes/_set_token_api_.settokenapi.md#redeemsetasync)
