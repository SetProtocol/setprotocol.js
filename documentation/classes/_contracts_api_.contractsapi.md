[setprotocol.js](../README.md) > ["contracts_api"](../modules/_contracts_api_.md) > [ContractsAPI](../classes/_contracts_api_.contractsapi.md)

# Class: ContractsAPI

## Hierarchy

**ContractsAPI**

## Index

### Constructors

* [constructor](_contracts_api_.contractsapi.md#constructor)

### Properties

* [cache](_contracts_api_.contractsapi.md#cache)
* [web3](_contracts_api_.contractsapi.md#web3)

### Methods

* [getERC20TokenCacheKey](_contracts_api_.contractsapi.md#geterc20tokencachekey)
* [getSetTokenCacheKey](_contracts_api_.contractsapi.md#getsettokencachekey)
* [loadERC20TokenAsync](_contracts_api_.contractsapi.md#loaderc20tokenasync)
* [loadSetTokenAsync](_contracts_api_.contractsapi.md#loadsettokenasync)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ContractsAPI**(web3: *`Web3`*): [ContractsAPI](_contracts_api_.contractsapi.md)

*Defined in [contracts_api.ts:28](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/contracts_api.ts#L28)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| web3 | `Web3` | 

**Returns:** [ContractsAPI](_contracts_api_.contractsapi.md)

___

## Properties

<a id="cache"></a>

### `<Private>` cache

**● cache**: *`object`*

*Defined in [contracts_api.ts:28](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/contracts_api.ts#L28)*

#### Type declaration

[contractName: `string`]: `ContractWrapper`

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [contracts_api.ts:26](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/contracts_api.ts#L26)*

___

## Methods

<a id="geterc20tokencachekey"></a>

### `<Private>` getERC20TokenCacheKey

▸ **getERC20TokenCacheKey**(tokenAddress: *`string`*): `string`

*Defined in [contracts_api.ts:83](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/contracts_api.ts#L83)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 

**Returns:** `string`

___
<a id="getsettokencachekey"></a>

### `<Private>` getSetTokenCacheKey

▸ **getSetTokenCacheKey**(tokenAddress: *`string`*): `string`

*Defined in [contracts_api.ts:87](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/contracts_api.ts#L87)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 

**Returns:** `string`

___
<a id="loaderc20tokenasync"></a>

###  loadERC20TokenAsync

▸ **loadERC20TokenAsync**(tokenAddress: *`string`*, transactionOptions?: *`object`*): `Promise`<`ERC20Contract`>

*Defined in [contracts_api.ts:59](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/contracts_api.ts#L59)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| tokenAddress | `string` | - | 
| `Default value` transactionOptions | `object` |  {} | 

**Returns:** `Promise`<`ERC20Contract`>

___
<a id="loadsettokenasync"></a>

###  loadSetTokenAsync

▸ **loadSetTokenAsync**(setTokenAddress: *`string`*, transactionOptions?: *`object`*): `Promise`<`SetTokenContract`>

*Defined in [contracts_api.ts:35](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/contracts_api.ts#L35)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| setTokenAddress | `string` | - | 
| `Default value` transactionOptions | `object` |  {} | 

**Returns:** `Promise`<`SetTokenContract`>

___

