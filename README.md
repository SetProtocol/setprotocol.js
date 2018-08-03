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

Occasionally, you may need to run `yarn run chain --reset` or just re-run `yarn chain` to make sure that you have up to date contracts after running `yarn install` with an update to the `set-protocol-contracts` package.

## setProtocol.js API Reference
* [Core](documentation/classes/_coreapi_.coreapi.md)
  * [create](documentation/classes/_coreapi_.coreapi.md#create)
  * [issue](documentation/classes/_coreapi_.coreapi.md#issue)
  * [redeem](documentation/classes/_coreapi_.coreapi.md#redeem)
  * [redeemAndWithdraw](documentation/classes/_coreapi_.coreapi.md#redeemandwithdraw)
  * [deposit](documentation/classes/_coreapi_.coreapi.md#deposit)
  * [batchDeposit](documentation/classes/_coreapi_.coreapi.md#batchdeposit)
  * [withdraw](documentation/classes/_coreapi_.coreapi.md#withdraw)
  * [batchWithdraw](documentation/classes/_coreapi_.coreapi.md#batchwithdraw)
  * [getExchangeAddress](documentation/classes/_coreapi_.coreapi.md#getexchangeaddress)
  * [getFactories](documentation/classes/_coreapi_.coreapi.md#getfactories)
  * [getIsValidFactory](documentation/classes/_coreapi_.coreapi.md#getisvalidfactory)
  * [getIsValidSet](documentation/classes/_coreapi_.coreapi.md#getisvalidset)
  * [getSetAddresses](documentation/classes/_coreapi_.coreapi.md#getsetaddresses)
  * [getTransferProxyAddress](documentation/classes/_coreapi_.coreapi.md#gettransferproxyaddress)
  * [getVaultAddress](documentation/classes/_coreapi_.coreapi.md#getvaultaddress)

* [setToken](documentation/classes/_settokenapi_.settokenapi.md)
  * [getBalanceOf](documentation/classes/_settokenapi_.settokenapi.md#getbalanceof)
  * [getComponents](documentation/classes/_settokenapi_.settokenapi.md#getcomponents)
  * [getName](documentation/classes/_settokenapi_.settokenapi.md#getname)
  * [getNaturalUnit](documentation/classes/_settokenapi_.settokenapi.md#getnaturalunit)
  * [getSymbol](documentation/classes/_settokenapi_.settokenapi.md#getsymbol)
  * [getTotalSupply](documentation/classes/_settokenapi_.settokenapi.md#gettotalsupply)
  * [getUnits](documentation/classes/_settokenapi_.settokenapi.md#getunits)

* [contracts](documentation/classes/_contracts_api_.contractsapi.md)
  * [getCoreCacheKey](documentation/classes/_contractsapi_.contractsapi.md#getcorecachekey)
  * [getSetTokenCacheKey](documentation/classes/_contractsapi_.contractsapi.md#getsettokencachekey)
  * [getVaultCacheKey](documentation/classes/_contractsapi_.contractsapi.md#getvaultcachekey)
  * [loadCoreAsync](documentation/classes/_contractsapi_.contractsapi.md#loadcoreasync)
  * [loadSetTokenAsync](documentation/classes/_contractsapi_.contractsapi.md#loadsettokenasync)
  * [loadVaultAsync](documentation/classes/_contractsapi_.contractsapi.md#loadvaultasync)

* [vault](documentation/classes/_vaultapi_.vaultapi.md)
  * [getOwnerBalance](documentation/classes/_vaultapi_.vaultapi.md#getownerbalance)

