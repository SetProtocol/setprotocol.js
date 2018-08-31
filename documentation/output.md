#  setprotocol.js API Reference
##  api
###  AccountingAPI

####  depositAsync

[Source](api/accounting.ts#L64)

```javascript
depositAsync(
  tokenAddresses: Address[],
  quantities: BigNumber[],
  txOpts: TxData,
): Promise<string>
```

Deposits tokens into the vault

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | Address[] |  |
| quantities | BigNumber[] |  |
| txOpts | TxData | The options for executing the transaction |
####  withdrawAsync

[Source](api/accounting.ts#L82)

```javascript
withdrawAsync(
  tokenAddresses: Address[],
  quantities: BigNumber[],
  txOpts: TxData,
): Promise<string>
```

Withdraws tokens from the vault

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | Address[] |  |
| quantities | BigNumber[] |  |
| txOpts | TxData | The options for executing the transaction |
###  IssuanceAPI

####  issueAsync

[Source](api/issuance.ts#L65)

```javascript
issueAsync(
  setAddress: Address,
  quantity: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously issues a particular quantity of tokens from a particular Sets

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Set token address of Set being issued |
| quantity | BigNumber | Number of Sets a user wants to issue in Wei |
| txOpts | TxData | The options for executing the transaction |
####  redeemAsync

[Source](api/issuance.ts#L81)

```javascript
redeemAsync(
  setAddress: Address,
  quantity: BigNumber,
  withdraw: boolean,
  tokensToExclude: Address[],
  txOpts: TxData,
): Promise<string>
```

Composite method to redeem and optionally withdraw tokens

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | The address of the Set token |
| quantity | BigNumber | The number of tokens to redeem |
| withdraw | boolean | Boolean determining whether or not to withdraw |
| tokensToExclude | Address[] | Array of token addresses to exclude from withdrawal |
| txOpts | TxData | The options for executing the transaction |
###  OrderAPI

####  cancelOrderAsync

[Source](api/orders.ts#L233)

```javascript
cancelOrderAsync(
  issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Cancels an Issuance Order

| Name | Type | Description |
| ------ | ------ | ------ |
| issuanceOrder | IssuanceOrder | Issuance order to cancel |
| quantityToCancel | BigNumber | Number of Set to cancel in this call |
| txOpts | TxData | The options for executing the transaction |
####  createSignedOrderAsync

[Source](api/orders.ts#L176)

```javascript
createSignedOrderAsync(
  setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address[],
  requiredComponentAmounts: BigNumber[],
  makerAddress: Address,
  makerToken: Address,
  makerTokenAmount: BigNumber,
  expiration: BigNumber,
  relayerAddress: Address,
  relayerToken: Address,
  makerRelayerFee: BigNumber,
  takerRelayerFee: BigNumber,
): Promise<SignedIssuanceOrder>
```

Creates a new signed Issuance Order including the signature

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the Set token for issuance order |
| quantity | BigNumber | Number of Set tokens to create as part of issuance order |
| requiredComponents | Address[] | Addresses of required component tokens of Set |
| requiredComponentAmounts | BigNumber[] | Amounts of each required component needed |
| makerAddress | Address | Address of person making the order |
| makerToken | Address | Address of token the issuer is paying in |
| makerTokenAmount | BigNumber | Number of tokens being exchanged for aggregate order size |
| expiration | BigNumber | Unix timestamp of expiration (in seconds) |
| relayerAddress | Address | Address of relayer of order |
| relayerToken | Address | Address of token paid to relayer |
| makerRelayerFee | BigNumber | Number of token paid to relayer by maker |
| takerRelayerFee | BigNumber | Number of token paid tp relayer by taker |
####  fillOrderAsync

[Source](api/orders.ts#L216)

```javascript
fillOrderAsync(
  signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orders: undefined[],
  txOpts: TxData,
): Promise<string>
```

Fills an Issuance Order

| Name | Type | Description |
| ------ | ------ | ------ |
| signedIssuanceOrder | SignedIssuanceOrder | Signed issuance order to fill |
| quantityToFill | BigNumber | Number of Set to fill in this call |
| orders | undefined[] |  |
| txOpts | TxData | The options for executing the transaction |
####  generateExpirationTimestamp

[Source](api/orders.ts#L90)

```javascript
generateExpirationTimestamp(
  seconds: number,
): BigNumber
```

Generates a timestamp represented as seconds since unix epoch.
The timestamp is intended to be used to generate the expiration of an issuance order

| Name | Type | Description |
| ------ | ------ | ------ |
| seconds | number |  |
####  generateSalt

[Source](api/orders.ts#L79)

```javascript
generateSalt(): BigNumber
```

Generates a pseudo-random 256-bit salt.
The salt can be included in an order, ensuring that the order generates a unique orderHash
and will not collide with other outstanding orders that are identical in all other parameters.

####  isValidOrderHashOrThrow

[Source](api/orders.ts#L101)

```javascript
isValidOrderHashOrThrow(
  orderHash: Bytes,
): void
```

Checks if the supplied hex encoded order hash is valid.
Note: Valid means it has the expected format, not that an order
with the orderHash exists.

| Name | Type | Description |
| ------ | ------ | ------ |
| orderHash | Bytes |  |
####  isValidSignatureOrThrowAsync

[Source](api/orders.ts#L114)

```javascript
isValidSignatureOrThrowAsync(
  issuanceOrder: IssuanceOrder,
  signature: ECSig,
): Promise<boolean>
```

Checks whether a particular issuance order and signature is valid
A signature is valid only if the issuance order is signed by the maker
The function throws upon receiving an invalid signature.

| Name | Type | Description |
| ------ | ------ | ------ |
| issuanceOrder | IssuanceOrder | The issuance order the signature was generated from |
| signature | ECSig | The EC Signature to check |
####  signOrderAsync

[Source](api/orders.ts#L133)

```javascript
signOrderAsync(
  issuanceOrder: IssuanceOrder,
  txOpts: TxData,
): Promise<ECSig>
```

Generates a ECSig from an issuance order. The function first generates an order hash.
Then it signs it using the passed in transaction options. If none, it will assume
the signer is the first account

| Name | Type | Description |
| ------ | ------ | ------ |
| issuanceOrder | IssuanceOrder | Issuance Order |
| txOpts | TxData |  |
####  validateOrderFillableOrThrowAsync

[Source](api/orders.ts#L148)

```javascript
validateOrderFillableOrThrowAsync(
  signedIssuanceOrder: SignedIssuanceOrder,
  fillQuantity: BigNumber,
): Promise<void>
```

Given an issuance order, check that the signature is valid, order has not expired,
and

| Name | Type | Description |
| ------ | ------ | ------ |
| signedIssuanceOrder | SignedIssuanceOrder |  |
| fillQuantity | BigNumber | (optional) a fill quantity to check if fillable
 |
##  assertions
###  AccountAssertions

####  notNull

[Source](assertions/AccountAssertions.ts#L23)

```javascript
notNull(
  account: Address,
  errorMessage: string,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| account | Address |  |
| errorMessage | string |  |
###  CommonAssertions

####  greaterThanZero

[Source](assertions/CommonAssertions.ts#L23)

```javascript
greaterThanZero(
  quantity: BigNumber,
  errorMessage: string,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| quantity | BigNumber |  |
| errorMessage | string |  |
####  isEqualLength

[Source](assertions/CommonAssertions.ts#L28)

```javascript
isEqualLength(
  arr1: any[],
  arr2: any[],
  errorMessage: string,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| arr1 | any[] |  |
| arr2 | any[] |  |
| errorMessage | string |  |
####  isGreaterOrEqualThan

[Source](assertions/CommonAssertions.ts#L34)

```javascript
isGreaterOrEqualThan(
  quantity1: BigNumber,
  quantity2: BigNumber,
  errorMessage: string,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| quantity1 | BigNumber |  |
| quantity2 | BigNumber |  |
| errorMessage | string |  |
####  isValidExpiration

[Source](assertions/CommonAssertions.ts#L46)

```javascript
isValidExpiration(
  expiration: BigNumber,
  errorMessage: string,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| expiration | BigNumber |  |
| errorMessage | string |  |
####  isValidString

[Source](assertions/CommonAssertions.ts#L40)

```javascript
isValidString(
  value: string,
  errorMessage: string,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| value | string |  |
| errorMessage | string |  |
###  CoreAssertions

####  implementsCore

[Source](assertions/CoreAssertions.ts#L36)

```javascript
implementsCore(
  coreInstance: ContractInstance,
): Promise<void>
```

Throws if the given candidateContract does not respond to some methods from the Core interface.

| Name | Type | Description |
| ------ | ------ | ------ |
| coreInstance | ContractInstance | An instance of the core contract |
####  isValidSignature

[Source](assertions/CoreAssertions.ts#L54)

```javascript
isValidSignature(
  issuanceOrder: IssuanceOrder,
  signature: ECSig,
  errorMessage: string,
): Promise<boolean>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| issuanceOrder | IssuanceOrder |  |
| signature | ECSig |  |
| errorMessage | string |  |
####  validateNaturalUnit

[Source](assertions/CoreAssertions.ts#L48)

```javascript
validateNaturalUnit(
  naturalUnit: BigNumber,
  minDecimal: BigNumber,
  errorMessage: string,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| naturalUnit | BigNumber |  |
| minDecimal | BigNumber |  |
| errorMessage | string |  |
###  ERC20Assertions

####  hasSufficientAllowance

[Source](assertions/ERC20Assertions.ts#L51)

```javascript
hasSufficientAllowance(
  token: ContractInstance,
  owner: string,
  spender: string,
  allowanceRequired: BigNumber,
  errorMessage: string,
): Promise<void>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| token | ContractInstance |  |
| owner | string |  |
| spender | string |  |
| allowanceRequired | BigNumber |  |
| errorMessage | string |  |
####  hasSufficientBalance

[Source](assertions/ERC20Assertions.ts#L38)

```javascript
hasSufficientBalance(
  token: ContractInstance,
  payer: Address,
  balanceRequired: BigNumber,
  errorMessage: string,
): Promise<void>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| token | ContractInstance |  |
| payer | Address |  |
| balanceRequired | BigNumber |  |
| errorMessage | string |  |
####  implementsERC20

[Source](assertions/ERC20Assertions.ts#L26)

```javascript
implementsERC20(
  tokenInstance: ContractInstance,
): Promise<void>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenInstance | ContractInstance |  |
###  OrderAssertions

####  isIssuanceOrderFillable

[Source](assertions/OrderAssertions.ts#L32)

```javascript
isIssuanceOrderFillable(
  core: CoreWrapper,
  signedIssuanceOrder: SignedIssuanceOrder,
  fillQuantity: BigNumber,
): Promise<void>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| core | CoreWrapper |  |
| signedIssuanceOrder | SignedIssuanceOrder |  |
| fillQuantity | BigNumber |  |
###  SchemaAssertions

####  IsValidWholeNumber

[Source](assertions/SchemaAssertions.ts#L48)

```javascript
IsValidWholeNumber(
  variableName: string,
  value: any,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| variableName | string |  |
| value | any |  |
####  isValidAddress

[Source](assertions/SchemaAssertions.ts#L32)

```javascript
isValidAddress(
  variableName: string,
  value: any,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| variableName | string |  |
| value | any |  |
####  isValidBytes

[Source](assertions/SchemaAssertions.ts#L40)

```javascript
isValidBytes(
  variableName: string,
  value: any,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| variableName | string |  |
| value | any |  |
####  isValidBytes32

[Source](assertions/SchemaAssertions.ts#L36)

```javascript
isValidBytes32(
  variableName: string,
  value: any,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| variableName | string |  |
| value | any |  |
####  isValidNumber

[Source](assertions/SchemaAssertions.ts#L44)

```javascript
isValidNumber(
  variableName: string,
  value: any,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| variableName | string |  |
| value | any |  |
###  SetTokenAssertions

####  hasSufficientAllowances

[Source](assertions/SetTokenAssertions.ts#L109)

```javascript
hasSufficientAllowances(
  setTokenInstance: ContractInstance,
  ownerAddress: Address,
  spenderAddress: Address,
  quantityInWei: BigNumber,
): Promise<void>
```

Throws if the given user doesn't have a sufficient allowance for a component token in a Set

| Name | Type | Description |
| ------ | ------ | ------ |
| setTokenInstance | ContractInstance | An instance of the Set Token contract |
| ownerAddress | Address | The address of the owner |
| spenderAddress | Address |  |
| quantityInWei | BigNumber | Amount of a Set in wei |
####  hasSufficientBalances

[Source](assertions/SetTokenAssertions.ts#L68)

```javascript
hasSufficientBalances(
  setTokenInstance: ContractInstance,
  ownerAddress: Address,
  quantityInWei: BigNumber,
): Promise<void>
```

Throws if the given user doesn't have a sufficient balance for a component token in a Set

| Name | Type | Description |
| ------ | ------ | ------ |
| setTokenInstance | ContractInstance | An instance of the Set Token contract |
| ownerAddress | Address | The address of the owner |
| quantityInWei | BigNumber | Amount of a Set in wei |
####  implementsSetToken

[Source](assertions/SetTokenAssertions.ts#L44)

```javascript
implementsSetToken(
  setTokenInstance: ContractInstance,
): Promise<void>
```

Throws if the given candidateContract does not respond to some methods from the Set Token interface.

| Name | Type | Description |
| ------ | ------ | ------ |
| setTokenInstance | ContractInstance | An instance of the Set Token contract |
####  isMultipleOfNaturalUnit

[Source](assertions/SetTokenAssertions.ts#L144)

```javascript
isMultipleOfNaturalUnit(
  setTokenInstance: ContractInstance,
  quantityInWei: BigNumber,
  errorMessage: string,
): Promise<void>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| setTokenInstance | ContractInstance |  |
| quantityInWei | BigNumber |  |
| errorMessage | string |  |
###  VaultAssertions

####  hasSufficientSetTokensBalances

[Source](assertions/VaultAssertions.ts#L65)

```javascript
hasSufficientSetTokensBalances(
  vaultInstance: ContractInstance,
  setTokenInstance: ContractInstance,
  quantityInWei: BigNumber,
  errorMessage: string,
): Promise<void>
```

Throws if the Set doesn't have a sufficient balance for its tokens in the Vault

| Name | Type | Description |
| ------ | ------ | ------ |
| vaultInstance | ContractInstance | An instance of the Vault contract |
| setTokenInstance | ContractInstance | An instance of the Set token contract |
| quantityInWei | BigNumber | Amount of a Set in wei |
| errorMessage | string |  |
####  hasSufficientTokenBalance

[Source](assertions/VaultAssertions.ts#L42)

```javascript
hasSufficientTokenBalance(
  vaultInstance: ContractInstance,
  tokenAddress: Address,
  ownerAddress: Address,
  quantityInWei: BigNumber,
  errorMessage: string,
): Promise<void>
```

Throws if the Vault doesn't have enough of token

| Name | Type | Description |
| ------ | ------ | ------ |
| vaultInstance | ContractInstance | An instance of the Vault contract |
| tokenAddress | Address | An instance of the Set token contract |
| ownerAddress | Address | Address of owner withdrawing from vault |
| quantityInWei | BigNumber | Amount of a Set in wei |
| errorMessage | string |  |
###  Assertions

##  schemas
###  SchemaValidator

####  addCustomValidators

[Source](schemas/SchemaValidator.ts#L55)

```javascript
addCustomValidators(): void
```

####  addSchema

[Source](schemas/SchemaValidator.ts#L42)

```javascript
addSchema(
  schema: Schema,
): void
```

| Name | Type | Description |
| ------ | ------ | ------ |
| schema | Schema |  |
####  isValid

[Source](schemas/SchemaValidator.ts#L50)

```javascript
isValid(
  instance: any,
  schema: Schema,
): boolean
```

| Name | Type | Description |
| ------ | ------ | ------ |
| instance | any |  |
| schema | Schema |  |
####  validate

[Source](schemas/SchemaValidator.ts#L46)

```javascript
validate(
  instance: any,
  schema: Schema,
): ValidatorResult
```

| Name | Type | Description |
| ------ | ------ | ------ |
| instance | any |  |
| schema | Schema |  |
##  util
###  Web3Utils

####  doesContractExistAtAddressAsync

[Source](util/Web3Utils.ts#L48)

```javascript
doesContractExistAtAddressAsync(
  address: string,
): Promise<boolean>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| address | string |  |
####  getAvailableAddressesAsync

[Source](util/Web3Utils.ts#L44)

```javascript
getAvailableAddressesAsync(): Promise<string[]>
```

####  getCurrentBlockTime

[Source](util/Web3Utils.ts#L75)

```javascript
getCurrentBlockTime(): Promise<number>
```

Returns the current blocktime in seconds.

####  getNetworkIdAsync

[Source](util/Web3Utils.ts#L40)

```javascript
getNetworkIdAsync(): Promise<number>
```

####  getTransactionReceiptAsync

[Source](util/Web3Utils.ts#L56)

```javascript
getTransactionReceiptAsync(
  txHash: string,
): Promise<TransactionReceipt>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| txHash | string |  |
####  increaseTime

[Source](util/Web3Utils.ts#L88)

```javascript
increaseTime(
  seconds: number,
): Promise<boolean>
```

Increases block time by the given number of seconds. Returns true
if the next block was mined successfully after increasing time.

| Name | Type | Description |
| ------ | ------ | ------ |
| seconds | number |  |
####  mineBlock

[Source](util/Web3Utils.ts#L102)

```javascript
mineBlock(): Promise<JSONRPCResponsePayload>
```

Mines a single block.

####  revertToSnapshot

[Source](util/Web3Utils.ts#L65)

```javascript
revertToSnapshot(
  snapshotId: number,
): Promise<boolean>
```

| Name | Type | Description |
| ------ | ------ | ------ |
| snapshotId | number |  |
####  saveTestSnapshot

[Source](util/Web3Utils.ts#L60)

```javascript
saveTestSnapshot(): Promise<number>
```

####  soliditySHA3

[Source](util/Web3Utils.ts#L36)

```javascript
soliditySHA3(
  payload: any[],
): string
```

| Name | Type | Description |
| ------ | ------ | ------ |
| payload | any[] |  |
###  SignatureUtils

####  addPersonalMessagePrefix

[Source](util/signatureUtils.ts#L66)

```javascript
addPersonalMessagePrefix(
  messageHashHex: string,
): string
```

Applies an Ethereum-specific prefix to the message payload we intend on signing,
as per the `eth_sign` specification in the JSON-RPC wiki:

https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign

This must *sometimes* be manually done by our libraries because certain signing
clients (e.g. Metamask) do not adhere to the `eth_sign` specification described
above.


| Name | Type | Description |
| ------ | ------ | ------ |
| messageHashHex | string | The raw hex message payload |
####  convertToHexRSV

[Source](util/signatureUtils.ts#L99)

```javascript
convertToHexRSV(
  signature: ECSig,
): string
```

| Name | Type | Description |
| ------ | ------ | ------ |
| signature | ECSig |  |
####  convertToHexVRS

[Source](util/signatureUtils.ts#L104)

```javascript
convertToHexVRS(
  signature: ECSig,
): string
```

| Name | Type | Description |
| ------ | ------ | ------ |
| signature | ECSig |  |
####  isValidSignature

[Source](util/signatureUtils.ts#L24)

```javascript
isValidSignature(
  data: string,
  signature: ECSig,
  signerAddress: string,
  addPersonalMessagePrefix: boolean,
): boolean
```

Given a data payload, signature, and a signer's address, returns true
if the given signature is valid.

| Name | Type | Description |
| ------ | ------ | ------ |
| data | string | Data payload |
| signature | ECSig | Signature |
| signerAddress | string | The Signer's address |
| addPersonalMessagePrefix | boolean | In certain circumstances, the `eth_sign`
     API adds an Ethereum-specific prefix to message payloads.  This option
     specifies whether, in the `isValidSignature`, we want to add the
     Ethereum-specifc prefix to the message payload. |
####  parseSignatureHexAsRSV

[Source](util/signatureUtils.ts#L89)

```javascript
parseSignatureHexAsRSV(
  signatureHex: string,
): ECSig
```

| Name | Type | Description |
| ------ | ------ | ------ |
| signatureHex | string |  |
####  parseSignatureHexAsVRS

[Source](util/signatureUtils.ts#L73)

```javascript
parseSignatureHexAsVRS(
  signatureHex: string,
): ECSig
```

| Name | Type | Description |
| ------ | ------ | ------ |
| signatureHex | string |  |
##  wrappers
###  ContractWrapper

####  loadCoreAsync

[Source](wrappers/ContractWrapper.ts#L56)

```javascript
loadCoreAsync(
  coreAddress: Address,
  transactionOptions: object,
): Promise<CoreContract>
```

Load Core contract

| Name | Type | Description |
| ------ | ------ | ------ |
| coreAddress | Address | Address of the Core contract |
| transactionOptions | object | Options sent into the contract deployed method |
####  loadERC20TokenAsync

[Source](wrappers/ContractWrapper.ts#L108)

```javascript
loadERC20TokenAsync(
  tokenAddress: Address,
  transactionOptions: object,
): Promise<DetailedERC20Contract>
```

Load ERC20 Token contract

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 Token contract |
| transactionOptions | object | Options sent into the contract deployed method |
####  loadSetTokenAsync

[Source](wrappers/ContractWrapper.ts#L80)

```javascript
loadSetTokenAsync(
  setTokenAddress: Address,
  transactionOptions: object,
): Promise<SetTokenContract>
```

Load Set Token contract

| Name | Type | Description |
| ------ | ------ | ------ |
| setTokenAddress | Address | Address of the Set Token contract |
| transactionOptions | object | Options sent into the contract deployed method |
####  loadVaultAsync

[Source](wrappers/ContractWrapper.ts#L136)

```javascript
loadVaultAsync(
  vaultAddress: Address,
  transactionOptions: object,
): Promise<VaultContract>
```

Load Vault contract

| Name | Type | Description |
| ------ | ------ | ------ |
| vaultAddress | Address | Address of the Vault contract |
| transactionOptions | object | Options sent into the contract deployed method |
###  CoreWrapper

####  batchDeposit

[Source](wrappers/CoreWrapper.ts#L280)

```javascript
batchDeposit(
  tokenAddresses: Address[],
  quantitiesInWei: BigNumber[],
  txOpts: TxData,
): Promise<string>
```

Asynchronously batch deposits tokens to the vault

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | Address[] |  |
| quantitiesInWei | BigNumber[] |  |
| txOpts | TxData | The options for executing the transaction |
####  batchWithdraw

[Source](wrappers/CoreWrapper.ts#L303)

```javascript
batchWithdraw(
  tokenAddresses: Address[],
  quantitiesInWei: BigNumber[],
  txOpts: TxData,
): Promise<string>
```

Asynchronously batch withdraws tokens from the vault

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddresses | Address[] |  |
| quantitiesInWei | BigNumber[] |  |
| txOpts | TxData | The options for executing the transaction |
####  cancelOrder

[Source](wrappers/CoreWrapper.ts#L457)

```javascript
cancelOrder(
  issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Cancels an Issuance Order

| Name | Type | Description |
| ------ | ------ | ------ |
| issuanceOrder | IssuanceOrder | Issuance order to cancel |
| quantityToCancel | BigNumber | Number of Set to cancel in this call |
| txOpts | TxData | The options for executing the transaction |
####  createOrder

[Source](wrappers/CoreWrapper.ts#L335)

```javascript
createOrder(
  setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address[],
  requiredComponentAmounts: BigNumber[],
  makerAddress: Address,
  makerToken: Address,
  makerTokenAmount: BigNumber,
  expiration: BigNumber,
  relayerAddress: Address,
  relayerToken: Address,
  makerRelayerFee: BigNumber,
  takerRelayerFee: BigNumber,
): Promise<SignedIssuanceOrder>
```

Creates a new Issuance Order including the signature

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the Set token for issuance order |
| quantity | BigNumber | Number of Set tokens to create as part of issuance order |
| requiredComponents | Address[] | Addresses of required component tokens of Set |
| requiredComponentAmounts | BigNumber[] | Amounts of each required component needed |
| makerAddress | Address | Address of person making the order |
| makerToken | Address | Address of token the issuer is paying in |
| makerTokenAmount | BigNumber | Number of tokens being exchanged for aggregate order size |
| expiration | BigNumber | Unix timestamp of expiration (in seconds) |
| relayerAddress | Address | Address of relayer of order |
| relayerToken | Address | Address of token paid to relayer |
| makerRelayerFee | BigNumber | Number of token paid to relayer by maker |
| takerRelayerFee | BigNumber | Number of token paid tp relayer by taker |
####  createSet

[Source](wrappers/CoreWrapper.ts#L98)

```javascript
createSet(
  factoryAddress: Address,
  components: Address[],
  units: BigNumber[],
  naturalUnit: BigNumber,
  name: string,
  symbol: string,
  txOpts: TxData,
): Promise<string>
```

Create a new Set, specifying the components, units, name, symbol to use.

| Name | Type | Description |
| ------ | ------ | ------ |
| factoryAddress | Address | Set Token factory address of the token being created |
| components | Address[] | Component token addresses |
| units | BigNumber[] | Units of corresponding token components |
| naturalUnit | BigNumber | Supplied as the lowest common denominator for the Set |
| name | string | User-supplied name for Set (i.e. "DEX Set") |
| symbol | string | User-supplied symbol for Set (i.e. "DEX") |
| txOpts | TxData | The options for executing the transaction |
####  deposit

[Source](wrappers/CoreWrapper.ts#L234)

```javascript
deposit(
  tokenAddress: Address,
  quantity: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously deposits tokens to the vault

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 token |
| quantity | BigNumber | Number of tokens a user wants to deposit into the vault |
| txOpts | TxData | The options for executing the transaction |
####  fillOrder

[Source](wrappers/CoreWrapper.ts#L395)

```javascript
fillOrder(
  signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orders: undefined[],
  txOpts: TxData,
): Promise<string>
```

Fills an Issuance Order

| Name | Type | Description |
| ------ | ------ | ------ |
| signedIssuanceOrder | SignedIssuanceOrder | Signed issuance order to fill |
| quantityToFill | BigNumber | Number of Set to fill in this call |
| orders | undefined[] |  |
| txOpts | TxData | The options for executing the transaction |
####  getExchangeAddress

[Source](wrappers/CoreWrapper.ts#L506)

```javascript
getExchangeAddress(
  exchangeId: number,
): Promise<Address>
```

Asynchronously gets the exchange address for a given exhange id

| Name | Type | Description |
| ------ | ------ | ------ |
| exchangeId | number | Enum id of the exchange |
####  getFactories

[Source](wrappers/CoreWrapper.ts#L539)

```javascript
getFactories(): Promise<Address[]>
```

Asynchronously gets factory addresses

####  getOrderCancels

[Source](wrappers/CoreWrapper.ts#L603)

```javascript
getOrderCancels(
  orderHash: Bytes,
): Promise<BigNumber>
```

Asynchronously gets the quantity of the Issuance Order cancelled

| Name | Type | Description |
| ------ | ------ | ------ |
| orderHash | Bytes | Address of the Set contract |
####  getOrderFills

[Source](wrappers/CoreWrapper.ts#L590)

```javascript
getOrderFills(
  orderHash: Bytes,
): Promise<BigNumber>
```

Asynchronously gets the quantity of the Issuance Order filled

| Name | Type | Description |
| ------ | ------ | ------ |
| orderHash | Bytes | Bytes32 hash |
####  getSetAddressFromCreateTxHash

[Source](wrappers/CoreWrapper.ts#L141)

```javascript
getSetAddressFromCreateTxHash(
  txHash: string,
): Promise<Address>
```

Asynchronously retrieves a Set Token address from a createSet txHash

| Name | Type | Description |
| ------ | ------ | ------ |
| txHash | string | The transaction has to retrieve the set address from |
####  getSetAddresses

[Source](wrappers/CoreWrapper.ts#L551)

```javascript
getSetAddresses(): Promise<Address[]>
```

Fetch the addresses of SetTokens and RebalancingSetTokens created by the system
of contracts specified in SetProtcolConfig

####  getTransferProxyAddress

[Source](wrappers/CoreWrapper.ts#L517)

```javascript
getTransferProxyAddress(): Promise<Address>
```

Asynchronously gets the transfer proxy address

####  getVaultAddress

[Source](wrappers/CoreWrapper.ts#L528)

```javascript
getVaultAddress(): Promise<Address>
```

Asynchronously gets the vault address

####  isValidFactoryAsync

[Source](wrappers/CoreWrapper.ts#L563)

```javascript
isValidFactoryAsync(
  factoryAddress: Address,
): Promise<boolean>
```

Verifies that the provided SetToken factory is enabled for creating a new SetToken

| Name | Type | Description |
| ------ | ------ | ------ |
| factoryAddress | Address | Address of the factory contract |
####  isValidSetAsync

[Source](wrappers/CoreWrapper.ts#L577)

```javascript
isValidSetAsync(
  setAddress: Address,
): Promise<boolean>
```

Verifies that the provided SetToken or RebalancingSetToken address is enabled
for issuance and redemption

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the SetToken or RebalancingSetToken contract |
####  issue

[Source](wrappers/CoreWrapper.ts#L157)

```javascript
issue(
  setAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously issues a particular quantity of tokens from a particular Sets

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Set token address of Set being issued |
| quantityInWei | BigNumber | Number of Sets a user wants to issue in Wei |
| txOpts | TxData | The options for executing the transaction |
####  redeem

[Source](wrappers/CoreWrapper.ts#L180)

```javascript
redeem(
  setAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously redeems a particular quantity of tokens from a particular Sets

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Set token address of Set being issued |
| quantityInWei | BigNumber | Number of Sets a user wants to redeem in Wei |
| txOpts | TxData | The options for executing the transaction |
####  redeemAndWithdraw

[Source](wrappers/CoreWrapper.ts#L209)

```javascript
redeemAndWithdraw(
  setAddress: Address,
  quantityInWei: BigNumber,
  toExclude: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Redeem and withdraw with a single transaction

Normally, you should expect to be able to withdraw all of the tokens.
However, some have central abilities to freeze transfers (e.g. EOS). _toExclude
allows you to optionally specify which component tokens to remain under the user's
address in the vault. The rest will be transferred to the user.


| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | The address of the Set token |
| quantityInWei | BigNumber | The number of tokens to redeem |
| toExclude | BigNumber | Bitmask of component indexes to exclude from withdrawal |
| txOpts | TxData | The options for executing the transaction |
####  withdraw

[Source](wrappers/CoreWrapper.ts#L257)

```javascript
withdraw(
  tokenAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously withdraw tokens from the vault

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 token |
| quantityInWei | BigNumber | Number of tokens a user wants to withdraw from the vault |
| txOpts | TxData | The options for executing the transaction |
###  ERC20Wrapper

####  approveAsync

[Source](wrappers/ERC20Wrapper.ts#L221)

```javascript
approveAsync(
  tokenAddress: Address,
  spenderAddress: Address,
  value: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously approves the value amount of the spender from the owner

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | the address of the token being used. |
| spenderAddress | Address | the spender. |
| value | BigNumber | the amount to be approved. |
| txOpts | TxData | any parameters necessary to modify the transaction. |
####  getAllowanceAsync

[Source](wrappers/ERC20Wrapper.ts#L117)

```javascript
getAllowanceAsync(
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address,
): Promise<BigNumber>
```

Gets the allowance of the spender by the owner account

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the token |
| ownerAddress | Address | Address of the owner |
| spenderAddress | Address |  |
####  getBalanceOfAsync

[Source](wrappers/ERC20Wrapper.ts#L53)

```javascript
getBalanceOfAsync(
  tokenAddress: Address,
  userAddress: Address,
): Promise<BigNumber>
```

Gets balance of the ERC20 token

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 token |
| userAddress | Address | Address of the user |
####  getDecimalsAsync

[Source](wrappers/ERC20Wrapper.ts#L103)

```javascript
getDecimalsAsync(
  tokenAddress: Address,
): Promise<BigNumber>
```

Gets decimals of the ERC20 token

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 token |
####  getNameAsync

[Source](wrappers/ERC20Wrapper.ts#L66)

```javascript
getNameAsync(
  tokenAddress: Address,
): Promise<string>
```

Gets name of the ERC20 token

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 token |
####  getSymbolAsync

[Source](wrappers/ERC20Wrapper.ts#L78)

```javascript
getSymbolAsync(
  tokenAddress: Address,
): Promise<string>
```

Gets balance of the ERC20 token

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 token |
####  getTotalSupplyAsync

[Source](wrappers/ERC20Wrapper.ts#L90)

```javascript
getTotalSupplyAsync(
  tokenAddress: Address,
): Promise<BigNumber>
```

Gets the total supply of the ERC20 token

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the ERC20 token |
####  transferAsync

[Source](wrappers/ERC20Wrapper.ts#L140)

```javascript
transferAsync(
  tokenAddress: Address,
  to: Address,
  value: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously transfer value denominated in the specified ERC20 token to
the address specified.

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | the address of the token being used. |
| to | Address | to whom the transfer is being made. |
| value | BigNumber | the amount being transferred. |
| txOpts | TxData | any parameters necessary to modify the transaction. |
####  transferFromAsync

[Source](wrappers/ERC20Wrapper.ts#L177)

```javascript
transferFromAsync(
  tokenAddress: Address,
  from: Address,
  to: Address,
  value: BigNumber,
  txOpts: TxData,
): Promise<string>
```

Asynchronously transfer the value amount in the token specified so long
as the sender of the message has received sufficient allowance on behalf
of `from` to do so.

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | the address of the token being used. |
| from | Address | from whom are the funds being transferred. |
| to | Address | to whom are the funds being transferred. |
| value | BigNumber | the amount to be transferred. |
| txOpts | TxData | any parameters necessary to modify the transaction. |
###  SetTokenWrapper

####  getComponentsAsync

[Source](wrappers/SetTokenWrapper.ts#L63)

```javascript
getComponentsAsync(
  setAddress: Address,
): Promise<Address[]>
```

Gets component tokens that make up the Set

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the Set |
####  getFactoryAsync

[Source](wrappers/SetTokenWrapper.ts#L52)

```javascript
getFactoryAsync(
  setAddress: Address,
): Promise<Address>
```

Gets the Set's origin factory

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the Set |
####  getNaturalUnitAsync

[Source](wrappers/SetTokenWrapper.ts#L74)

```javascript
getNaturalUnitAsync(
  setAddress: Address,
): Promise<BigNumber>
```

Gets natural unit of the Set

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the Set |
####  getUnitsAsync

[Source](wrappers/SetTokenWrapper.ts#L86)

```javascript
getUnitsAsync(
  setAddress: Address,
): Promise<BigNumber[]>
```

Gets units of each component token that make up the Set

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the Set |
####  isMultipleOfNaturalUnitAsync

[Source](wrappers/SetTokenWrapper.ts#L99)

```javascript
isMultipleOfNaturalUnitAsync(
  setAddress: Address,
  quantity: BigNumber,
): Promise<boolean>
```

Returns whether the quantity passed in is a multiple of a Set's natural unit

| Name | Type | Description |
| ------ | ------ | ------ |
| setAddress | Address | Address of the Set |
| quantity | BigNumber | Quantity to be checked |
###  VaultWrapper

####  getBalanceInVault

[Source](wrappers/VaultWrapper.ts#L54)

```javascript
getBalanceInVault(
  tokenAddress: Address,
  ownerAddress: Address,
): Promise<BigNumber>
```

Fetch the balance of the provided contract address inside the vault specified
in SetProtocolConfig

| Name | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | Address | Address of the contract (typically SetToken or ERC20) |
| ownerAddress | Address | Address of the user |
