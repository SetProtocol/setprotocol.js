[setprotocol.js](../README.md) > ["CoreAPI"](../modules/_coreapi_.md) > [CoreAPI](../classes/_coreapi_.coreapi.md)

# Class: CoreAPI

*__title__*: CoreAPI

*__author__*: Set Protocol

The Core API handles all functions on the Core SetProtocol smart contract.

## Hierarchy

**CoreAPI**

## Index

### Constructors

* [constructor](_coreapi_.coreapi.md#constructor)

### Properties

* [assert](_coreapi_.coreapi.md#assert)
* [contracts](_coreapi_.coreapi.md#contracts)
* [coreAddress](_coreapi_.coreapi.md#coreaddress)
* [setProtocolUtils](_coreapi_.coreapi.md#setprotocolutils)
* [transferProxyAddress](_coreapi_.coreapi.md#transferproxyaddress)
* [vaultAddress](_coreapi_.coreapi.md#vaultaddress)
* [web3](_coreapi_.coreapi.md#web3)

### Methods

* [batchDeposit](_coreapi_.coreapi.md#batchdeposit)
* [batchWithdraw](_coreapi_.coreapi.md#batchwithdraw)
* [cancelIssuanceOrder](_coreapi_.coreapi.md#cancelissuanceorder)
* [create](_coreapi_.coreapi.md#create)
* [createSignedIssuanceOrder](_coreapi_.coreapi.md#createsignedissuanceorder)
* [deposit](_coreapi_.coreapi.md#deposit)
* [fillIssuanceOrder](_coreapi_.coreapi.md#fillissuanceorder)
* [getExchangeAddress](_coreapi_.coreapi.md#getexchangeaddress)
* [getFactories](_coreapi_.coreapi.md#getfactories)
* [getIsValidFactory](_coreapi_.coreapi.md#getisvalidfactory)
* [getIsValidSet](_coreapi_.coreapi.md#getisvalidset)
* [getSetAddresses](_coreapi_.coreapi.md#getsetaddresses)
* [getTransferProxyAddress](_coreapi_.coreapi.md#gettransferproxyaddress)
* [getVaultAddress](_coreapi_.coreapi.md#getvaultaddress)
* [issue](_coreapi_.coreapi.md#issue)
* [redeem](_coreapi_.coreapi.md#redeem)
* [redeemAndWithdraw](_coreapi_.coreapi.md#redeemandwithdraw)
* [withdraw](_coreapi_.coreapi.md#withdraw)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new CoreAPI**(web3: *`Web3`*, coreAddress: *`Address`*, transferProxyAddress?: *`Address`*, vaultAddress?: *`Address`*): [CoreAPI](_coreapi_.coreapi.md)

*Defined in [CoreAPI.ts:51](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L51)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| web3 | `Web3` | - |
| coreAddress | `Address` | - |
| `Default value` transferProxyAddress | `Address` |  undefined |
| `Default value` vaultAddress | `Address` |  undefined |

**Returns:** [CoreAPI](_coreapi_.coreapi.md)

___

## Properties

<a id="assert"></a>

### `<Private>` assert

**● assert**: *`Assertions`*

*Defined in [CoreAPI.ts:45](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L45)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [CoreAPI.ts:46](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L46)*

___
<a id="coreaddress"></a>

###  coreAddress

**● coreAddress**: *`Address`*

*Defined in [CoreAPI.ts:49](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L49)*

___
<a id="setprotocolutils"></a>

### `<Private>` setProtocolUtils

**● setProtocolUtils**: *`SetProtocolUtils`*

*Defined in [CoreAPI.ts:47](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L47)*

___
<a id="transferproxyaddress"></a>

###  transferProxyAddress

**● transferProxyAddress**: *`Address`*

*Defined in [CoreAPI.ts:50](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L50)*

___
<a id="vaultaddress"></a>

###  vaultAddress

**● vaultAddress**: *`Address`*

*Defined in [CoreAPI.ts:51](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L51)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [CoreAPI.ts:44](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L44)*

___

## Methods

<a id="batchdeposit"></a>

###  batchDeposit

▸ **batchDeposit**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:454](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L454)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>

___
<a id="batchwithdraw"></a>

###  batchWithdraw

▸ **batchWithdraw**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:526](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L526)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>

___
<a id="cancelissuanceorder"></a>

###  cancelIssuanceOrder

▸ **cancelIssuanceOrder**(issuanceOrder: *`IssuanceOrder`*, quantityToCancel: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:818](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L818)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| issuanceOrder | `IssuanceOrder` |
| quantityToCancel | `BigNumber` |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>

___
<a id="create"></a>

###  create

▸ **create**(userAddress: *`Address`*, factoryAddress: *`Address`*, components: *`Address`[]*, units: *`BigNumber`[]*, naturalUnit: *`BigNumber`*, name: *`string`*, symbol: *`string`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:94](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L94)*

Create a new Set, specifying the components, units, name, symbol to use.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| factoryAddress | `Address` |  Set Token factory address of the token being created |
| components | `Address`[] |  Component token addresses |
| units | `BigNumber`[] |  Units of corresponding token components |
| naturalUnit | `BigNumber` |  Supplied as the lowest common denominator for the Set |
| name | `string` |  User-supplied name for Set (i.e. "DEX Set") |
| symbol | `string` |  User-supplied symbol for Set (i.e. "DEX") |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up for the Set address

___
<a id="createsignedissuanceorder"></a>

###  createSignedIssuanceOrder

▸ **createSignedIssuanceOrder**(setAddress: *`Address`*, quantity: *`BigNumber`*, requiredComponents: *`Address`[]*, requiredComponentAmounts: *`BigNumber`[]*, makerAddress: *`Address`*, makerToken: *`Address`*, makerTokenAmount: *`BigNumber`*, expiration: *`BigNumber`*, relayerAddress: *`Address`*, relayerToken: *`Address`*, makerRelayerFee: *`BigNumber`*, takerRelayerFee: *`BigNumber`*): `Promise`<`SignedIssuanceOrder`>

*Defined in [CoreAPI.ts:603](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L603)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` |
| quantity | `BigNumber` |
| requiredComponents | `Address`[] |
| requiredComponentAmounts | `BigNumber`[] |
| makerAddress | `Address` |
| makerToken | `Address` |
| makerTokenAmount | `BigNumber` |
| expiration | `BigNumber` |
| relayerAddress | `Address` |
| relayerToken | `Address` |
| makerRelayerFee | `BigNumber` |
| takerRelayerFee | `BigNumber` |

**Returns:** `Promise`<`SignedIssuanceOrder`>

___
<a id="deposit"></a>

###  deposit

▸ **deposit**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:294](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L294)*

Asynchronously deposits tokens to the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| tokenAddress | `Address` |  Address of the ERC20 token |
| quantityInWei | `BigNumber` |  Number of tokens a user wants to deposit into the vault |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="fillissuanceorder"></a>

###  fillIssuanceOrder

▸ **fillIssuanceOrder**(userAddress: *`Address`*, signedIssuanceOrder: *`SignedIssuanceOrder`*, quantityToFill: *`BigNumber`*, orderData: *`Bytes`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:700](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L700)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| signedIssuanceOrder | `SignedIssuanceOrder` |
| quantityToFill | `BigNumber` |
| orderData | `Bytes` |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>

___
<a id="getexchangeaddress"></a>

###  getExchangeAddress

▸ **getExchangeAddress**(exchangeId: *`number`*): `Promise`<`Address`>

*Defined in [CoreAPI.ts:920](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L920)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| exchangeId | `number` |

**Returns:** `Promise`<`Address`>

___
<a id="getfactories"></a>

###  getFactories

▸ **getFactories**(): `Promise`<`Address`[]>

*Defined in [CoreAPI.ts:954](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L954)*

**Returns:** `Promise`<`Address`[]>

___
<a id="getisvalidfactory"></a>

###  getIsValidFactory

▸ **getIsValidFactory**(factoryAddress: *`Address`*): `Promise`<`boolean`>

*Defined in [CoreAPI.ts:978](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L978)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| factoryAddress | `Address` |

**Returns:** `Promise`<`boolean`>

___
<a id="getisvalidset"></a>

###  getIsValidSet

▸ **getIsValidSet**(setAddress: *`Address`*): `Promise`<`boolean`>

*Defined in [CoreAPI.ts:991](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L991)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` |

**Returns:** `Promise`<`boolean`>

___
<a id="getsetaddresses"></a>

###  getSetAddresses

▸ **getSetAddresses**(): `Promise`<`Address`[]>

*Defined in [CoreAPI.ts:966](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L966)*

**Returns:** `Promise`<`Address`[]>

___
<a id="gettransferproxyaddress"></a>

###  getTransferProxyAddress

▸ **getTransferProxyAddress**(): `Promise`<`Address`>

*Defined in [CoreAPI.ts:931](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L931)*

**Returns:** `Promise`<`Address`>

___
<a id="getvaultaddress"></a>

###  getVaultAddress

▸ **getVaultAddress**(): `Promise`<`Address`>

*Defined in [CoreAPI.ts:942](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L942)*

**Returns:** `Promise`<`Address`>

___
<a id="issue"></a>

###  issue

▸ **issue**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:182](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L182)*

Asynchronously issues a particular quantity of tokens from a particular Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| setAddress | `Address` |  Set token address of Set being issued |
| quantityInWei | `BigNumber` |  Number of Sets a user wants to issue in Wei |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="redeem"></a>

###  redeem

▸ **redeem**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:234](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L234)*

Asynchronously redeems a particular quantity of tokens from a particular Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| setAddress | `Address` |  Set token address of Set being issued |
| quantityInWei | `BigNumber` |  Number of Sets a user wants to redeem in Wei |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="redeemandwithdraw"></a>

###  redeemAndWithdraw

▸ **redeemAndWithdraw**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, tokensToWithdraw: *`Address`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:401](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L401)*

Composite method to redeem and withdraw with a single transaction

Normally, you should expect to be able to withdraw all of the tokens. However, some have central abilities to freeze transfers (e.g. EOS). _toWithdraw allows you to optionally specify which component tokens to transfer back to the user. The rest will remain in the vault under the users' addresses.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  The address of the user |
| setAddress | `Address` |  The address of the Set token |
| quantityInWei | `BigNumber` |  The number of tokens to redeem |
| tokensToWithdraw | `Address`[] |  Array of token addresses to withdraw |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="withdraw"></a>

###  withdraw

▸ **withdraw**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:345](https://github.com/SetProtocol/setProtocol.js/blob/f8011ee/src/api/CoreAPI.ts#L345)*

Asynchronously withdraw tokens from the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| tokenAddress | `Address` |  Address of the ERC20 token |
| quantityInWei | `BigNumber` |  Number of tokens a user wants to withdraw from the vault |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>
A transaction hash

___

