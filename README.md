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

## setProtocol.js API Reference
* ERC20 exposes common functions for interacting with ERC20 Tokens.
  * getComponents(setAddress: Address): Promise<Component[]>
  * getNaturalUnit(setAddress: Address): Promise<BigNumber>
  * issueSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string>
  * redeemSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string>  
* setToken exposes common functions for issuing and redeeming Sets.
  * getTokenName(tokenAddress: Address): Promise<string>
  * getTokenSymbol(tokenAddress: Address): Promise<string>
  * getUserBalance(tokenAddress: Address, userAddress: Address): Promise<BigNumber>
  * getTotalSupply(tokenAddress: Address): Promise<BigNumber>
  * getDecimals(tokenAddress: Address): Promise<BigNumber>
  * getUserBalancesForTokens(tokenAddresses: Address[], userAddress: Address)
  * getUserBalancesForTokens(tokenAddresses: Address[], userAddress: Address)
  * setAllowanceAsync(tokenAddress: string, spender: string, allowance: BigNumber, userAddress: string): Promise<string>  
  * setUnlimitedAllowanceAsync(tokenAddress: string, spender: string, userAddress: string): Promise<string>  
