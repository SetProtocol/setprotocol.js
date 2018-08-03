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
* [web3](_vaultapi_.vaultapi.md#web3)

### Methods

* [getOwnerBalance](_vaultapi_.vaultapi.md#getownerbalance)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new VaultAPI**(web3: *`Web3`*, vaultAddress: *`Address`*): [VaultAPI](_vaultapi_.vaultapi.md)

*Defined in [VaultAPI.ts:35](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/VaultAPI.ts#L35)*

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

*Defined in [VaultAPI.ts:34](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/VaultAPI.ts#L34)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [VaultAPI.ts:35](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/VaultAPI.ts#L35)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [VaultAPI.ts:33](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/VaultAPI.ts#L33)*

___

## Methods

<a id="getownerbalance"></a>

###  getOwnerBalance

▸ **getOwnerBalance**(ownerAddress: *`Address`*, tokenAddress: *`Address`*): `number`

*Defined in [VaultAPI.ts:51](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/VaultAPI.ts#L51)*

Gets balance of user's tokens in the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ownerAddress | `Address` |  Address of the user |
| tokenAddress | `Address` |  Address of the Set |

**Returns:** `number`
The balance of the user's Set

___

