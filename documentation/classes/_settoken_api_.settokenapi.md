[setprotocol.js](../README.md) > ["setToken_api"](../modules/_settoken_api_.md) > [SetTokenAPI](../classes/_settoken_api_.settokenapi.md)

# Class: SetTokenAPI

## Hierarchy

**SetTokenAPI**

## Index

### Constructors

* [constructor](_settoken_api_.settokenapi.md#constructor)

### Properties

* [assert](_settoken_api_.settokenapi.md#assert)
* [contracts](_settoken_api_.settokenapi.md#contracts)
* [provider](_settoken_api_.settokenapi.md#provider)

### Methods

* [getComponents](_settoken_api_.settokenapi.md#getcomponents)
* [getNaturalUnit](_settoken_api_.settokenapi.md#getnaturalunit)
* [issueSetAsync](_settoken_api_.settokenapi.md#issuesetasync)
* [redeemSetAsync](_settoken_api_.settokenapi.md#redeemsetasync)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new SetTokenAPI**(web3: *`Web3`*, contracts: *[ContractsAPI](_contracts_api_.contractsapi.md)*): [SetTokenAPI](_settoken_api_.settokenapi.md)

*Defined in [setToken_api.ts:28](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L28)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| web3 | `Web3` | 
| contracts | [ContractsAPI](_contracts_api_.contractsapi.md) | 

**Returns:** [SetTokenAPI](_settoken_api_.settokenapi.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [setToken_api.ts:27](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L27)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contracts_api_.contractsapi.md)*

*Defined in [setToken_api.ts:28](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L28)*

___
<a id="provider"></a>

### `<Private>` provider

**● provider**: *`Web3`*

*Defined in [setToken_api.ts:26](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L26)*

___

## Methods

<a id="getcomponents"></a>

###  getComponents

▸ **getComponents**(setAddress: *`Address`*): `Promise`<[Component](../interfaces/_settoken_api_.component.md)[]>

*Defined in [setToken_api.ts:42](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L42)*

Asynchronously retrieve a Set's components

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address the address of the Set |

**Returns:** `Promise`<[Component](../interfaces/_settoken_api_.component.md)[]>
a promise with the list of Components, an object with the address and unit

___
<a id="getnaturalunit"></a>

###  getNaturalUnit

▸ **getNaturalUnit**(setAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [setToken_api.ts:64](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L64)*

Retrieves the natural Unit for the Set @param setAddress Address the address of the Set @return a promise with the Natural Unit

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 

**Returns:** `Promise`<`BigNumber`>

___
<a id="issuesetasync"></a>

###  issueSetAsync

▸ **issueSetAsync**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, userAddress: *`Address`*): `Promise`<`string`>

*Defined in [setToken_api.ts:76](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L76)*

Asynchronously issues a particular quantity of tokens from a particular Sets @param setAddress Address the address of the Set @param quantityInWei The amount in Wei; This should be a multiple of the natural Unit @param userAddress The user address

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

*Defined in [setToken_api.ts:101](https://github.com/SetProtocol/setProtocol.js/blob/d672f9f/src/api/setToken_api.ts#L101)*

Asynchronously redeems a particular quantity of tokens from a particular Sets @param setAddress Address the address of the Set @param quantityInWei The amount in Wei; This should be a multiple of the natural Unit @param userAddress The user address

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 
| quantityInWei | `BigNumber` | 
| userAddress | `Address` | 

**Returns:** `Promise`<`string`>

___

