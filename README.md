<p align="center"><img src="https://s3-us-west-1.amazonaws.com/set-protocol/img/assets/set-protocol-logo.png" width="64" /></p>

<p align="center">
  <a href="https://circleci.com/gh/SetProtocol/setProtocol.js/tree/master" target="_blank" rel="noopener">
    <img src="https://img.shields.io/circleci/project/github/SetProtocol/setProtocol.js/master.svg" />
  </a>
  <a href='https://github.com/SetProtocol/setProtocol.js/blob/master/LICENSE' target="_blank" rel="noopener">
    <img src='https://img.shields.io/github/license/SetProtocol/setProtocol.js.svg' alt='License' />
  </a>
</p>

# setProtocol.js
Welcome Settler of Tokan :wave: setProtocol.js is a library for interacting with Set Protocol smart contracts.
This library enables you to create, issue, redeem, and create/fill orders for Sets.

<a href="https://join.slack.com/t/setprotocol/shared_invite/enQtMjYzNjk4MzI1NzgxLWRlYzhkY2JlNjQ4YmU4OTUwZWQ5NzdkZjM3ZDVlNzU1MTJmZWM1NTNmM2JlYmE5YzljZjFmZTBhNzkyN2M1MzQ" target="_blank" rel="noopener">
  Join us on Slack
</a>

Note: This is pre-alpha software. Things will constantly be changing and getting updated.
## :computer: Installation
##### Using yarn:
```shell
$ yarn add setprotocol.js
```
##### Using npm:
```shell
$ npm i --save setprotocol.js
```

##### Setup
```js
// Import
import SetProtocol from 'setprotocol.js';

const setProtocol = new SetProtocol(
  web3,    // web3: A web3 instance you've instantiated from `new Web3(currentProvider)`
  '0x...', // coreAddress: Address of the Set Protocol Core contract
  '0x...', // transferProxyAddress: Address of the Set Protocol Transfer Proxy contract
  '0x...', // vaultAddress: Address of the Set Protocol Vault contract
);
```

##### Usage
The instantiated object from `new SetProtocol(...)` contains multiple child interfaces. Those interfaces are below:
```js
/* Core
 * 
 * Example of calling `create` method
 */
setProtocol.core.create(...);

/* Set Token
 * 
 * Example of calling `getBalanceOf` method
 */
setProtocol.setToken.getBalanceOf(...);

/* Vault
 * 
 * Example of calling `getOwnerBalance` method
 */
setProtocol.vault.getOwnerBalance(...);
```

We have API docs below. Stay tuned for a rich set of designed documentation that's currently being built.

## :rocket: setProtocol.js API Reference
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
  * [createSignedIssuanceOrder](documentation/classes/_coreapi_.coreapi.md#createsignedissuanceorder)
  * [fillIssuanceOrder](documentation/classes/_coreapi_.coreapi.md#fillissuanceorder)
  * [cancelIssuanceOrder](documentation/classes/_coreapi_.coreapi.md#cancelissuanceorder)

* [setToken](documentation/classes/_settokenapi_.settokenapi.md)
  * [getBalanceOf](documentation/classes/_settokenapi_.settokenapi.md#getbalanceof)
  * [getComponents](documentation/classes/_settokenapi_.settokenapi.md#getcomponents)
  * [getName](documentation/classes/_settokenapi_.settokenapi.md#getname)
  * [getNaturalUnit](documentation/classes/_settokenapi_.settokenapi.md#getnaturalunit)
  * [getSymbol](documentation/classes/_settokenapi_.settokenapi.md#getsymbol)
  * [getTotalSupply](documentation/classes/_settokenapi_.settokenapi.md#gettotalsupply)
  * [getUnits](documentation/classes/_settokenapi_.settokenapi.md#getunits)

* [contracts](documentation/classes/_contractsapi_.contractsapi.md)
  * [getCoreCacheKey](documentation/classes/_contractsapi_.contractsapi.md#getcorecachekey)
  * [getSetTokenCacheKey](documentation/classes/_contractsapi_.contractsapi.md#getsettokencachekey)
  * [getVaultCacheKey](documentation/classes/_contractsapi_.contractsapi.md#getvaultcachekey)
  * [loadCoreAsync](documentation/classes/_contractsapi_.contractsapi.md#loadcoreasync)
  * [loadSetTokenAsync](documentation/classes/_contractsapi_.contractsapi.md#loadsettokenasync)
  * [loadVaultAsync](documentation/classes/_contractsapi_.contractsapi.md#loadvaultasync)

* [vault](documentation/classes/_vaultapi_.vaultapi.md)
  * [getOwnerBalance](documentation/classes/_vaultapi_.vaultapi.md#getownerbalance)

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

You also will need to be on `ganache-cli@6.0.3`.  Newer versions may work but some of the newer ones do not work so it is currently pegged to an earlier version.

Occasionally, you may need to run `yarn run chain --reset` or just re-run `yarn chain` to make sure that you have up to date contracts after running `yarn install` with an update to the `set-protocol-contracts` package.
