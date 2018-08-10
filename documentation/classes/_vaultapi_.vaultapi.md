[setprotocol.js](../README.md) > ["VaultAPI"](../modules/_vaultapi_.md) > [VaultAPI](../classes/_vaultapi_.vaultapi.md)

# Class: VaultAPI

*__title__*: VaultAPI

*__author__*: Set Protocol

The Vault API handles all functions on the Vault smart contract.

## Hierarchy

**VaultAPI**

## Index

### Constructors

* [constructor](_vaultapi_.vaultapi.md#constructor)

### Properties

* [assert](_vaultapi_.vaultapi.md#assert)
* [contracts](_vaultapi_.vaultapi.md#contracts)
* [vaultAddress](_vaultapi_.vaultapi.md#vaultaddress)
* [web3](_vaultapi_.vaultapi.md#web3)

### Methods

* [getOwnerBalance](_vaultapi_.vaultapi.md#getownerbalance)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new VaultAPI**(web3: *`Web3`*, vaultAddress: *`Address`*): [VaultAPI](_vaultapi_.vaultapi.md)

*Defined in [VaultAPI.ts:37](https://github.com/SetProtocol/setProtocol.js/blob/6cd5c7d/src/api/VaultAPI.ts#L37)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| web3 | `Web3` |
| vaultAddress | `Address` |

**Returns:** [VaultAPI](_vaultapi_.vaultapi.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [VaultAPI.ts:35](https://github.com/SetProtocol/setProtocol.js/blob/6cd5c7d/src/api/VaultAPI.ts#L35)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [VaultAPI.ts:36](https://github.com/SetProtocol/setProtocol.js/blob/6cd5c7d/src/api/VaultAPI.ts#L36)*

___
<a id="vaultaddress"></a>

### `<Private>` vaultAddress

**● vaultAddress**: *`Address`*

*Defined in [VaultAPI.ts:37](https://github.com/SetProtocol/setProtocol.js/blob/6cd5c7d/src/api/VaultAPI.ts#L37)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [VaultAPI.ts:34](https://github.com/SetProtocol/setProtocol.js/blob/6cd5c7d/src/api/VaultAPI.ts#L34)*

___

## Methods

<a id="getownerbalance"></a>

###  getOwnerBalance

▸ **getOwnerBalance**(ownerAddress: *`Address`*, tokenAddress: *`Address`*): `Promise`<`BigNumber`>

*Defined in [VaultAPI.ts:53](https://github.com/SetProtocol/setProtocol.js/blob/6cd5c7d/src/api/VaultAPI.ts#L53)*

Gets balance of user's tokens in the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ownerAddress | `Address` |  Address of the user |
| tokenAddress | `Address` |  Address of the Set |

**Returns:** `Promise`<`BigNumber`>
The balance of the user's Set

___

