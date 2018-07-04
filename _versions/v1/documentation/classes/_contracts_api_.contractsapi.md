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

*Defined in [contracts_api.ts:26](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L26)*

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

*Defined in [contracts_api.ts:24](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L24)*

___
<a id="cache"></a>

### `<Private>` cache

**● cache**: *`object`*

*Defined in [contracts_api.ts:26](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L26)*

#### Type declaration

[contractName: `string`]: `ContractWrapper`

___
<a id="provider"></a>

### `<Private>` provider

**● provider**: *`Web3`*

*Defined in [contracts_api.ts:23](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L23)*

___

## Methods

<a id="geterc20tokencachekey"></a>

### `<Private>` getERC20TokenCacheKey

▸ **getERC20TokenCacheKey**(tokenAddress: *`string`*): `string`

*Defined in [contracts_api.ts:78](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L78)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 

**Returns:** `string`

___
<a id="getsettokencachekey"></a>

### `<Private>` getSetTokenCacheKey

▸ **getSetTokenCacheKey**(tokenAddress: *`string`*): `string`

*Defined in [contracts_api.ts:82](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L82)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| tokenAddress | `string` | 

**Returns:** `string`

___
<a id="loaderc20tokenasync"></a>

###  loadERC20TokenAsync

▸ **loadERC20TokenAsync**(tokenAddress: *`string`*, transactionOptions?: *`object`*): `Promise`<`ERC20Contract`>

*Defined in [contracts_api.ts:58](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L58)*

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

*Defined in [contracts_api.ts:34](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/contracts_api.ts#L34)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| setTokenAddress | `string` | - | 
| `Default value` transactionOptions | `object` |  {} | 

**Returns:** `Promise`<`SetTokenContract`>

___

