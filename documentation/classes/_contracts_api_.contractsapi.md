[setprotocol.js](../README.md) > ["contracts_api"](../modules/_contracts_api_.md) > [ContractsAPI](../classes/_contracts_api_.contractsapi.md)

# Class: ContractsAPI

## Hierarchy

**ContractsAPI**

## Index

### Constructors

* [constructor](_contracts_api_.contractsapi.md#constructor)

### Properties

* [assert](_contracts_api_.contractsapi.md#assert)
* [cache](_contracts_api_.contractsapi.md#cache)
* [provider](_contracts_api_.contractsapi.md#provider)

### Methods

* [getERC20TokenCacheKey](_contracts_api_.contractsapi.md#geterc20tokencachekey)
* [getSetTokenCacheKey](_contracts_api_.contractsapi.md#getsettokencachekey)
* [loadERC20TokenAsync](_contracts_api_.contractsapi.md#loaderc20tokenasync)
* [loadSetTokenAsync](_contracts_api_.contractsapi.md#loadsettokenasync)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ContractsAPI**(provider: *`Web3`*): [ContractsAPI](_contracts_api_.contractsapi.md)

*Defined in [contracts_api.ts:33](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L33)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| provider | `Web3` | 

**Returns:** [ContractsAPI](_contracts_api_.contractsapi.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [contracts_api.ts:31](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L31)*

___
<a id="cache"></a>

### `<Private>` cache

**● cache**: *`object`*

*Defined in [contracts_api.ts:33](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L33)*

#### Type declaration

[contractName: `string`]: `ContractWrapper`

___
<a id="provider"></a>

### `<Private>` provider

**● provider**: *`Web3`*

*Defined in [contracts_api.ts:30](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L30)*

___

## Methods

<a id="geterc20tokencachekey"></a>

### `<Private>` getERC20TokenCacheKey

▸ **getERC20TokenCacheKey**(tokenAddress: *`string`*): `string`

*Defined in [contracts_api.ts:93](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L93)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 

**Returns:** `string`

___
<a id="getsettokencachekey"></a>

### `<Private>` getSetTokenCacheKey

▸ **getSetTokenCacheKey**(tokenAddress: *`string`*): `string`

*Defined in [contracts_api.ts:97](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L97)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 

**Returns:** `string`

___
<a id="loaderc20tokenasync"></a>

###  loadERC20TokenAsync

▸ **loadERC20TokenAsync**(tokenAddress: *`string`*, transactionOptions?: *`object`*): `Promise`<`ERC20Contract`>

*Defined in [contracts_api.ts:69](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L69)*

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

*Defined in [contracts_api.ts:41](https://github.com/SetProtocol/setProtocol.js/blob/8bde908/src/api/contracts_api.ts#L41)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| setTokenAddress | `string` | - | 
| `Default value` transactionOptions | `object` |  {} | 

**Returns:** `Promise`<`SetTokenContract`>

___

