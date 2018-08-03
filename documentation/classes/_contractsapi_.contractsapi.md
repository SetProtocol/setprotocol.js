[setprotocol.js](../README.md) > ["ContractsAPI"](../modules/_contractsapi_.md) > [ContractsAPI](../classes/_contractsapi_.contractsapi.md)

# Class: ContractsAPI

*__title__*: ContractsAPI

*__author__*: Set Protocol

The Contracts API handles all functions that load contracts

## Hierarchy

**ContractsAPI**

## Index

### Constructors

* [constructor](_contractsapi_.contractsapi.md#constructor)

### Properties

* [assert](_contractsapi_.contractsapi.md#assert)
* [cache](_contractsapi_.contractsapi.md#cache)
* [web3](_contractsapi_.contractsapi.md#web3)

### Methods

* [getCoreCacheKey](_contractsapi_.contractsapi.md#getcorecachekey)
* [getSetTokenCacheKey](_contractsapi_.contractsapi.md#getsettokencachekey)
* [getVaultCacheKey](_contractsapi_.contractsapi.md#getvaultcachekey)
* [loadCoreAsync](_contractsapi_.contractsapi.md#loadcoreasync)
* [loadSetTokenAsync](_contractsapi_.contractsapi.md#loadsettokenasync)
* [loadVaultAsync](_contractsapi_.contractsapi.md#loadvaultasync)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ContractsAPI**(web3: *`Web3`*): [ContractsAPI](_contractsapi_.contractsapi.md)

*Defined in [ContractsAPI.ts:40](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L40)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| web3 | `Web3` |

**Returns:** [ContractsAPI](_contractsapi_.contractsapi.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [ContractsAPI.ts:39](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L39)*

___
<a id="cache"></a>

### `<Private>` cache

**● cache**: *`object`*

*Defined in [ContractsAPI.ts:40](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L40)*

#### Type declaration

[contractName: `string`]: `ContractWrapper`

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [ContractsAPI.ts:38](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L38)*

___

## Methods

<a id="getcorecachekey"></a>

### `<Private>` getCoreCacheKey

▸ **getCoreCacheKey**(coreAddress: *`Address`*): `string`

*Defined in [ContractsAPI.ts:129](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L129)*

Creates a string used for accessing values in the core cache

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| coreAddress | `Address` |  Address of the Core contract to use |

**Returns:** `string`
The cache key

___
<a id="getsettokencachekey"></a>

### `<Private>` getSetTokenCacheKey

▸ **getSetTokenCacheKey**(setTokenAddress: *`Address`*): `string`

*Defined in [ContractsAPI.ts:139](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L139)*

Creates a string used for accessing values in the set token cache

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setTokenAddress | `Address` |  Address of the Set Token contract to use |

**Returns:** `string`
The cache key

___
<a id="getvaultcachekey"></a>

### `<Private>` getVaultCacheKey

▸ **getVaultCacheKey**(vaultAddress: *`Address`*): `string`

*Defined in [ContractsAPI.ts:149](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L149)*

Creates a string used for accessing values in the vault cache

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| vaultAddress | `Address` |  Address of the Vault contract to use |

**Returns:** `string`
The cache key

___
<a id="loadcoreasync"></a>

###  loadCoreAsync

▸ **loadCoreAsync**(coreAddress: *`Address`*, transactionOptions?: *`object`*): `Promise`<`CoreContract`>

*Defined in [ContractsAPI.ts:55](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L55)*

Load Core contract

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| coreAddress | `Address` | - |  Address of the Core contract |
| `Default value` transactionOptions | `object` |  {} |  Options sent into the contract deployed method |

**Returns:** `Promise`<`CoreContract`>
The Core Contract

___
<a id="loadsettokenasync"></a>

###  loadSetTokenAsync

▸ **loadSetTokenAsync**(setTokenAddress: *`Address`*, transactionOptions?: *`object`*): `Promise`<`SetTokenContract`>

*Defined in [ContractsAPI.ts:79](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L79)*

Load Set Token contract

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| setTokenAddress | `Address` | - |  Address of the Set Token contract |
| `Default value` transactionOptions | `object` |  {} |  Options sent into the contract deployed method |

**Returns:** `Promise`<`SetTokenContract`>
The Set Token Contract

___
<a id="loadvaultasync"></a>

###  loadVaultAsync

▸ **loadVaultAsync**(vaultAddress: *`Address`*, transactionOptions?: *`object`*): `Promise`<`VaultContract`>

*Defined in [ContractsAPI.ts:107](https://github.com/SetProtocol/setProtocol.js/blob/dda8209/src/api/ContractsAPI.ts#L107)*

Load Vault contract

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| vaultAddress | `Address` | - |  Address of the Vault contract |
| `Default value` transactionOptions | `object` |  {} |  Options sent into the contract deployed method |

**Returns:** `Promise`<`VaultContract`>
The Vault Contract

___

