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

*Defined in [setToken_api.ts:28](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L28)*

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

*Defined in [setToken_api.ts:27](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L27)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contracts_api_.contractsapi.md)*

*Defined in [setToken_api.ts:28](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L28)*

___
<a id="provider"></a>

### `<Private>` provider

**● provider**: *`Web3`*

*Defined in [setToken_api.ts:26](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L26)*

___

## Methods

<a id="getcomponents"></a>

###  getComponents

▸ **getComponents**(setAddress: *`Address`*): `Promise`<[Component](../interfaces/_settoken_api_.component.md)[]>

*Defined in [setToken_api.ts:39](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L39)*

Retrieves the components and delivers their unit and addresses

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 

**Returns:** `Promise`<[Component](../interfaces/_settoken_api_.component.md)[]>

___
<a id="getnaturalunit"></a>

###  getNaturalUnit

▸ **getNaturalUnit**(setAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [setToken_api.ts:59](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L59)*

Retrieves the natural Unit for the {Set}

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 

**Returns:** `Promise`<`BigNumber`>

___
<a id="issuesetasync"></a>

###  issueSetAsync

▸ **issueSetAsync**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, userAddress: *`Address`*): `Promise`<`string`>

*Defined in [setToken_api.ts:68](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L68)*

Issues a particular quantity of tokens from a particular {Set}s

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

*Defined in [setToken_api.ts:90](https://github.com/SetProtocol/setProtocol.js/blob/50270c7/src/api/setToken_api.ts#L90)*

Redeems a particular quantity of tokens from a particular {Set}s

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` | 
| quantityInWei | `BigNumber` | 
| userAddress | `Address` | 

**Returns:** `Promise`<`string`>

___

