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

*Defined in [CoreAPI.ts:52](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L52)*

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

*Defined in [CoreAPI.ts:46](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L46)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [CoreAPI.ts:47](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L47)*

___
<a id="coreaddress"></a>

###  coreAddress

**● coreAddress**: *`Address`*

*Defined in [CoreAPI.ts:50](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L50)*

___
<a id="setprotocolutils"></a>

### `<Private>` setProtocolUtils

**● setProtocolUtils**: *`SetProtocolUtils`*

*Defined in [CoreAPI.ts:48](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L48)*

___
<a id="transferproxyaddress"></a>

###  transferProxyAddress

**● transferProxyAddress**: *`Address`*

*Defined in [CoreAPI.ts:51](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L51)*

___
<a id="vaultaddress"></a>

###  vaultAddress

**● vaultAddress**: *`Address`*

*Defined in [CoreAPI.ts:52](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L52)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [CoreAPI.ts:45](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L45)*

___

## Methods

<a id="batchdeposit"></a>

###  batchDeposit

▸ **batchDeposit**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:455](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L455)*

Asynchronously batch deposits tokens to the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="batchwithdraw"></a>

###  batchWithdraw

▸ **batchWithdraw**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:527](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L527)*

Asynchronously batch withdraws tokens from the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="cancelissuanceorder"></a>

###  cancelIssuanceOrder

▸ **cancelIssuanceOrder**(issuanceOrder: *`IssuanceOrder`*, quantityToCancel: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:819](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L819)*

Cancels an Issuance Order

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| issuanceOrder | `IssuanceOrder` |  Issuance order to fill |
| quantityToCancel | `BigNumber` |  Number of Set to fill in this call |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="create"></a>

###  create

▸ **create**(userAddress: *`Address`*, factoryAddress: *`Address`*, components: *`Address`[]*, units: *`BigNumber`[]*, naturalUnit: *`BigNumber`*, name: *`string`*, symbol: *`string`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:95](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L95)*

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

*Defined in [CoreAPI.ts:604](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L604)*

Creates a new Issuance Order including the signature

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set token for issuance order |
| quantity | `BigNumber` |  Number of Set tokens to create as part of issuance order |
| requiredComponents | `Address`[] |  Addresses of required component tokens of Set |
| requiredComponentAmounts | `BigNumber`[] |  Amounts of each required component needed |
| makerAddress | `Address` |  Address of person making the order |
| makerToken | `Address` |  Address of token the issuer is paying in |
| makerTokenAmount | `BigNumber` |  Number of tokens being exchanged for aggregate order size |
| expiration | `BigNumber` |  Unix timestamp of expiration (in seconds) |
| relayerAddress | `Address` |  Address of relayer of order |
| relayerToken | `Address` |  Address of token paid to relayer |
| makerRelayerFee | `BigNumber` |  Number of token paid to relayer by maker |
| takerRelayerFee | `BigNumber` |  Number of token paid tp relayer by taker |

**Returns:** `Promise`<`SignedIssuanceOrder`>
A transaction hash

___
<a id="deposit"></a>

###  deposit

▸ **deposit**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:295](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L295)*

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

*Defined in [CoreAPI.ts:701](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L701)*

Fills an Issuance Order

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of user doing the fill |
| signedIssuanceOrder | `SignedIssuanceOrder` |
| quantityToFill | `BigNumber` |  Number of Set to fill in this call |
| orderData | `Bytes` |  Bytes representation of orders used to fill issuance order |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="getexchangeaddress"></a>

###  getExchangeAddress

▸ **getExchangeAddress**(exchangeId: *`number`*): `Promise`<`Address`>

*Defined in [CoreAPI.ts:921](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L921)*

Asynchronously gets the exchange address for a given exhange id

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| exchangeId | `number` |  Enum id of the exchange |

**Returns:** `Promise`<`Address`>
An exchange address

___
<a id="getfactories"></a>

###  getFactories

▸ **getFactories**(): `Promise`<`Address`[]>

*Defined in [CoreAPI.ts:954](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L954)*

Asynchronously gets factory addresses

**Returns:** `Promise`<`Address`[]>
Array of factory addresses

___
<a id="getisvalidfactory"></a>

###  getIsValidFactory

▸ **getIsValidFactory**(factoryAddress: *`Address`*): `Promise`<`boolean`>

*Defined in [CoreAPI.ts:977](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L977)*

Asynchronously validates if an address is a valid factory address

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| factoryAddress | `Address` |  Address of the factory contract |

**Returns:** `Promise`<`boolean`>
Boolean equalling if factory address is valid

___
<a id="getisvalidset"></a>

###  getIsValidSet

▸ **getIsValidSet**(setAddress: *`Address`*): `Promise`<`boolean`>

*Defined in [CoreAPI.ts:990](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L990)*

Asynchronously validates if an address is a valid Set address

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Address of the Set contract |

**Returns:** `Promise`<`boolean`>
Boolean equalling if Set address is valid

___
<a id="getsetaddresses"></a>

###  getSetAddresses

▸ **getSetAddresses**(): `Promise`<`Address`[]>

*Defined in [CoreAPI.ts:965](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L965)*

Asynchronously gets Set addresses

**Returns:** `Promise`<`Address`[]>
Array of Set addresses

___
<a id="gettransferproxyaddress"></a>

###  getTransferProxyAddress

▸ **getTransferProxyAddress**(): `Promise`<`Address`>

*Defined in [CoreAPI.ts:932](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L932)*

Asynchronously gets the transfer proxy address

**Returns:** `Promise`<`Address`>
Transfer proxy address

___
<a id="getvaultaddress"></a>

###  getVaultAddress

▸ **getVaultAddress**(): `Promise`<`Address`>

*Defined in [CoreAPI.ts:943](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L943)*

Asynchronously gets the vault address

**Returns:** `Promise`<`Address`>
Vault address

___
<a id="issue"></a>

###  issue

▸ **issue**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:183](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L183)*

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

*Defined in [CoreAPI.ts:235](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L235)*

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

▸ **redeemAndWithdraw**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, tokensToExclude: *`Address`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:402](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L402)*

Composite method to redeem and withdraw with a single transaction

Normally, you should expect to be able to withdraw all of the tokens. However, some have central abilities to freeze transfers (e.g. EOS). _toExclude allows you to optionally specify which component tokens to remain under the user's address in the vault. The rest will be transferred to the user.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  The address of the user |
| setAddress | `Address` |  The address of the Set token |
| quantityInWei | `BigNumber` |  The number of tokens to redeem |
| tokensToExclude | `Address`[] |  Array of token addresses to exclude from withdrawal |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="withdraw"></a>

###  withdraw

▸ **withdraw**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:346](https://github.com/SetProtocol/setProtocol.js/blob/43f5628/src/api/CoreAPI.ts#L346)*

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

