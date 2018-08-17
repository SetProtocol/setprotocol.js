<p align="center"><img src="https://s3-us-west-1.amazonaws.com/set-protocol/img/assets/set-protocol-logo.png" width="64" /></p>

<p align="center">
  <a href="https://circleci.com/gh/SetProtocol/setProtocol.js/tree/master" target="_blank" rel="noopener">
    <img src="https://img.shields.io/circleci/project/github/SetProtocol/setProtocol.js/master.svg" />
  </a>
  <a href='https://github.com/SetProtocol/setProtocol.js/blob/master/LICENSE' target="_blank" rel="noopener">
    <img src='https://img.shields.io/github/license/SetProtocol/setProtocol.js.svg' alt='License' />
  </a>
</p>

# setprotocol.js
Welcome Settler of Tokan :wave: setprotocol.js is a library for interacting with Set Protocol smart contracts.
This library enables you to create, issue, redeem, and create/fill orders for Sets.

<a href="https://join.slack.com/t/setprotocol/shared_invite/enQtMjYzNjk4MzI1NzgxLWRlYzhkY2JlNjQ4YmU4OTUwZWQ5NzdkZjM3ZDVlNzU1MTJmZWM1NTNmM2JlYmE5YzljZjFmZTBhNzkyN2M1MzQ" target="_blank" rel="noopener">
  Join us on Slack
</a>

Note: This is pre-alpha software. Things will constantly be changing and getting updated.
## :computer: Installation
### setprotocol.js
##### Using yarn:
```shell
$ yarn add setprotocol.js@^1.0.0-alpha.1
```
##### Using npm:
```shell
$ npm i --save setprotocol.js@^1.0.0-alpha.1
```

### web3 & bignumber
We also need `web3@0.20.6` and `bignumber.js@^4.1.0`.

`web3 ^1.0.0` and `bignumber.js@^5.0.0` introduce breaking changes that don’t work with the current version of setprotocol.js at the moment. You can install the dependencies like this:
```shell
yarn add web3@0.20.6
yarn add bignumber.js@^4.1.0
```

##### Setup
Let’s initialize our `setProtocol` instance. We need to first import our library and instantiate the SetProtocol instance with a web3 instance([learn how to set that up here](https://github.com/ethereum/web3.js/)), and 3 addresses of the Set smart contracts that’ll be provided below:

### Instantiation
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

##### Kovan TestNet
* **ERC20Wrapper** - 0xe4c24cfb8db141caf381e997d8e481349b61bbd2
* **Vault** - 0x8956044921a7c4b16d0993a39c66cc4ee6ad2aac
* **Core** - 0xc375d365eaa16d75b61b4de09e1c3b2a4e5f53bc
* **TransferProxy** - 0x592ec19bd3d2faffb18d91b46ffa54252804af4c
* **SetTokenFactory** - 0xbd28d534213a4b8af537464d5f99cd3e9712d8cd
* **TakerWalletWrapper** - 0x389b8cf1fbe295a2ad99550199efba55ae064e52
* **ZeroExExchangeWrapper** - 0x777d7950468fe50563ee7603b70a0bf9a02bbe8d

##### Ropsten TestNet (0x Exchange unavailable)
* **ERC20Wrapper** - 0xc4d32a6ceccb24bc729013ec391c18df30f83af1
* **Core** - 0xfff8d0c92169c53ead06119fb0aeb3bccfbbbd4a
* **Vault** - 0x1e43c2b36b22b8c8bf1dc0812c65e35fdb6d4dd0
* **TransferProxy** - 0xdfdcd62311941fed657acae446525bafee85d80d
* **SetTokenFactory** - 0xeebaba65769084d176d1ff6fd6e6be3f8e9a63b7
* **TakerWalletWrapper** - 0x1e7c93a85c42fcddc538390875b22e4ffb3ee4f7
* **ZeroExExchangeWrapper** - N/A on Ropsten

##### Usage
The instantiated object from `new SetProtocol(...)` contains multiple child interfaces. Those interfaces are below:
### Example Calls
```js
/* Core
 * 
 * Example of calling `create` method
 */
const createTxHash = await setProtocol.core.create(
  '0xf62ff63768819731092a4ad392519c7e3f14666c', // User address
  '0xeebaba65769084d176d1ff6fd6e6be3f8e9a63b7', // Factory address
  ['0x32cf71b0fc074385da15f8405b7622d14e3690dd', '0x4b34bb7e210f5a462e8cd2d92555d1bd18d03bf2'], // Component addresses
  [new BigNumber(500000000000000000), new BigNumber(500000000000000000)], // Units in natural units
  new BigNumber(500000000000000000), // The natural unit, aka lowest number all component units can be divided by
  'FooSet', // Set name
  'FOO', // Set symbol
  // txOptions, optional
);

/* Set Token
 * 
 * Example of calling `getBalanceOf` method
 */
 const totalSupplyTxHash = await setProtocol.setToken.getTotalSupply(
  '0x5eb32b0099eF21cA70fee8AF561D39e952D8089A', // Set Address
);

/* Vault
 * 
 * Example of calling `getOwnerBalance` method
 */
 const ownerBalanaceTxHash = await setProtocol.vault.getOwnerBalance(
  '0xf62ff63768819731092a4ad392519c7e3f14666c', // User address
  '0x5eb32b0099eF21cA70fee8AF561D39e952D8089A', // Set Address
);
```

We have API docs below. Stay tuned for a rich set of designed documentation that's currently being built.

## :rocket: setprotocol.js API Reference
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
