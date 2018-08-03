[setprotocol.js](../README.md) > ["SetTokenAPI"](../modules/_settokenapi_.md) > [SetTokenAPI](../classes/_settokenapi_.settokenapi.md)

# Class: SetTokenAPI

*__title__*: SetTokenAPI

*__author__*: Set Protocol

The Set Token API handles all functions on the Set Token smart contract.

## Hierarchy

**SetTokenAPI**

## Index

### Constructors

* [constructor](_settokenapi_.settokenapi.md#constructor)

### Properties

* [assert](_settokenapi_.settokenapi.md#assert)
* [contracts](_settokenapi_.settokenapi.md#contracts)
* [web3](_settokenapi_.settokenapi.md#web3)

### Methods

* [getBalanceOf](_settokenapi_.settokenapi.md#getbalanceof)
* [getComponents](_settokenapi_.settokenapi.md#getcomponents)
* [getName](_settokenapi_.settokenapi.md#getname)
* [getNaturalUnit](_settokenapi_.settokenapi.md#getnaturalunit)
* [getSymbol](_settokenapi_.settokenapi.md#getsymbol)
* [getTotalSupply](_settokenapi_.settokenapi.md#gettotalsupply)
* [getUnits](_settokenapi_.settokenapi.md#getunits)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new SetTokenAPI**(web3: *`Web3`*): [SetTokenAPI](_settokenapi_.settokenapi.md)

*Defined in [SetTokenAPI.ts:34](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L34)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| web3 | `Web3` |

**Returns:** [SetTokenAPI](_settokenapi_.settokenapi.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [SetTokenAPI.ts:33](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L33)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [SetTokenAPI.ts:34](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L34)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [SetTokenAPI.ts:32](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L32)*

___

## Methods

<a id="getbalanceof"></a>

###  getBalanceOf

▸ **getBalanceOf**(setAddress: *`string`*, userAddress: *`string`*): `number`

*Defined in [SetTokenAPI.ts:49](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L49)*

Gets balance of a user's Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `string` |  Address of the Set |
| userAddress | `string` |  Address of the user |

**Returns:** `number`
The balance of the user's Set

___
<a id="getcomponents"></a>

###  getComponents

▸ **getComponents**(setAddress: *`string`*): `string`[]

*Defined in [SetTokenAPI.ts:61](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L61)*

Gets component tokens that make up the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `string` |  Address of the Set |

**Returns:** `string`[]
An array of addresses

___
<a id="getname"></a>

###  getName

▸ **getName**(setAddress: *`string`*): `string`

*Defined in [SetTokenAPI.ts:72](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L72)*

Gets name of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `string` |  Address of the Set |

**Returns:** `string`
A string of the Set's name

___
<a id="getnaturalunit"></a>

###  getNaturalUnit

▸ **getNaturalUnit**(setAddress: *`string`*): `number`

*Defined in [SetTokenAPI.ts:83](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L83)*

Gets natural unit of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `string` |  Address of the Set |

**Returns:** `number`
The natural unit of the Set

___
<a id="getsymbol"></a>

###  getSymbol

▸ **getSymbol**(setAddress: *`string`*): `string`

*Defined in [SetTokenAPI.ts:94](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L94)*

Gets symbol of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `string` |  Address of the Set |

**Returns:** `string`
A string of the Set's symbol

___
<a id="gettotalsupply"></a>

###  getTotalSupply

▸ **getTotalSupply**(setAddress: *`string`*): `number`

*Defined in [SetTokenAPI.ts:105](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L105)*

Gets total supply of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `string` |  Address of the Set |

**Returns:** `number`
The total supply of the Set

___
<a id="getunits"></a>

###  getUnits

▸ **getUnits**(setAddress: *`string`*): `number`[]

*Defined in [SetTokenAPI.ts:117](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/SetTokenAPI.ts#L117)*

Gets units of each component token that make up the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `string` |  Address of the Set |

**Returns:** `number`[]
An array of units that make up the Set composition which
                   correspond to the component tokens in the Set

___

