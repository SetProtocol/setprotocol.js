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

*Defined in [SetTokenAPI.ts:36](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L36)*

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

*Defined in [SetTokenAPI.ts:35](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L35)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [SetTokenAPI.ts:36](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L36)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [SetTokenAPI.ts:34](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L34)*

___

## Methods

<a id="getbalanceof"></a>

###  getBalanceOf

▸ **getBalanceOf**(setAddress: *`Address`*, userAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [SetTokenAPI.ts:51](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L51)*

Gets balance of a user's Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set |
| userAddress | `Address` |  Address of the user |

**Returns:** `Promise`<`BigNumber`>
The balance of the user's Set

___
<a id="getcomponents"></a>

###  getComponents

▸ **getComponents**(setAddress: *`Address`*): `Promise`<`Address`[]>

*Defined in [SetTokenAPI.ts:63](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L63)*

Gets component tokens that make up the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set |

**Returns:** `Promise`<`Address`[]>
An array of addresses

___
<a id="getname"></a>

###  getName

▸ **getName**(setAddress: *`Address`*): `Promise`<`string`>

*Defined in [SetTokenAPI.ts:74](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L74)*

Gets name of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set |

**Returns:** `Promise`<`string`>
A string of the Set's name

___
<a id="getnaturalunit"></a>

###  getNaturalUnit

▸ **getNaturalUnit**(setAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [SetTokenAPI.ts:85](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L85)*

Gets natural unit of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set |

**Returns:** `Promise`<`BigNumber`>
The natural unit of the Set

___
<a id="getsymbol"></a>

###  getSymbol

▸ **getSymbol**(setAddress: *`Address`*): `Promise`<`string`>

*Defined in [SetTokenAPI.ts:96](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L96)*

Gets symbol of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set |

**Returns:** `Promise`<`string`>
A string of the Set's symbol

___
<a id="gettotalsupply"></a>

###  getTotalSupply

▸ **getTotalSupply**(setAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [SetTokenAPI.ts:107](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L107)*

Gets total supply of the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set |

**Returns:** `Promise`<`BigNumber`>
The total supply of the Set

___
<a id="getunits"></a>

###  getUnits

▸ **getUnits**(setAddress: *`Address`*): `Promise`<`BigNumber`[]>

*Defined in [SetTokenAPI.ts:119](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/SetTokenAPI.ts#L119)*

Gets units of each component token that make up the Set

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set |

**Returns:** `Promise`<`BigNumber`[]>
An array of units that make up the Set composition which
                   correspond to the component tokens in the Set

___

