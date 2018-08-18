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

* [assertBatchDeposit](_coreapi_.coreapi.md#assertbatchdeposit)
* [assertBatchWithdraw](_coreapi_.coreapi.md#assertbatchwithdraw)
* [assertCancelIssuanceOrder](_coreapi_.coreapi.md#assertcancelissuanceorder)
* [assertCreateSet](_coreapi_.coreapi.md#assertcreateset)
* [assertCreateSignedIssuanceOrder](_coreapi_.coreapi.md#assertcreatesignedissuanceorder)
* [assertDeposit](_coreapi_.coreapi.md#assertdeposit)
* [assertFillIssuanceOrder](_coreapi_.coreapi.md#assertfillissuanceorder)
* [assertIssue](_coreapi_.coreapi.md#assertissue)
* [assertRedeem](_coreapi_.coreapi.md#assertredeem)
* [assertRedeemAndWithdraw](_coreapi_.coreapi.md#assertredeemandwithdraw)
* [assertWithdraw](_coreapi_.coreapi.md#assertwithdraw)
* [batchDeposit](_coreapi_.coreapi.md#batchdeposit)
* [batchWithdraw](_coreapi_.coreapi.md#batchwithdraw)
* [cancelOrder](_coreapi_.coreapi.md#cancelorder)
* [createOrder](_coreapi_.coreapi.md#createorder)
* [createSet](_coreapi_.coreapi.md#createset)
* [deposit](_coreapi_.coreapi.md#deposit)
* [fillOrder](_coreapi_.coreapi.md#fillorder)
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
* [redeemToVault](_coreapi_.coreapi.md#redeemtovault)
* [singleDeposit](_coreapi_.coreapi.md#singledeposit)
* [singleWithdraw](_coreapi_.coreapi.md#singlewithdraw)
* [withdraw](_coreapi_.coreapi.md#withdraw)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new CoreAPI**(web3: *`Web3`*, coreAddress: *`Address`*, transferProxyAddress?: *`Address`*, vaultAddress?: *`Address`*): [CoreAPI](_coreapi_.coreapi.md)

*Defined in [CoreAPI.ts:54](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L54)*

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

*Defined in [CoreAPI.ts:48](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L48)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [CoreAPI.ts:49](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L49)*

___
<a id="coreaddress"></a>

###  coreAddress

**● coreAddress**: *`Address`*

*Defined in [CoreAPI.ts:52](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L52)*

___
<a id="setprotocolutils"></a>

### `<Private>` setProtocolUtils

**● setProtocolUtils**: *`SetProtocolUtils`*

*Defined in [CoreAPI.ts:50](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L50)*

___
<a id="transferproxyaddress"></a>

###  transferProxyAddress

**● transferProxyAddress**: *`Address`*

*Defined in [CoreAPI.ts:53](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L53)*

___
<a id="vaultaddress"></a>

###  vaultAddress

**● vaultAddress**: *`Address`*

*Defined in [CoreAPI.ts:54](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L54)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [CoreAPI.ts:47](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L47)*

___

## Methods

<a id="assertbatchdeposit"></a>

### `<Private>` assertBatchDeposit

▸ **assertBatchDeposit**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*): `Promise`<`void`>

*Defined in [CoreAPI.ts:921](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L921)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |

**Returns:** `Promise`<`void`>

___
<a id="assertbatchwithdraw"></a>

### `<Private>` assertBatchWithdraw

▸ **assertBatchWithdraw**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*): `Promise`<`void`>

*Defined in [CoreAPI.ts:969](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L969)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |

**Returns:** `Promise`<`void`>

___
<a id="assertcancelissuanceorder"></a>

### `<Private>` assertCancelIssuanceOrder

▸ **assertCancelIssuanceOrder**(issuanceOrder: *`IssuanceOrder`*, quantityToCancel: *`BigNumber`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:1168](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L1168)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| issuanceOrder | `IssuanceOrder` |
| quantityToCancel | `BigNumber` |

**Returns:** `Promise`<`void`>

___
<a id="assertcreateset"></a>

### `<Private>` assertCreateSet

▸ **assertCreateSet**(userAddress: *`Address`*, factoryAddress: *`Address`*, components: *`Address`[]*, units: *`BigNumber`[]*, naturalUnit: *`BigNumber`*, name: *`string`*, symbol: *`string`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:732](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L732)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| factoryAddress | `Address` |
| components | `Address`[] |
| units | `BigNumber`[] |
| naturalUnit | `BigNumber` |
| name | `string` |
| symbol | `string` |

**Returns:** `Promise`<`void`>

___
<a id="assertcreatesignedissuanceorder"></a>

### `<Private>` assertCreateSignedIssuanceOrder

▸ **assertCreateSignedIssuanceOrder**(setAddress: *`Address`*, quantity: *`BigNumber`*, requiredComponents: *`Address`[]*, requiredComponentAmounts: *`BigNumber`[]*, makerAddress: *`Address`*, makerToken: *`Address`*, makerTokenAmount: *`BigNumber`*, expiration: *`BigNumber`*, relayerAddress: *`Address`*, relayerToken: *`Address`*, makerRelayerFee: *`BigNumber`*, takerRelayerFee: *`BigNumber`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:1013](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L1013)*

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

**Returns:** `Promise`<`void`>

___
<a id="assertdeposit"></a>

### `<Private>` assertDeposit

▸ **assertDeposit**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:867](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L867)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddress | `Address` |
| quantityInWei | `BigNumber` |

**Returns:** `Promise`<`void`>

___
<a id="assertfillissuanceorder"></a>

### `<Private>` assertFillIssuanceOrder

▸ **assertFillIssuanceOrder**(userAddress: *`Address`*, signedIssuanceOrder: *`SignedIssuanceOrder`*, quantityToFill: *`BigNumber`*, orderData: *`Bytes`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:1079](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L1079)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| signedIssuanceOrder | `SignedIssuanceOrder` |
| quantityToFill | `BigNumber` |
| orderData | `Bytes` |

**Returns:** `Promise`<`void`>

___
<a id="assertissue"></a>

### `<Private>` assertIssue

▸ **assertIssue**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:791](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L791)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| setAddress | `Address` |
| quantityInWei | `BigNumber` |

**Returns:** `Promise`<`void`>

___
<a id="assertredeem"></a>

### `<Private>` assertRedeem

▸ **assertRedeem**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:819](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L819)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| setAddress | `Address` |
| quantityInWei | `BigNumber` |

**Returns:** `Promise`<`void`>

___
<a id="assertredeemandwithdraw"></a>

### `<Private>` assertRedeemAndWithdraw

▸ **assertRedeemAndWithdraw**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*): `void`

*Defined in [CoreAPI.ts:856](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L856)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` |
| quantityInWei | `BigNumber` |

**Returns:** `void`

___
<a id="assertwithdraw"></a>

### `<Private>` assertWithdraw

▸ **assertWithdraw**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*): `Promise`<`void`>

*Defined in [CoreAPI.ts:895](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L895)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddress | `Address` |
| quantityInWei | `BigNumber` |

**Returns:** `Promise`<`void`>

___
<a id="batchdeposit"></a>

###  batchDeposit

▸ **batchDeposit**(tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:319](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L319)*

Asynchronously batch deposits tokens to the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="batchwithdraw"></a>

###  batchWithdraw

▸ **batchWithdraw**(tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:351](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L351)*

Asynchronously batch withdraws tokens from the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="cancelorder"></a>

###  cancelOrder

▸ **cancelOrder**(issuanceOrder: *`IssuanceOrder`*, quantityToCancel: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:514](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L514)*

Cancels an Issuance Order

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| issuanceOrder | `IssuanceOrder` |  Issuance order to cancel |
| quantityToCancel | `BigNumber` |  Number of Set to cancel in this call |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="createorder"></a>

###  createOrder

▸ **createOrder**(setAddress: *`Address`*, quantity: *`BigNumber`*, requiredComponents: *`Address`[]*, requiredComponentAmounts: *`BigNumber`[]*, makerAddress: *`Address`*, makerToken: *`Address`*, makerTokenAmount: *`BigNumber`*, expiration: *`BigNumber`*, relayerAddress: *`Address`*, relayerToken: *`Address`*, makerRelayerFee: *`BigNumber`*, takerRelayerFee: *`BigNumber`*): `Promise`<`SignedIssuanceOrder`>

*Defined in [CoreAPI.ts:392](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L392)*

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
<a id="createset"></a>

###  createSet

▸ **createSet**(factoryAddress: *`Address`*, components: *`Address`[]*, units: *`BigNumber`[]*, naturalUnit: *`BigNumber`*, name: *`string`*, symbol: *`string`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:96](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L96)*

Create a new Set, specifying the components, units, name, symbol to use.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
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
<a id="deposit"></a>

###  deposit

▸ **deposit**(tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:626](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L626)*

Deposits token either using single token type deposit or batch deposit

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="fillorder"></a>

###  fillOrder

▸ **fillOrder**(signedIssuanceOrder: *`SignedIssuanceOrder`*, quantityToFill: *`BigNumber`*, orders: *( `Order` &#124; `TakerWalletOrder`)[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:452](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L452)*

Fills an Issuance Order

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| signedIssuanceOrder | `SignedIssuanceOrder` |  Signed issuance order to fill |
| quantityToFill | `BigNumber` |  Number of Set to fill in this call |
| orders | ( `Order` &#124; `TakerWalletOrder`)[] |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="getexchangeaddress"></a>

###  getExchangeAddress

▸ **getExchangeAddress**(exchangeId: *`number`*): `Promise`<`Address`>

*Defined in [CoreAPI.ts:654](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L654)*

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

*Defined in [CoreAPI.ts:687](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L687)*

Asynchronously gets factory addresses

**Returns:** `Promise`<`Address`[]>
Array of factory addresses

___
<a id="getisvalidfactory"></a>

###  getIsValidFactory

▸ **getIsValidFactory**(factoryAddress: *`Address`*): `Promise`<`boolean`>

*Defined in [CoreAPI.ts:710](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L710)*

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

*Defined in [CoreAPI.ts:723](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L723)*

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

*Defined in [CoreAPI.ts:698](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L698)*

Asynchronously gets Set addresses

**Returns:** `Promise`<`Address`[]>
Array of Set addresses

___
<a id="gettransferproxyaddress"></a>

###  getTransferProxyAddress

▸ **getTransferProxyAddress**(): `Promise`<`Address`>

*Defined in [CoreAPI.ts:665](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L665)*

Asynchronously gets the transfer proxy address

**Returns:** `Promise`<`Address`>
Transfer proxy address

___
<a id="getvaultaddress"></a>

###  getVaultAddress

▸ **getVaultAddress**(): `Promise`<`Address`>

*Defined in [CoreAPI.ts:676](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L676)*

Asynchronously gets the vault address

**Returns:** `Promise`<`Address`>
Vault address

___
<a id="issue"></a>

###  issue

▸ **issue**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:140](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L140)*

Asynchronously issues a particular quantity of tokens from a particular Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Set token address of Set being issued |
| quantityInWei | `BigNumber` |  Number of Sets a user wants to issue in Wei |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="redeem"></a>

###  redeem

▸ **redeem**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, withdraw?: *`boolean`*, tokensToExclude: *`Address`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:567](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L567)*

Composite method to redeem and optionally withdraw tokens

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| setAddress | `Address` | - |  The address of the Set token |
| quantityInWei | `BigNumber` | - |  The number of tokens to redeem |
| `Default value` withdraw | `boolean` | true |  Boolean determining whether or not to withdraw |
| tokensToExclude | `Address`[] | - |  Array of token addresses to exclude from withdrawal |
| `Optional` txOpts | `TxData` | - |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="redeemandwithdraw"></a>

###  redeemAndWithdraw

▸ **redeemAndWithdraw**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, tokensToExclude: *`Address`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:274](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L274)*

Redeem and withdraw with a single transaction

Normally, you should expect to be able to withdraw all of the tokens. However, some have central abilities to freeze transfers (e.g. EOS). _toExclude allows you to optionally specify which component tokens to remain under the user's address in the vault. The rest will be transferred to the user.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  The address of the Set token |
| quantityInWei | `BigNumber` |  The number of tokens to redeem |
| tokensToExclude | `Address`[] |  Array of token addresses to exclude from withdrawal |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="redeemtovault"></a>

###  redeemToVault

▸ **redeemToVault**(setAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:172](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L172)*

Asynchronously redeems a particular quantity of tokens from a particular Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| setAddress | `Address` |  Set token address of Set being issued |
| quantityInWei | `BigNumber` |  Number of Sets a user wants to redeem in Wei |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="singledeposit"></a>

###  singleDeposit

▸ **singleDeposit**(tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:204](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L204)*

Asynchronously deposits tokens to the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | `Address` |  Address of the ERC20 token |
| quantityInWei | `BigNumber` |  Number of tokens a user wants to deposit into the vault |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="singlewithdraw"></a>

###  singleWithdraw

▸ **singleWithdraw**(tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:236](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L236)*

Asynchronously withdraw tokens from the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | `Address` |  Address of the ERC20 token |
| quantityInWei | `BigNumber` |  Number of tokens a user wants to withdraw from the vault |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="withdraw"></a>

###  withdraw

▸ **withdraw**(tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TxData`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:598](https://github.com/SetProtocol/setProtocol.js/blob/0711ab2/src/api/CoreAPI.ts#L598)*

Withdraws tokens either using single token type withdraw or batch withdraw

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TxData` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash

___

