/*
  Copyright 2018 Set Labs Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("./api");
var wrappers_1 = require("./wrappers");
var assertions_1 = require("./assertions");
var util_1 = require("./util");
var constants_1 = require("./constants");
/**
 * @title SetProtocol
 * @author Set Protocol
 *
 * The SetProtocol class that exposes all functionality for interacting with the SetProtocol smart contracts.
 * Methods that require interaction with the Ethereum blockchain are exposed after instantiating a new instance
 * of SetProtocol with the web3 provider argument
 */
var SetProtocol = /** @class */ (function () {
    /**
     * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library
     *
     * @param provider    Provider instance you would like the SetProtocol.js library to use for interacting with the
     *                      Ethereum network
     * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    function SetProtocol(provider, config) {
        this.web3 = util_1.instantiateWeb3(provider);
        this.core = new wrappers_1.CoreWrapper(this.web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
        var assertions = new assertions_1.Assertions(this.web3);
        this.vault = new wrappers_1.VaultWrapper(this.web3, config.vaultAddress);
        this.accounting = new api_1.AccountingAPI(this.core, assertions);
        this.blockchain = new api_1.BlockchainAPI(this.web3, assertions);
        this.erc20 = new api_1.ERC20API(this.web3, assertions, config);
        this.exchangeIssuance = new api_1.ExchangeIssuanceAPI(this.web3, assertions, config);
        this.factory = new api_1.FactoryAPI(this.web3, this.core, assertions, config);
        this.issuance = new api_1.IssuanceAPI(this.web3, this.core, assertions);
        this.oracle = new api_1.OracleAPI(this.web3);
        this.priceFeed = new api_1.PriceFeedAPI(this.web3);
        this.rebalancing = new api_1.RebalancingAPI(this.web3, assertions, this.core, config);
        this.rebalancingManager = new api_1.RebalancingManagerAPI(this.web3, assertions, config);
        this.rebalancingSetIssuance = new api_1.RebalancingSetIssuanceAPI(this.web3, assertions, config);
        this.setToken = new api_1.SetTokenAPI(this.web3, assertions);
        this.socialTrading = new api_1.SocialTradingAPI(this.web3, assertions, config);
        this.system = new api_1.SystemAPI(this.web3, this.core, config);
    }
    /**
     * Calculates the minimum allowable natural unit for a list of ERC20 token addresses
     * where the minimum natural unit allowed is equal to `10 ** (18 - minimumDecimal)`. `minimumDecimal`
     * is the smallest decimal amongst the tokens passed in
     *
     * @param components            List of ERC20 token addresses to use for Set creation
     * @return                      Minimum natural unit allowed for the component tokens
     */
    SetProtocol.prototype.calculateMinimumNaturalUnitAsync = function (components) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.factory.calculateMinimumNaturalUnitAsync(components)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Helper for `calculateSetUnits` when a list of decimals is not available and needs to be fetched. Calculates unit
     * and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, proportions of each, current
     * token prices, and target Set price
     *
     * Note: the target price may not be achievable with the lowest viable natural unit. Precision is achieved by
     * increasing the magnitude of natural unit up to `10 ** 18` and recalculating the component units. Defaults to
     * 10 percent
     *
     * @param components      List of ERC20 token addresses to use for Set creation
     * @param prices          List of current prices for the components in index order
     * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
     * @param percentError    Allowable price error percentage of resulting Set price from the target price input
     * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
     *                          valid natural unit. These properties can be passed directly into `createSetAsync`
     */
    SetProtocol.prototype.calculateSetUnitsAsync = function (components, prices, proportions, targetPrice, percentError) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.factory.calculateSetUnitsAsync(components, prices, proportions, targetPrice, percentError)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Calculates unit and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, their
     * decimals, proportions of each, current token prices, and target Set price
     *
     * @param components      List of ERC20 token addresses to use for Set creation
     * @param decimals        List of decimals for the components in index order
     * @param prices          List of current prices for the components in index order
     * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
     * @param percentError    Allowable price error percentage of resulting Set price from the target price input
     * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
     *                          valid natural unit. These properties can be passed directly into `createSetAsync`
     */
    SetProtocol.prototype.calculateSetUnits = function (components, decimals, prices, proportions, targetPrice, percentError) {
        return this.factory.calculateSetUnits(components, decimals, prices, proportions, targetPrice, percentError);
    };
    /**
     * Create a new Set by passing in parameters denoting component token addresses, quantities, natural
     * unit, and ERC20 properties
     *
     * Note: the return value is the transaction hash of the `createSetAsync` call, not the deployed SetToken
     * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
     *
     * @param  components     Component ERC20 token addresses
     * @param  units          Units of each component in Set paired in index order
     * @param  naturalUnit    Lowest common denominator for the Set
     * @param  name           Name for Set, i.e. "DEX Set"
     * @param  symbol         Symbol for Set, i.e. "DEX"
     * @param  txOpts         Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                Transaction hash
     */
    SetProtocol.prototype.createSetAsync = function (components, units, naturalUnit, name, symbol, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.factory.createSetAsync(components, units, naturalUnit, name, symbol, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Create a new Rebalancing token by passing in parameters denoting a Set to track, the manager, and various
     * rebalancing properties to facilitate rebalancing events
     *
     * Note: the return value is the transaction hash of the createRebalancingSetTokenAsync call, not the deployed Token
     * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the RebalancingSetToken address
     *
     * @param  manager              Address of account to propose, rebalance, and settle the Rebalancing token
     * @param  initialSet           Address of the Set the Rebalancing token is initially tracking
     * @param  initialUnitShares    Ratio between balance of this Rebalancing token and the currently tracked Set
     * @param  proposalPeriod       Duration after a manager proposes a new Set to rebalance into when users who wish to
     *                                pull out may redeem their balance of the RebalancingSetToken for balance of the Set
     *                                denominated in seconds
     * @param  rebalanceInterval    Duration after a rebalance is completed when the manager cannot initiate a new
     *                                Rebalance event
     * @param  name                 Name for RebalancingSet, i.e. "Top 10"
     * @param  symbol               Symbol for Set, i.e. "TOP10"
     * @param  txOpts               Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                      Transaction hash
     */
    SetProtocol.prototype.createRebalancingSetTokenAsync = function (manager, initialSet, initialUnitShares, proposalPeriod, rebalanceInterval, name, symbol, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.factory.createRebalancingSetTokenAsync(manager, initialSet, initialUnitShares, proposalPeriod, rebalanceInterval, name, symbol, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
     * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
     * Proxy contract via setTransferProxyAllowanceAsync
     *
     * @param  setAddress    Address Set to issue
     * @param  quantity      Amount of Set to issue. Must be multiple of the natural unit of the Set
     * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return               Transaction hash
     */
    SetProtocol.prototype.issueAsync = function (setAddress, quantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.issuance.issueAsync(setAddress, quantity, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Redeems a Set to the transaction signer, returning the component tokens to the signer's wallet. Use `false` for
     * `withdraw` to leave redeemed components in vault under the user's address to save gas if rebundling into another
     * Set with similar components
     *
     * @param  setAddress         Address of Set to issue
     * @param  quantity           Amount of Set to redeem. Must be multiple of the natural unit of the Set
     * @param  withdraw           Boolean to withdraw back to signer's wallet or leave in vault. Defaults to true
     * @param  tokensToExclude    Token addresses to exclude from withdrawal
     * @param  txOpts             Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                    Transaction hash
     */
    SetProtocol.prototype.redeemAsync = function (setAddress, quantity, withdraw, tokensToExclude, txOpts) {
        if (withdraw === void 0) { withdraw = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.issuance.redeemAsync(setAddress, quantity, withdraw, tokensToExclude, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Deposits tokens into the vault under the signer's address that can be used to issue a Set
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to deposit into the vault
     * @param  quantities        Amount of each token to deposit into the vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    SetProtocol.prototype.depositAsync = function (tokenAddresses, quantities, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accounting.depositAsync(tokenAddresses, quantities, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Withdraws tokens from the vault belonging to the signer
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to withdraw from the vault
     * @param  quantities        Amount of each token token to withdraw from vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    SetProtocol.prototype.withdrawAsync = function (tokenAddresses, quantities, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accounting.withdrawAsync(tokenAddresses, quantities, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sets the TransferProxy contract's allowance to a specified quantity on behalf of the signer. Allowance is
     * required for issuing, redeeming, and filling issuance orders
     *
     * @param   tokenAddress    Address of token contract to approve (typically SetToken or ERC20)
     * @param   quantity        Allowance quantity
     * @param   txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                  Transaction hash
     */
    SetProtocol.prototype.setTransferProxyAllowanceAsync = function (tokenAddress, quantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.erc20.approveAsync(tokenAddress, this.core.transferProxyAddress, quantity, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sets the TransferProxy contract's allowance to the maximum amount on behalf of the signer. Allowance is
     * required for issuing, redeeming, and filling issuance orders
     *
     * @param  tokenAddress    Address of contract to approve (typically SetToken or ERC20)
     * @param  txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                 Transaction hash
     */
    SetProtocol.prototype.setUnlimitedTransferProxyAllowanceAsync = function (tokenAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setTransferProxyAllowanceAsync(tokenAddress, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch the balance of the provided token contract address inside the Vault
     *
     * @param  tokenAddress    Address of the token contract (typically SetToken or ERC20)
     * @param  ownerAddress    Address of the token owner
     * @return                 Balance of the contract in the vault
     */
    SetProtocol.prototype.getBalanceInVaultAsync = function (tokenAddress, ownerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.vault.getBalanceInVault(tokenAddress, ownerAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch a Set Token address from a createSetAsync transaction hash
     *
     * @param  txHash    Transaction hash of the `createSetAsync` transaction
     * @return           Address of the newly created Set
     */
    SetProtocol.prototype.getSetAddressFromCreateTxHashAsync = function (txHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.factory.getSetAddressFromCreateTxHash(txHash)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch the addresses of all SetTokens and RebalancingSetTokens
     *
     * @return    Array of SetToken and RebalancingSetToken addresses
     */
    SetProtocol.prototype.getSetAddressesAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.setTokens()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Verifies that the provided factory address is enabled for creating new Sets
     *
     * @param  factoryAddress    Address of the factory contract
     * @return                   Whether the factory contract is enabled
     */
    SetProtocol.prototype.isValidFactoryAsync = function (factoryAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.validFactories(factoryAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Verifies that the provided SetToken or RebalancingSetToken address is enabled
     * for issuance and redemption
     *
     * @param  setAddress    Address of the SetToken or RebalancingSetToken contract
     * @return               Whether the contract is enabled for transacting
     */
    SetProtocol.prototype.isValidSetAsync = function (setAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.validSets(setAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Polls the Ethereum blockchain until the specified transaction has been mined or
     * the timeout limit is reached, whichever occurs first
     *
     * @param  txHash               Transaction hash to poll
     * @param  pollingIntervalMs    Interval at which the blockchain should be polled
     * @param  timeoutMs            Number of milliseconds until this process times out. If no value is provided, a
     *                                default value is used
     * @return                      Transaction receipt resulting from the mining process
     */
    SetProtocol.prototype.awaitTransactionMinedAsync = function (txHash, pollingIntervalMs, timeoutMs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.blockchain.awaitTransactionMinedAsync(txHash, pollingIntervalMs, timeoutMs)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * When creating an issuance order without a relayer token for a fee, you must use Solidity
     * address null type (as opposed to Javascript's `null`, `undefined` or empty string).
     */
    SetProtocol.NULL_ADDRESS = constants_1.NULL_ADDRESS;
    return SetProtocol;
}());
exports.default = SetProtocol;
//# sourceMappingURL=SetProtocol.js.map