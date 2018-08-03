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
* [transferProxyAddress](_coreapi_.coreapi.md#transferproxyaddress)
* [vaultAddress](_coreapi_.coreapi.md#vaultaddress)
* [web3](_coreapi_.coreapi.md#web3)

### Methods

* [batchDeposit](_coreapi_.coreapi.md#batchdeposit)
* [batchWithdraw](_coreapi_.coreapi.md#batchwithdraw)
* [create](_coreapi_.coreapi.md#create)
* [deposit](_coreapi_.coreapi.md#deposit)
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

*Defined in [CoreAPI.ts:44](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L44)*

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

*Defined in [CoreAPI.ts:39](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L39)*

___
<a id="contracts"></a>

### `<Private>` contracts

**● contracts**: *[ContractsAPI](_contractsapi_.contractsapi.md)*

*Defined in [CoreAPI.ts:40](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L40)*

___
<a id="coreaddress"></a>

###  coreAddress

**● coreAddress**: *`Address`*

*Defined in [CoreAPI.ts:42](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L42)*

___
<a id="transferproxyaddress"></a>

###  transferProxyAddress

**● transferProxyAddress**: *`Address`*

*Defined in [CoreAPI.ts:43](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L43)*

___
<a id="vaultaddress"></a>

###  vaultAddress

**● vaultAddress**: *`Address`*

*Defined in [CoreAPI.ts:44](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L44)*

___
<a id="web3"></a>

### `<Private>` web3

**● web3**: *`Web3`*

*Defined in [CoreAPI.ts:38](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L38)*

___

## Methods

<a id="batchdeposit"></a>

###  batchDeposit

▸ **batchDeposit**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:445](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L445)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TransactionOpts` |

**Returns:** `Promise`<`string`>

___
<a id="batchwithdraw"></a>

###  batchWithdraw

▸ **batchWithdraw**(userAddress: *`Address`*, tokenAddresses: *`Address`[]*, quantitiesInWei: *`BigNumber`[]*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:517](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L517)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| userAddress | `Address` |
| tokenAddresses | `Address`[] |
| quantitiesInWei | `BigNumber`[] |
| `Optional` txOpts | `TransactionOpts` |

**Returns:** `Promise`<`string`>

___
<a id="create"></a>

###  create

▸ **create**(userAddress: *`Address`*, factoryAddress: *`Address`*, components: *`Address`[]*, units: *`BigNumber`[]*, naturalUnit: *`BigNumber`*, name: *`string`*, symbol: *`string`*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:85](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L85)*

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
| `Optional` txOpts | `TransactionOpts` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up for the Set address

___
<a id="deposit"></a>

###  deposit

▸ **deposit**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:285](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L285)*

Asynchronously deposits tokens to the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| tokenAddress | `Address` |  Address of the ERC20 token |
| quantityInWei | `BigNumber` |  Number of tokens a user wants to deposit into the vault |
| `Optional` txOpts | `TransactionOpts` |

**Returns:** `Promise`<`string`>
A transaction hash

___
<a id="getexchangeaddress"></a>

###  getExchangeAddress

▸ **getExchangeAddress**(exchangeId: *`number`*): `Address`

*Defined in [CoreAPI.ts:585](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L585)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| exchangeId | `number` |

**Returns:** `Address`

___
<a id="getfactories"></a>

###  getFactories

▸ **getFactories**(): `Address`[]

*Defined in [CoreAPI.ts:619](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L619)*

**Returns:** `Address`[]

___
<a id="getisvalidfactory"></a>

###  getIsValidFactory

▸ **getIsValidFactory**(factoryAddress: *`Address`*): `boolean`

*Defined in [CoreAPI.ts:643](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L643)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| factoryAddress | `Address` |

**Returns:** `boolean`

___
<a id="getisvalidset"></a>

###  getIsValidSet

▸ **getIsValidSet**(setAddress: *`Address`*): `boolean`

*Defined in [CoreAPI.ts:656](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L656)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| setAddress | `Address` |

**Returns:** `boolean`

___
<a id="getsetaddresses"></a>

###  getSetAddresses

▸ **getSetAddresses**(): `Address`[]

*Defined in [CoreAPI.ts:631](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L631)*

**Returns:** `Address`[]

___
<a id="gettransferproxyaddress"></a>

###  getTransferProxyAddress

▸ **getTransferProxyAddress**(): `Address`

*Defined in [CoreAPI.ts:596](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L596)*

**Returns:** `Address`

___
<a id="getvaultaddress"></a>

###  getVaultAddress

▸ **getVaultAddress**(): `Address`

*Defined in [CoreAPI.ts:607](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L607)*

**Returns:** `Address`

___
<a id="issue"></a>

###  issue

▸ **issue**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:173](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L173)*

Asynchronously issues a particular quantity of tokens from a particular Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| setAddress | `Address` |  Set token address of Set being issued |
| quantityInWei | `BigNumber` |  Number of Sets a user wants to issue in Wei |
| `Optional` txOpts | `TransactionOpts` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="redeem"></a>

###  redeem

▸ **redeem**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:225](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L225)*

Asynchronously redeems a particular quantity of tokens from a particular Sets

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| setAddress | `Address` |  Set token address of Set being issued |
| quantityInWei | `BigNumber` |  Number of Sets a user wants to redeem in Wei |
| `Optional` txOpts | `TransactionOpts` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="redeemandwithdraw"></a>

###  redeemAndWithdraw

▸ **redeemAndWithdraw**(userAddress: *`Address`*, setAddress: *`Address`*, quantityInWei: *`BigNumber`*, tokensToWithdraw: *`Address`[]*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:392](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L392)*

Composite method to redeem and withdraw with a single transaction

Normally, you should expect to be able to withdraw all of the tokens. However, some have central abilities to freeze transfers (e.g. EOS). _toWithdraw allows you to optionally specify which component tokens to transfer back to the user. The rest will remain in the vault under the users' addresses.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  The address of the user |
| setAddress | `Address` |  The address of the Set token |
| quantityInWei | `BigNumber` |  The number of tokens to redeem |
| tokensToWithdraw | `Address`[] |  Array of token addresses to withdraw |
| `Optional` txOpts | `TransactionOpts` |  The options for executing the transaction |

**Returns:** `Promise`<`string`>
A transaction hash to then later look up

___
<a id="withdraw"></a>

###  withdraw

▸ **withdraw**(userAddress: *`Address`*, tokenAddress: *`Address`*, quantityInWei: *`BigNumber`*, txOpts?: *`TransactionOpts`*): `Promise`<`string`>

*Defined in [CoreAPI.ts:336](https://github.com/SetProtocol/setProtocol.js/blob/db88e4d/src/api/CoreAPI.ts#L336)*

Asynchronously withdraw tokens from the vault

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userAddress | `Address` |  Address of the user |
| tokenAddress | `Address` |  Address of the ERC20 token |
| quantityInWei | `BigNumber` |  Number of tokens a user wants to withdraw from the vault |
| `Optional` txOpts | `TransactionOpts` |

**Returns:** `Promise`<`string`>
A transaction hash

___

