[setprotocol.js](../README.md) > ["set_token_api"](../modules/_set_token_api_.md) > [SetTokenAPI](../classes/_set_token_api_.settokenapi.md)

# Class: SetTokenAPI

## Hierarchy

**SetTokenAPI**

## Index

### Constructors

* [constructor](_set_token_api_.settokenapi.md#constructor)

### Properties

* [assert](_set_token_api_.settokenapi.md#assert)
* [contracts](_set_token_api_.settokenapi.md#contracts)
* [provider](_set_token_api_.settokenapi.md#provider)

### Methods

* [getComponents](_set_token_api_.settokenapi.md#getcomponents)
* [getNaturalUnit](_set_token_api_.settokenapi.md#getnaturalunit)
* [issueSetAsync](_set_token_api_.settokenapi.md#issuesetasync)
* [redeemSetAsync](_set_token_api_.settokenapi.md#redeemsetasync)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new SetTokenAPI**(web3: *`Web3`*, contracts: *[ContractsAPI](_contracts_api_.contractsapi.md)*): [SetTokenAPI](_set_token_api_.settokenapi.md)

*Defined in [set_token_api.ts:21](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L21)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| web3 | `Web3` | 
| contracts | [ContractsAPI](_contracts_api_.contractsapi.md) | 

**Returns:** [SetTokenAPI](_set_token_api_.settokenapi.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [set_token_api.ts:20](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L20)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contracts_api_.contractsapi.md)*

*Defined in [set_token_api.ts:21](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L21)*

___
<a id="provider"></a>

### `<Private>` provider

**● provider**: *`Web3`*

*Defined in [set_token_api.ts:19](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L19)*

___

## Methods

<a id="getcomponents"></a>

###  getComponents

▸ **getComponents**(setAddress: *`Address`*): `Promise`<`Component`[]>

*Defined in [set_token_api.ts:35](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L35)*

Asynchronously retrieve a Set's components

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address the address of the Set |

**Returns:** `Promise`<`Component`[]>
a promise with the list of Components, an object with the address and unit

___
<a id="getnaturalunit"></a>

###  getNaturalUnit

▸ **getNaturalUnit**(setAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [set_token_api.ts:60](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L60)*

Retrieves the natural Unit for the Set

@param setAddress the address of the Set @return a promise with the Natural Unit

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 

**Returns:** `Promise`<`BigNumber`>

___
<a id="issuesetasync"></a>

###  issueSetAsync

▸ **issueSetAsync**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, userAddress: *`Address`*): `Promise`<`string`>

*Defined in [set_token_api.ts:74](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L74)*

Asynchronously issues a particular quantity of tokens from a particular Sets

@param setAddress Address the address of the Set @param quantityInWei The amount in Wei; This should be a multiple of the natural Unit @param userAddress The user address

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 
| quantityInWei | `BigNumber` | 
| userAddress | `Address` | 

**Returns:** `Promise`<`string`>

___
<a id="redeemsetasync"></a>

###  redeemSetAsync

▸ **redeemSetAsync**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, userAddress: *`Address`*): `Promise`<`string`>

*Defined in [set_token_api.ts:119](https://github.com/SetProtocol/setProtocol.js/blob/c2b6da0/src/api/set_token_api.ts#L119)*

Asynchronously redeems a particular quantity of tokens from a particular Sets

@param setAddress Address the address of the Set @param quantityInWei The amount in Wei; This should be a multiple of the natural Unit @param userAddress The user address

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 
| quantityInWei | `BigNumber` | 
| userAddress | `Address` | 

**Returns:** `Promise`<`string`>

___

