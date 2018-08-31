#  setprotocol.js API Reference
#  api
##  AccountingAPI

###  assertDeposit

[Source](api/accounting.ts#L94)

```javascript
assertDeposit(
  userAddress: Address,
  tokenAddresses: Address,
  quantities: BigNumber,
): Promise<void>
```

userAddress: Address,
  tokenAddresses: Address,
  quantities: BigNumber

###  assertWithdraw

[Source](api/accounting.ts#L137)

```javascript
assertWithdraw(
  userAddress: Address,
  tokenAddresses: Address,
  quantities: BigNumber,
): Promise<void>
```

userAddress: Address,
  tokenAddresses: Address,
  quantities: BigNumber

###  depositAsync

[Source](api/accounting.ts#L64)

Deposits tokens into the vault

```javascript
depositAsync(
  tokenAddresses: Address,
  quantities: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddresses: Address,
  quantities: BigNumber,
  txOpts: TxData

###  withdrawAsync

[Source](api/accounting.ts#L82)

Withdraws tokens from the vault

```javascript
withdrawAsync(
  tokenAddresses: Address,
  quantities: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddresses: Address,
  quantities: BigNumber,
  txOpts: TxData

##  IssuanceAPI

###  assertIssue

[Source](api/issuance.ts#L109)

```javascript
assertIssue(
  userAddress: Address,
  setAddress: Address,
  quantity: BigNumber,
): Promise<void>
```

userAddress: Address,
  setAddress: Address,
  quantity: BigNumber

###  assertRedeem

[Source](api/issuance.ts#L130)

```javascript
assertRedeem(
  userAddress: Address,
  setAddress: Address,
  quantity: BigNumber,
  withdraw: boolean,
  tokensToExclude: Address,
): Promise<void>
```

userAddress: Address,
  setAddress: Address,
  quantity: BigNumber,
  withdraw: boolean,
  tokensToExclude: Address

###  issueAsync

[Source](api/issuance.ts#L65)

Asynchronously issues a particular quantity of tokens from a particular Sets

```javascript
issueAsync(
  setAddress: Address,
  quantity: BigNumber,
  txOpts: TxData,
): Promise<string>
```

setAddress: Address,
  quantity: BigNumber,
  txOpts: TxData

###  redeemAsync

[Source](api/issuance.ts#L81)

Composite method to redeem and optionally withdraw tokens

```javascript
redeemAsync(
  setAddress: Address,
  quantity: BigNumber,
  withdraw: boolean,
  tokensToExclude: Address,
  txOpts: TxData,
): Promise<string>
```

setAddress: Address,
  quantity: BigNumber,
  withdraw: boolean,
  tokensToExclude: Address,
  txOpts: TxData

##  OrderAPI

###  cancelOrderAsync

[Source](api/orders.ts#L233)

Cancels an Issuance Order

```javascript
cancelOrderAsync(
  issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber,
  txOpts: TxData,
): Promise<string>
```

issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber,
  txOpts: TxData

###  createSignedOrderAsync

[Source](api/orders.ts#L176)

Creates a new signed Issuance Order including the signature

```javascript
createSignedOrderAsync(
  setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address,
  requiredComponentAmounts: BigNumber,
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

setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address,
  requiredComponentAmounts: BigNumber,
  makerAddress: Address,
  makerToken: Address,
  makerTokenAmount: BigNumber,
  expiration: BigNumber,
  relayerAddress: Address,
  relayerToken: Address,
  makerRelayerFee: BigNumber,
  takerRelayerFee: BigNumber

###  fillOrderAsync

[Source](api/orders.ts#L216)

Fills an Issuance Order

```javascript
fillOrderAsync(
  signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orders: undefined,
  txOpts: TxData,
): Promise<string>
```

signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orders: undefined,
  txOpts: TxData

###  generateExpirationTimestamp

[Source](api/orders.ts#L90)

Generates a timestamp represented as seconds since unix epoch.
The timestamp is intended to be used to generate the expiration of an issuance order

```javascript
generateExpirationTimestamp(
  seconds: number,
): BigNumber
```

seconds: number

###  generateSalt

[Source](api/orders.ts#L79)

Generates a pseudo-random 256-bit salt.
The salt can be included in an order, ensuring that the order generates a unique orderHash
and will not collide with other outstanding orders that are identical in all other parameters.

```javascript
generateSalt(): BigNumber
```



###  isValidOrderHashOrThrow

[Source](api/orders.ts#L101)

Checks if the supplied hex encoded order hash is valid.
Note: Valid means it has the expected format, not that an order
with the orderHash exists.

```javascript
isValidOrderHashOrThrow(
  orderHash: Bytes,
): void
```

orderHash: Bytes

###  isValidSignatureOrThrowAsync

[Source](api/orders.ts#L114)

Checks whether a particular issuance order and signature is valid
A signature is valid only if the issuance order is signed by the maker
The function throws upon receiving an invalid signature.

```javascript
isValidSignatureOrThrowAsync(
  issuanceOrder: IssuanceOrder,
  signature: ECSig,
): Promise<boolean>
```

issuanceOrder: IssuanceOrder,
  signature: ECSig

###  signOrderAsync

[Source](api/orders.ts#L133)

Generates a ECSig from an issuance order. The function first generates an order hash.
Then it signs it using the passed in transaction options. If none, it will assume
the signer is the first account

```javascript
signOrderAsync(
  issuanceOrder: IssuanceOrder,
  txOpts: TxData,
): Promise<ECSig>
```

issuanceOrder: IssuanceOrder,
  txOpts: TxData

###  validateOrderFillableOrThrowAsync

[Source](api/orders.ts#L148)

Given an issuance order, check that the signature is valid, order has not expired,
and

```javascript
validateOrderFillableOrThrowAsync(
  signedIssuanceOrder: SignedIssuanceOrder,
  fillQuantity: BigNumber,
): Promise<void>
```

signedIssuanceOrder: SignedIssuanceOrder,
  fillQuantity: BigNumber

#  assertions
##  AccountAssertions

###  notNull

[Source](assertions/AccountAssertions.ts#L23)

```javascript
notNull(
  account: Address,
  errorMessage: string,
): void
```

account: Address,
  errorMessage: string

##  CommonAssertions

###  greaterThanZero

[Source](assertions/CommonAssertions.ts#L23)

```javascript
greaterThanZero(
  quantity: BigNumber,
  errorMessage: string,
): void
```

quantity: BigNumber,
  errorMessage: string

###  isEqualLength

[Source](assertions/CommonAssertions.ts#L28)

```javascript
isEqualLength(
  arr1: any,
  arr2: any,
  errorMessage: string,
): void
```

arr1: any,
  arr2: any,
  errorMessage: string

###  isGreaterOrEqualThan

[Source](assertions/CommonAssertions.ts#L34)

```javascript
isGreaterOrEqualThan(
  quantity1: BigNumber,
  quantity2: BigNumber,
  errorMessage: string,
): void
```

quantity1: BigNumber,
  quantity2: BigNumber,
  errorMessage: string

###  isValidExpiration

[Source](assertions/CommonAssertions.ts#L46)

```javascript
isValidExpiration(
  expiration: BigNumber,
  errorMessage: string,
): void
```

expiration: BigNumber,
  errorMessage: string

###  isValidString

[Source](assertions/CommonAssertions.ts#L40)

```javascript
isValidString(
  value: string,
  errorMessage: string,
): void
```

value: string,
  errorMessage: string

##  CoreAssertions

###  implementsCore

[Source](assertions/CoreAssertions.ts#L36)

Throws if the given candidateContract does not respond to some methods from the Core interface.

```javascript
implementsCore(
  coreInstance: ContractInstance,
): Promise<void>
```

coreInstance: ContractInstance

###  isValidSignature

[Source](assertions/CoreAssertions.ts#L54)

```javascript
isValidSignature(
  issuanceOrder: IssuanceOrder,
  signature: ECSig,
  errorMessage: string,
): Promise<boolean>
```

issuanceOrder: IssuanceOrder,
  signature: ECSig,
  errorMessage: string

###  validateNaturalUnit

[Source](assertions/CoreAssertions.ts#L48)

```javascript
validateNaturalUnit(
  naturalUnit: BigNumber,
  minDecimal: BigNumber,
  errorMessage: string,
): void
```

naturalUnit: BigNumber,
  minDecimal: BigNumber,
  errorMessage: string

##  ERC20Assertions

###  hasSufficientAllowance

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

token: ContractInstance,
  owner: string,
  spender: string,
  allowanceRequired: BigNumber,
  errorMessage: string

###  hasSufficientBalance

[Source](assertions/ERC20Assertions.ts#L38)

```javascript
hasSufficientBalance(
  token: ContractInstance,
  payer: Address,
  balanceRequired: BigNumber,
  errorMessage: string,
): Promise<void>
```

token: ContractInstance,
  payer: Address,
  balanceRequired: BigNumber,
  errorMessage: string

###  implementsERC20

[Source](assertions/ERC20Assertions.ts#L26)

```javascript
implementsERC20(
  tokenInstance: ContractInstance,
): Promise<void>
```

tokenInstance: ContractInstance

##  OrderAssertions

###  isIssuanceOrderFillable

[Source](assertions/OrderAssertions.ts#L32)

```javascript
isIssuanceOrderFillable(
  core: CoreWrapper,
  signedIssuanceOrder: SignedIssuanceOrder,
  fillQuantity: BigNumber,
): Promise<void>
```

core: CoreWrapper,
  signedIssuanceOrder: SignedIssuanceOrder,
  fillQuantity: BigNumber

##  SchemaAssertions

###  IsValidWholeNumber

[Source](assertions/SchemaAssertions.ts#L48)

```javascript
IsValidWholeNumber(
  variableName: string,
  value: any,
): void
```

variableName: string,
  value: any

###  assertConformsToSchema

[Source](assertions/SchemaAssertions.ts#L52)

```javascript
assertConformsToSchema(
  variableName: string,
  value: any,
  schema: Schema,
): void
```

variableName: string,
  value: any,
  schema: Schema

###  isValidAddress

[Source](assertions/SchemaAssertions.ts#L32)

```javascript
isValidAddress(
  variableName: string,
  value: any,
): void
```

variableName: string,
  value: any

###  isValidBytes

[Source](assertions/SchemaAssertions.ts#L40)

```javascript
isValidBytes(
  variableName: string,
  value: any,
): void
```

variableName: string,
  value: any

###  isValidBytes32

[Source](assertions/SchemaAssertions.ts#L36)

```javascript
isValidBytes32(
  variableName: string,
  value: any,
): void
```

variableName: string,
  value: any

###  isValidNumber

[Source](assertions/SchemaAssertions.ts#L44)

```javascript
isValidNumber(
  variableName: string,
  value: any,
): void
```

variableName: string,
  value: any

##  SetTokenAssertions

###  hasSufficientAllowances

[Source](assertions/SetTokenAssertions.ts#L109)

Throws if the given user doesn't have a sufficient allowance for a component token in a Set

```javascript
hasSufficientAllowances(
  setTokenInstance: ContractInstance,
  ownerAddress: Address,
  spenderAddress: Address,
  quantityInWei: BigNumber,
): Promise<void>
```

setTokenInstance: ContractInstance,
  ownerAddress: Address,
  spenderAddress: Address,
  quantityInWei: BigNumber

###  hasSufficientBalances

[Source](assertions/SetTokenAssertions.ts#L68)

Throws if the given user doesn't have a sufficient balance for a component token in a Set

```javascript
hasSufficientBalances(
  setTokenInstance: ContractInstance,
  ownerAddress: Address,
  quantityInWei: BigNumber,
): Promise<void>
```

setTokenInstance: ContractInstance,
  ownerAddress: Address,
  quantityInWei: BigNumber

###  implementsSetToken

[Source](assertions/SetTokenAssertions.ts#L44)

Throws if the given candidateContract does not respond to some methods from the Set Token interface.

```javascript
implementsSetToken(
  setTokenInstance: ContractInstance,
): Promise<void>
```

setTokenInstance: ContractInstance

###  isMultipleOfNaturalUnit

[Source](assertions/SetTokenAssertions.ts#L144)

```javascript
isMultipleOfNaturalUnit(
  setTokenInstance: ContractInstance,
  quantityInWei: BigNumber,
  errorMessage: string,
): Promise<void>
```

setTokenInstance: ContractInstance,
  quantityInWei: BigNumber,
  errorMessage: string

##  VaultAssertions

###  hasSufficientSetTokensBalances

[Source](assertions/VaultAssertions.ts#L65)

Throws if the Set doesn't have a sufficient balance for its tokens in the Vault

```javascript
hasSufficientSetTokensBalances(
  vaultInstance: ContractInstance,
  setTokenInstance: ContractInstance,
  quantityInWei: BigNumber,
  errorMessage: string,
): Promise<void>
```

vaultInstance: ContractInstance,
  setTokenInstance: ContractInstance,
  quantityInWei: BigNumber,
  errorMessage: string

###  hasSufficientTokenBalance

[Source](assertions/VaultAssertions.ts#L42)

Throws if the Vault doesn't have enough of token

```javascript
hasSufficientTokenBalance(
  vaultInstance: ContractInstance,
  tokenAddress: Address,
  ownerAddress: Address,
  quantityInWei: BigNumber,
  errorMessage: string,
): Promise<void>
```

vaultInstance: ContractInstance,
  tokenAddress: Address,
  ownerAddress: Address,
  quantityInWei: BigNumber,
  errorMessage: string

##  Assertions

#  schemas
##  SchemaValidator

###  addCustomValidators

[Source](schemas/SchemaValidator.ts#L55)

```javascript
addCustomValidators(): void
```



###  addSchema

[Source](schemas/SchemaValidator.ts#L42)

```javascript
addSchema(
  schema: Schema,
): void
```

schema: Schema

###  isValid

[Source](schemas/SchemaValidator.ts#L50)

```javascript
isValid(
  instance: any,
  schema: Schema,
): boolean
```

instance: any,
  schema: Schema

###  validate

[Source](schemas/SchemaValidator.ts#L46)

```javascript
validate(
  instance: any,
  schema: Schema,
): ValidatorResult
```

instance: any,
  schema: Schema

#  util
##  Web3Utils

###  doesContractExistAtAddressAsync

[Source](util/Web3Utils.ts#L48)

```javascript
doesContractExistAtAddressAsync(
  address: string,
): Promise<boolean>
```

address: string

###  getAvailableAddressesAsync

[Source](util/Web3Utils.ts#L44)

```javascript
getAvailableAddressesAsync(): Promise<string[]>
```



###  getCurrentBlockTime

[Source](util/Web3Utils.ts#L75)

Returns the current blocktime in seconds.

```javascript
getCurrentBlockTime(): Promise<number>
```



###  getNetworkIdAsync

[Source](util/Web3Utils.ts#L40)

```javascript
getNetworkIdAsync(): Promise<number>
```



###  getTransactionReceiptAsync

[Source](util/Web3Utils.ts#L56)

```javascript
getTransactionReceiptAsync(
  txHash: string,
): Promise<TransactionReceipt>
```

txHash: string

###  increaseTime

[Source](util/Web3Utils.ts#L88)

Increases block time by the given number of seconds. Returns true
if the next block was mined successfully after increasing time.

```javascript
increaseTime(
  seconds: number,
): Promise<boolean>
```

seconds: number

###  mineBlock

[Source](util/Web3Utils.ts#L102)

Mines a single block.

```javascript
mineBlock(): Promise<JSONRPCResponsePayload>
```



###  revertToSnapshot

[Source](util/Web3Utils.ts#L65)

```javascript
revertToSnapshot(
  snapshotId: number,
): Promise<boolean>
```

snapshotId: number

###  saveTestSnapshot

[Source](util/Web3Utils.ts#L60)

```javascript
saveTestSnapshot(): Promise<number>
```



###  sendJsonRpcRequestAsync

[Source](util/Web3Utils.ts#L106)

```javascript
sendJsonRpcRequestAsync(
  method: string,
  params: any,
): Promise<JSONRPCResponsePayload>
```

method: string,
  params: any

###  soliditySHA3

[Source](util/Web3Utils.ts#L36)

```javascript
soliditySHA3(
  payload: any,
): string
```

payload: any

##  SignatureUtils

###  addPersonalMessagePrefix

[Source](util/signatureUtils.ts#L66)

Applies an Ethereum-specific prefix to the message payload we intend on signing,
as per the `eth_sign` specification in the JSON-RPC wiki:

https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign

This must *sometimes* be manually done by our libraries because certain signing
clients (e.g. Metamask) do not adhere to the `eth_sign` specification described
above.


```javascript
addPersonalMessagePrefix(
  messageHashHex: string,
): string
```

messageHashHex: string

###  convertToHexRSV

[Source](util/signatureUtils.ts#L99)

```javascript
convertToHexRSV(
  signature: ECSig,
): string
```

signature: ECSig

###  convertToHexVRS

[Source](util/signatureUtils.ts#L104)

```javascript
convertToHexVRS(
  signature: ECSig,
): string
```

signature: ECSig

###  isValidSignature

[Source](util/signatureUtils.ts#L24)

Given a data payload, signature, and a signer's address, returns true
if the given signature is valid.

```javascript
isValidSignature(
  data: string,
  signature: ECSig,
  signerAddress: string,
  addPersonalMessagePrefix: boolean,
): boolean
```

data: string,
  signature: ECSig,
  signerAddress: string,
  addPersonalMessagePrefix: boolean

###  parseSignatureHexAsRSV

[Source](util/signatureUtils.ts#L89)

```javascript
parseSignatureHexAsRSV(
  signatureHex: string,
): ECSig
```

signatureHex: string

###  parseSignatureHexAsVRS

[Source](util/signatureUtils.ts#L73)

```javascript
parseSignatureHexAsVRS(
  signatureHex: string,
): ECSig
```

signatureHex: string

#  wrappers
##  ContractWrapper

###  getCoreCacheKey

[Source](wrappers/ContractWrapper.ts#L158)

Creates a string used for accessing values in the core cache

```javascript
getCoreCacheKey(
  coreAddress: Address,
): string
```

coreAddress: Address

###  getERC20TokenCacheKey

[Source](wrappers/ContractWrapper.ts#L178)

Creates a string used for accessing values in the ERC20 token cache

```javascript
getERC20TokenCacheKey(
  tokenAddress: Address,
): string
```

tokenAddress: Address

###  getSetTokenCacheKey

[Source](wrappers/ContractWrapper.ts#L168)

Creates a string used for accessing values in the set token cache

```javascript
getSetTokenCacheKey(
  setTokenAddress: Address,
): string
```

setTokenAddress: Address

###  getVaultCacheKey

[Source](wrappers/ContractWrapper.ts#L188)

Creates a string used for accessing values in the vault cache

```javascript
getVaultCacheKey(
  vaultAddress: Address,
): string
```

vaultAddress: Address

###  loadCoreAsync

[Source](wrappers/ContractWrapper.ts#L56)

Load Core contract

```javascript
loadCoreAsync(
  coreAddress: Address,
  transactionOptions: object,
): Promise<CoreContract>
```

coreAddress: Address,
  transactionOptions: object

###  loadERC20TokenAsync

[Source](wrappers/ContractWrapper.ts#L108)

Load ERC20 Token contract

```javascript
loadERC20TokenAsync(
  tokenAddress: Address,
  transactionOptions: object,
): Promise<DetailedERC20Contract>
```

tokenAddress: Address,
  transactionOptions: object

###  loadSetTokenAsync

[Source](wrappers/ContractWrapper.ts#L80)

Load Set Token contract

```javascript
loadSetTokenAsync(
  setTokenAddress: Address,
  transactionOptions: object,
): Promise<SetTokenContract>
```

setTokenAddress: Address,
  transactionOptions: object

###  loadVaultAsync

[Source](wrappers/ContractWrapper.ts#L136)

Load Vault contract

```javascript
loadVaultAsync(
  vaultAddress: Address,
  transactionOptions: object,
): Promise<VaultContract>
```

vaultAddress: Address,
  transactionOptions: object

##  CoreWrapper

###  assertCancelIssuanceOrder

[Source](wrappers/CoreWrapper.ts#L810)

```javascript
assertCancelIssuanceOrder(
  issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber,
): Promise<void>
```

issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber

###  assertCreateSet

[Source](wrappers/CoreWrapper.ts#L612)

```javascript
assertCreateSet(
  userAddress: Address,
  factoryAddress: Address,
  components: Address,
  units: BigNumber,
  naturalUnit: BigNumber,
  name: string,
  symbol: string,
): Promise<void>
```

userAddress: Address,
  factoryAddress: Address,
  components: Address,
  units: BigNumber,
  naturalUnit: BigNumber,
  name: string,
  symbol: string

###  assertCreateSignedIssuanceOrder

[Source](wrappers/CoreWrapper.ts#L671)

```javascript
assertCreateSignedIssuanceOrder(
  setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address,
  requiredComponentAmounts: BigNumber,
  makerAddress: Address,
  makerToken: Address,
  makerTokenAmount: BigNumber,
  expiration: BigNumber,
  relayerAddress: Address,
  relayerToken: Address,
  makerRelayerFee: BigNumber,
  takerRelayerFee: BigNumber,
): Promise<void>
```

setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address,
  requiredComponentAmounts: BigNumber,
  makerAddress: Address,
  makerToken: Address,
  makerTokenAmount: BigNumber,
  expiration: BigNumber,
  relayerAddress: Address,
  relayerToken: Address,
  makerRelayerFee: BigNumber,
  takerRelayerFee: BigNumber

###  assertFillIssuanceOrder

[Source](wrappers/CoreWrapper.ts#L729)

```javascript
assertFillIssuanceOrder(
  userAddress: Address,
  signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orderData: Bytes,
): Promise<void>
```

userAddress: Address,
  signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orderData: Bytes

###  batchDeposit

[Source](wrappers/CoreWrapper.ts#L280)

Asynchronously batch deposits tokens to the vault

```javascript
batchDeposit(
  tokenAddresses: Address,
  quantitiesInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddresses: Address,
  quantitiesInWei: BigNumber,
  txOpts: TxData

###  batchWithdraw

[Source](wrappers/CoreWrapper.ts#L303)

Asynchronously batch withdraws tokens from the vault

```javascript
batchWithdraw(
  tokenAddresses: Address,
  quantitiesInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddresses: Address,
  quantitiesInWei: BigNumber,
  txOpts: TxData

###  cancelOrder

[Source](wrappers/CoreWrapper.ts#L457)

Cancels an Issuance Order

```javascript
cancelOrder(
  issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber,
  txOpts: TxData,
): Promise<string>
```

issuanceOrder: IssuanceOrder,
  quantityToCancel: BigNumber,
  txOpts: TxData

###  createOrder

[Source](wrappers/CoreWrapper.ts#L335)

Creates a new Issuance Order including the signature

```javascript
createOrder(
  setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address,
  requiredComponentAmounts: BigNumber,
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

setAddress: Address,
  quantity: BigNumber,
  requiredComponents: Address,
  requiredComponentAmounts: BigNumber,
  makerAddress: Address,
  makerToken: Address,
  makerTokenAmount: BigNumber,
  expiration: BigNumber,
  relayerAddress: Address,
  relayerToken: Address,
  makerRelayerFee: BigNumber,
  takerRelayerFee: BigNumber

###  createSet

[Source](wrappers/CoreWrapper.ts#L98)

Create a new Set, specifying the components, units, name, symbol to use.

```javascript
createSet(
  factoryAddress: Address,
  components: Address,
  units: BigNumber,
  naturalUnit: BigNumber,
  name: string,
  symbol: string,
  txOpts: TxData,
): Promise<string>
```

factoryAddress: Address,
  components: Address,
  units: BigNumber,
  naturalUnit: BigNumber,
  name: string,
  symbol: string,
  txOpts: TxData

###  deposit

[Source](wrappers/CoreWrapper.ts#L234)

Asynchronously deposits tokens to the vault

```javascript
deposit(
  tokenAddress: Address,
  quantity: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddress: Address,
  quantity: BigNumber,
  txOpts: TxData

###  fillOrder

[Source](wrappers/CoreWrapper.ts#L395)

Fills an Issuance Order

```javascript
fillOrder(
  signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orders: undefined,
  txOpts: TxData,
): Promise<string>
```

signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orders: undefined,
  txOpts: TxData

###  getExchangeAddress

[Source](wrappers/CoreWrapper.ts#L506)

Asynchronously gets the exchange address for a given exhange id

```javascript
getExchangeAddress(
  exchangeId: number,
): Promise<Address>
```

exchangeId: number

###  getFactories

[Source](wrappers/CoreWrapper.ts#L539)

Asynchronously gets factory addresses

```javascript
getFactories(): Promise<Address[]>
```



###  getOrderCancels

[Source](wrappers/CoreWrapper.ts#L603)

Asynchronously gets the quantity of the Issuance Order cancelled

```javascript
getOrderCancels(
  orderHash: Bytes,
): Promise<BigNumber>
```

orderHash: Bytes

###  getOrderFills

[Source](wrappers/CoreWrapper.ts#L590)

Asynchronously gets the quantity of the Issuance Order filled

```javascript
getOrderFills(
  orderHash: Bytes,
): Promise<BigNumber>
```

orderHash: Bytes

###  getSetAddressFromCreateTxHash

[Source](wrappers/CoreWrapper.ts#L141)

Asynchronously retrieves a Set Token address from a createSet txHash

```javascript
getSetAddressFromCreateTxHash(
  txHash: string,
): Promise<Address>
```

txHash: string

###  getSetAddresses

[Source](wrappers/CoreWrapper.ts#L551)

Fetch the addresses of SetTokens and RebalancingSetTokens created by the system
of contracts specified in SetProtcolConfig

```javascript
getSetAddresses(): Promise<Address[]>
```



###  getTransferProxyAddress

[Source](wrappers/CoreWrapper.ts#L517)

Asynchronously gets the transfer proxy address

```javascript
getTransferProxyAddress(): Promise<Address>
```



###  getVaultAddress

[Source](wrappers/CoreWrapper.ts#L528)

Asynchronously gets the vault address

```javascript
getVaultAddress(): Promise<Address>
```



###  isValidFactoryAsync

[Source](wrappers/CoreWrapper.ts#L563)

Verifies that the provided SetToken factory is enabled for creating a new SetToken

```javascript
isValidFactoryAsync(
  factoryAddress: Address,
): Promise<boolean>
```

factoryAddress: Address

###  isValidSetAsync

[Source](wrappers/CoreWrapper.ts#L577)

Verifies that the provided SetToken or RebalancingSetToken address is enabled
for issuance and redemption

```javascript
isValidSetAsync(
  setAddress: Address,
): Promise<boolean>
```

setAddress: Address

###  issue

[Source](wrappers/CoreWrapper.ts#L157)

Asynchronously issues a particular quantity of tokens from a particular Sets

```javascript
issue(
  setAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

setAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData

###  redeem

[Source](wrappers/CoreWrapper.ts#L180)

Asynchronously redeems a particular quantity of tokens from a particular Sets

```javascript
redeem(
  setAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

setAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData

###  redeemAndWithdraw

[Source](wrappers/CoreWrapper.ts#L209)

Redeem and withdraw with a single transaction

Normally, you should expect to be able to withdraw all of the tokens.
However, some have central abilities to freeze transfers (e.g. EOS). _toExclude
allows you to optionally specify which component tokens to remain under the user's
address in the vault. The rest will be transferred to the user.


```javascript
redeemAndWithdraw(
  setAddress: Address,
  quantityInWei: BigNumber,
  toExclude: BigNumber,
  txOpts: TxData,
): Promise<string>
```

setAddress: Address,
  quantityInWei: BigNumber,
  toExclude: BigNumber,
  txOpts: TxData

###  withdraw

[Source](wrappers/CoreWrapper.ts#L257)

Asynchronously withdraw tokens from the vault

```javascript
withdraw(
  tokenAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddress: Address,
  quantityInWei: BigNumber,
  txOpts: TxData

##  ERC20Wrapper

###  approveAsync

[Source](wrappers/ERC20Wrapper.ts#L221)

Asynchronously approves the value amount of the spender from the owner

```javascript
approveAsync(
  tokenAddress: Address,
  spenderAddress: Address,
  value: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddress: Address,
  spenderAddress: Address,
  value: BigNumber,
  txOpts: TxData

###  getAllowanceAsync

[Source](wrappers/ERC20Wrapper.ts#L117)

Gets the allowance of the spender by the owner account

```javascript
getAllowanceAsync(
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address,
): Promise<BigNumber>
```

tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address

###  getBalanceOfAsync

[Source](wrappers/ERC20Wrapper.ts#L53)

Gets balance of the ERC20 token

```javascript
getBalanceOfAsync(
  tokenAddress: Address,
  userAddress: Address,
): Promise<BigNumber>
```

tokenAddress: Address,
  userAddress: Address

###  getDecimalsAsync

[Source](wrappers/ERC20Wrapper.ts#L103)

Gets decimals of the ERC20 token

```javascript
getDecimalsAsync(
  tokenAddress: Address,
): Promise<BigNumber>
```

tokenAddress: Address

###  getNameAsync

[Source](wrappers/ERC20Wrapper.ts#L66)

Gets name of the ERC20 token

```javascript
getNameAsync(
  tokenAddress: Address,
): Promise<string>
```

tokenAddress: Address

###  getSymbolAsync

[Source](wrappers/ERC20Wrapper.ts#L78)

Gets balance of the ERC20 token

```javascript
getSymbolAsync(
  tokenAddress: Address,
): Promise<string>
```

tokenAddress: Address

###  getTotalSupplyAsync

[Source](wrappers/ERC20Wrapper.ts#L90)

Gets the total supply of the ERC20 token

```javascript
getTotalSupplyAsync(
  tokenAddress: Address,
): Promise<BigNumber>
```

tokenAddress: Address

###  transferAsync

[Source](wrappers/ERC20Wrapper.ts#L140)

Asynchronously transfer value denominated in the specified ERC20 token to
the address specified.

```javascript
transferAsync(
  tokenAddress: Address,
  to: Address,
  value: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddress: Address,
  to: Address,
  value: BigNumber,
  txOpts: TxData

###  transferFromAsync

[Source](wrappers/ERC20Wrapper.ts#L177)

Asynchronously transfer the value amount in the token specified so long
as the sender of the message has received sufficient allowance on behalf
of `from` to do so.

```javascript
transferFromAsync(
  tokenAddress: Address,
  from: Address,
  to: Address,
  value: BigNumber,
  txOpts: TxData,
): Promise<string>
```

tokenAddress: Address,
  from: Address,
  to: Address,
  value: BigNumber,
  txOpts: TxData

##  SetTokenWrapper

###  getComponentsAsync

[Source](wrappers/SetTokenWrapper.ts#L63)

Gets component tokens that make up the Set

```javascript
getComponentsAsync(
  setAddress: Address,
): Promise<Address[]>
```

setAddress: Address

###  getFactoryAsync

[Source](wrappers/SetTokenWrapper.ts#L52)

Gets the Set's origin factory

```javascript
getFactoryAsync(
  setAddress: Address,
): Promise<Address>
```

setAddress: Address

###  getNaturalUnitAsync

[Source](wrappers/SetTokenWrapper.ts#L74)

Gets natural unit of the Set

```javascript
getNaturalUnitAsync(
  setAddress: Address,
): Promise<BigNumber>
```

setAddress: Address

###  getUnitsAsync

[Source](wrappers/SetTokenWrapper.ts#L86)

Gets units of each component token that make up the Set

```javascript
getUnitsAsync(
  setAddress: Address,
): Promise<BigNumber[]>
```

setAddress: Address

###  isMultipleOfNaturalUnitAsync

[Source](wrappers/SetTokenWrapper.ts#L99)

Returns whether the quantity passed in is a multiple of a Set's natural unit

```javascript
isMultipleOfNaturalUnitAsync(
  setAddress: Address,
  quantity: BigNumber,
): Promise<boolean>
```

setAddress: Address,
  quantity: BigNumber

##  VaultWrapper

###  getBalanceInVault

[Source](wrappers/VaultWrapper.ts#L54)

Fetch the balance of the provided contract address inside the vault specified
in SetProtocolConfig

```javascript
getBalanceInVault(
  tokenAddress: Address,
  ownerAddress: Address,
): Promise<BigNumber>
```

tokenAddress: Address,
  ownerAddress: Address

