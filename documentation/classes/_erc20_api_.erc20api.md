[setprotocol.js](../README.md) > ["erc20_api"](../modules/_erc20_api_.md) > [ERC20API](../classes/_erc20_api_.erc20api.md)

# Class: ERC20API

## Hierarchy

**ERC20API**

## Index

### Constructors

* [constructor](_erc20_api_.erc20api.md#constructor)

### Properties

* [assert](_erc20_api_.erc20api.md#assert)
* [contracts](_erc20_api_.erc20api.md#contracts)
* [provider](_erc20_api_.erc20api.md#provider)

### Methods

* [getDecimals](_erc20_api_.erc20api.md#getdecimals)
* [getTokenName](_erc20_api_.erc20api.md#gettokenname)
* [getTokenSymbol](_erc20_api_.erc20api.md#gettokensymbol)
* [getTotalSupply](_erc20_api_.erc20api.md#gettotalsupply)
* [getUserBalance](_erc20_api_.erc20api.md#getuserbalance)
* [getUserBalancesForTokens](_erc20_api_.erc20api.md#getuserbalancesfortokens)
* [setAllowanceAsync](_erc20_api_.erc20api.md#setallowanceasync)
* [setUnlimitedAllowanceAsync](_erc20_api_.erc20api.md#setunlimitedallowanceasync)
* [transferAsync](_erc20_api_.erc20api.md#transferasync)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ERC20API**(web3: *`Web3`*, contracts: *[ContractsAPI](_contracts_api_.contractsapi.md)*): [ERC20API](_erc20_api_.erc20api.md)

*Defined in [erc20_api.ts:24](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L24)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| web3 | `Web3` | 
| contracts | [ContractsAPI](_contracts_api_.contractsapi.md) | 

**Returns:** [ERC20API](_erc20_api_.erc20api.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [erc20_api.ts:23](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L23)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contracts_api_.contractsapi.md)*

*Defined in [erc20_api.ts:24](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L24)*

___
<a id="provider"></a>

### `<Private>` provider

**● provider**: *`Web3`*

*Defined in [erc20_api.ts:22](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L22)*

___

## Methods

<a id="getdecimals"></a>

###  getDecimals

▸ **getDecimals**(tokenAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [erc20_api.ts:80](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L80)*

Retrieves the decimals of an ERC20 token

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `Address` | 

**Returns:** `Promise`<`BigNumber`>

___
<a id="gettokenname"></a>

###  getTokenName

▸ **getTokenName**(tokenAddress: *`Address`*): `Promise`<`string`>

*Defined in [erc20_api.ts:35](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L35)*

Retrieves the token name of an ERC20 token

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `Address` | 

**Returns:** `Promise`<`string`>

___
<a id="gettokensymbol"></a>

###  getTokenSymbol

▸ **getTokenSymbol**(tokenAddress: *`Address`*): `Promise`<`string`>

*Defined in [erc20_api.ts:46](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L46)*

Retrieves the token symbol of an ERC20 token

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `Address` | 

**Returns:** `Promise`<`string`>

___
<a id="gettotalsupply"></a>

###  getTotalSupply

▸ **getTotalSupply**(tokenAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [erc20_api.ts:69](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L69)*

Retrieves the totalSupply or quantity of an ERC20 token

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `Address` | 

**Returns:** `Promise`<`BigNumber`>

___
<a id="getuserbalance"></a>

###  getUserBalance

▸ **getUserBalance**(tokenAddress: *`Address`*, userAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [erc20_api.ts:57](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L57)*

Retrieves the balance in wei of an ERC20 token for a user

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `Address` | 
| userAddress | `Address` | 

**Returns:** `Promise`<`BigNumber`>

___
<a id="getuserbalancesfortokens"></a>

###  getUserBalancesForTokens

▸ **getUserBalancesForTokens**(tokenAddresses: *`Address`[]*, userAddress: *`Address`*): `Promise`<`Object`[]>

*Defined in [erc20_api.ts:91](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L91)*

Given a list of tokens, retrieves the user balance as well as token metadata

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddresses | `Address`[] | 
| userAddress | `Address` | 

**Returns:** `Promise`<`Object`[]>

___
<a id="setallowanceasync"></a>

###  setAllowanceAsync

▸ **setAllowanceAsync**(tokenAddress: *`string`*, spender: *`string`*, allowance: *`BigNumber`*, userAddress: *`string`*): `Promise`<`string`>

*Defined in [erc20_api.ts:138](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L138)*

Asynchronously sets user allowance

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 
| spender | `string` | 
| allowance | `BigNumber` | 
| userAddress | `string` | 

**Returns:** `Promise`<`string`>

___
<a id="setunlimitedallowanceasync"></a>

###  setUnlimitedAllowanceAsync

▸ **setUnlimitedAllowanceAsync**(tokenAddress: *`string`*, spender: *`string`*, userAddress: *`string`*): `Promise`<`string`>

*Defined in [erc20_api.ts:161](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L161)*

Asynchronously sets user allowance to unlimited

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 
| spender | `string` | 
| userAddress | `string` | 

**Returns:** `Promise`<`string`>

___
<a id="transferasync"></a>

###  transferAsync

▸ **transferAsync**(tokenAddress: *`Address`*, from: *`Address`*, to: *`Address`*, value: *`BigNumber`*): `Promise`<`string`>

*Defined in [erc20_api.ts:116](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/erc20_api.ts#L116)*

Asynchronously transfers token

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `Address` | 
| from | `Address` | 
| to | `Address` | 
| value | `BigNumber` | 

**Returns:** `Promise`<`string`>

___

