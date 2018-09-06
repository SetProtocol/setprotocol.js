<p align="center"><img src="https://s3-us-west-1.amazonaws.com/set-protocol/img/assets/set-protocol-logo.png" width="64" /></p>

<p align="center">
  <a href="https://circleci.com/gh/SetProtocol/setProtocol.js/tree/master" target="_blank" rel="noopener">
    <img src="https://circleci.com/gh/SetProtocol/setProtocol.js.svg?style=shield&circle-token=cee06055215dbcea96800cb7d493a0b3faea9854" />
  </a>
  <a href='https://github.com/SetProtocol/setProtocol.js/blob/master/LICENSE' target="_blank" rel="noopener">
    <img src='https://img.shields.io/badge/License-Apache%202.0-blue.svg' alt='License' />
  </a>
</p>

# setprotocol.js
Welcome Settler of Tokan :wave: setprotocol.js is a library for interacting with Set Protocol smart contracts.
This library enables you to create, issue, redeem, and create/fill orders for Sets. You can find extensive documentation [here](https://docs.setprotocol.com/).

<a href="https://t.me/joinchat/Fx8D6wyprLUlM1jMVnaRdg" target="_blank" rel="noopener">
  Join us on Telegram
</a>

Note: This is pre-alpha software. Things will constantly be changing and getting updated.
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
Let’s initialize our `setProtocol` instance. We need to first import our library and instantiate the SetProtocol instance with a web3 instance([learn how to set that up here](https://github.com/ethereum/web3.js/)), and 3 addresses of the Set smart contracts that’ll be provided below:

### Instantiation
```js
// Import
import SetProtocol from 'setprotocol.js';

const config = {
  coreAddress: '0x...',             // Address of the Set Protocol Core contract
  transferProxyAddress: '0x...',    // Address of the Set Protocol Transfer Proxy contract
  vaultAddress: '0x...',            // Address of the Set Protocol Vault contract
  setTokenFactoryAddress: '0x...',            // Address of the Set Protocol Factory contract
};

const setProtocol = new SetProtocol(
  provider,    // provider: A web3 provider instance to communicate with an ethereum node
  config,
);
```

##### Kovan TestNet
* **ERC20Wrapper** - 0xa821885e297642707f6138d878a6423746c71dc6
* **Vault** - 0x014e9b34486cfa13e9a2d87028d38cd98f996c8c
* **Core** - 0x29f13822ece62b7a436a45903ce6d5c97d6e4cc9
* **TransferProxy** - 0xd50ddfed470cc13572c5246e71d4cfb4aba73def
* **SetTokenFactory** - 0x6c51d8dad8404dbd91e8ab063d21e85ddec9f626
* **RebalancingSetTokenFactory** - 0x756e082ab6ae4f57646b7a04f125e10d01ac1ba7
* **TakerWalletWrapper** - 0xafe3eee28d01c97688ca9fd207bd88258e71117f
* **ZeroExExchangeWrapper** - 0x54f83c35a11fe2389633808feb0284139049d878

##### Ropsten TestNet (0x Exchange unavailable)
* **ERC20Wrapper** - 0x114746cdc7481e07849d34cc0fe0db6e84a0cb0b
* **Core** - 0xcdb56f7d7ca4c53b507af0499abd683df283256a
* **Vault** - 0x6b6a3941b05dd1c2fd70e6c204d04cf8d5241d26
* **TransferProxy** - 0x85754cb8b4820c3b4cdae4f0ed804f33dd55b238
* **SetTokenFactory** - 0xa41e3f8179622054058486946dc97c46b7c6241f
* **RebalancingSetTokenFactory** - 0x1be5ba38bb74ed973a40732c1ee2d92b7b720a5c
* **TakerWalletWrapper** - 0x4f97502c7f161aa507f7cce50b94f17357e072de
* **ZeroExExchangeWrapper** - N/A on Ropsten

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
