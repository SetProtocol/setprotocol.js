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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);
var ABIDecoder = __importStar(require("abi-decoder"));
var chai = __importStar(require("chai"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_utils_1 = require("set-protocol-utils");
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var api_1 = require("@src/api");
var wrappers_1 = require("@src/wrappers");
var util_1 = require("@src/util");
var accounts_1 = require("@src/constants/accounts");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
chaiSetup_1.default.configure();
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var expect = chai.expect;
var currentSnapshotId;
var SetTestUtils = setProtocolUtils.SetProtocolTestUtils;
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
describe('SystemAPI', function () {
    var systemAPI;
    var coreInstance;
    var setTokenFactoryInstance;
    var rebalanceAuctionModuleInstance;
    var rebalancingSetTokenFactoryInstance;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, core, transferProxy, vault, setTokenFactory, rebalancingSetTokenFactory, rebalanceAuctionModule, coreWrapper, setProtocolConfig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _b.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3], rebalancingSetTokenFactory = _a[4], rebalanceAuctionModule = _a[5];
                    coreInstance = core;
                    setTokenFactoryInstance = setTokenFactory;
                    rebalanceAuctionModuleInstance = rebalanceAuctionModule;
                    rebalancingSetTokenFactoryInstance = rebalancingSetTokenFactory;
                    coreWrapper = new wrappers_1.CoreWrapper(web3, core.address, transferProxy.address, vault.address);
                    setProtocolConfig = {
                        coreAddress: core.address,
                        transferProxyAddress: transferProxy.address,
                        vaultAddress: vault.address,
                        rebalanceAuctionModuleAddress: rebalanceAuctionModule.address,
                        kyberNetworkWrapperAddress: SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
                        setTokenFactoryAddress: setTokenFactory.address,
                        rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
                        exchangeIssuanceModuleAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetIssuanceModule: constants_1.NULL_ADDRESS,
                        rebalancingSetExchangeIssuanceModule: constants_1.NULL_ADDRESS,
                        wrappedEtherAddress: constants_1.NULL_ADDRESS,
                        protocolViewerAddress: constants_1.NULL_ADDRESS,
                    };
                    systemAPI = new api_1.SystemAPI(web3, coreWrapper, setProtocolConfig);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3Utils.revertToSnapshot(currentSnapshotId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getOperationStateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getOperationStateAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var expectedOperationState;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    expectedOperationState = constants_1.ZERO;
                    return [2 /*return*/];
                });
            }); });
            test('returns the correct operation state', function () { return __awaiter(_this, void 0, void 0, function () {
                var operationState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            operationState = _a.sent();
                            expect(operationState).to.bignumber.equal(expectedOperationState);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the operation state is shutdown', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedOperationState;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            expectedOperationState = new util_1.BigNumber(1);
                            coreInstance.setOperationState.sendTransactionAsync(expectedOperationState, { from: accounts_1.DEFAULT_ACCOUNT });
                            return [2 /*return*/];
                        });
                    }); });
                    test('returns the correct operation state', function () { return __awaiter(_this, void 0, void 0, function () {
                        var operationState;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    operationState = _a.sent();
                                    expect(operationState).to.bignumber.equal(expectedOperationState);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getSystemAuthorizableStateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getSystemAuthorizableStateAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var systemAuthorizableAddresses;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    systemAuthorizableAddresses = {
                        transferProxy: [coreInstance.address],
                        vault: [coreInstance.address, rebalanceAuctionModuleInstance.address],
                    };
                    return [2 /*return*/];
                });
            }); });
            test('returns the correct transferProxy authorized addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var transferProxy, expectedTransferProxyAuthorizable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            transferProxy = (_a.sent()).transferProxy;
                            expectedTransferProxyAuthorizable = JSON.stringify(systemAuthorizableAddresses.transferProxy);
                            expect(JSON.stringify(transferProxy)).to.equal(expectedTransferProxyAuthorizable);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('returns the correct vault authorized addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var vault, expectedVaultAuthorizable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            vault = (_a.sent()).vault;
                            expectedVaultAuthorizable = JSON.stringify(systemAuthorizableAddresses.vault);
                            expect(JSON.stringify(vault)).to.equal(expectedVaultAuthorizable);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getSystemTimeLockPeriodsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getSystemTimeLockPeriodsAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var alternativeTimeLockPeriod;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            alternativeTimeLockPeriod = new util_1.BigNumber(100);
                            return [4 /*yield*/, coreInstance.setTimeLockPeriod.sendTransactionAsync(alternativeTimeLockPeriod, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('returns the correct timeLockPeriods', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, core, vault, transferProxy;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a = _b.sent(), core = _a.core, vault = _a.vault, transferProxy = _a.transferProxy;
                            expect(core).to.bignumber.equal(alternativeTimeLockPeriod);
                            expect(vault).to.bignumber.equal(constants_1.ZERO);
                            expect(transferProxy).to.bignumber.equal(constants_1.ZERO);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getTimeLockUpgradeHashAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getTimeLockUpgradeHashAsync(subjectTransactionHash)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTransactionHash;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Set a positive timeLockUpgradePeriod
                            coreInstance.setTimeLockPeriod.sendTransactionAsync(new util_1.BigNumber(100), { from: accounts_1.DEFAULT_ACCOUNT });
                            return [4 /*yield*/, coreInstance.addFactory.sendTransactionAsync(SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 1:
                            subjectTransactionHash = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('returns the correct upgrade hash', function () { return __awaiter(_this, void 0, void 0, function () {
                var timeLockUpgradeHash, input, expectedTimeLockUpgradeHash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            timeLockUpgradeHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(subjectTransactionHash)];
                        case 2:
                            input = (_a.sent()).input;
                            expectedTimeLockUpgradeHash = web3.utils.soliditySha3(input);
                            expect(timeLockUpgradeHash).to.equal(expectedTimeLockUpgradeHash);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getTimeLockedUpgradeInitializationAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getTimeLockedUpgradeInitializationAsync(subjectContractAddress, subjectTimeLockUpgradeHash)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectContractAddress, subjectTimeLockUpgradeHash, txnTransactionHash;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var input;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Set a positive timeLockUpgradePeriod
                            coreInstance.setTimeLockPeriod.sendTransactionAsync(new util_1.BigNumber(100), { from: accounts_1.DEFAULT_ACCOUNT });
                            subjectContractAddress = coreInstance.address;
                            return [4 /*yield*/, coreInstance.addFactory.sendTransactionAsync(SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 1:
                            txnTransactionHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(txnTransactionHash)];
                        case 2:
                            input = (_a.sent()).input;
                            subjectTimeLockUpgradeHash = web3.utils.soliditySha3(input);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('returns the correct timestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var timeLockUpgradeTimestamp, blockNumber, timestamp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            timeLockUpgradeTimestamp = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransactionReceipt(txnTransactionHash)];
                        case 2:
                            blockNumber = (_a.sent()).blockNumber;
                            return [4 /*yield*/, web3.eth.getBlock(blockNumber)];
                        case 3:
                            timestamp = (_a.sent()).timestamp;
                            expect(timeLockUpgradeTimestamp).to.bignumber.equal(timestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getSystemOwnersAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getSystemOwnersAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var alternativeOwner;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            alternativeOwner = accounts_1.ACCOUNTS[2].address;
                            return [4 /*yield*/, coreInstance.transferOwnership.sendTransactionAsync(alternativeOwner, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('returns the correct owners', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, core, vault, transferProxy;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a = _b.sent(), core = _a.core, vault = _a.vault, transferProxy = _a.transferProxy;
                            expect(core).to.equal(alternativeOwner);
                            expect(vault).to.equal(accounts_1.DEFAULT_ACCOUNT);
                            expect(transferProxy).to.equal(accounts_1.DEFAULT_ACCOUNT);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getWhitelistedAddressesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getWhitelistedAddressesAsync(subjectWhitelistContract)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var whitelistInstance, initializedWhitelistAddresses, subjectWhitelistContract;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            initializedWhitelistAddresses = [accounts_1.DEFAULT_ACCOUNT];
                            return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, initializedWhitelistAddresses)];
                        case 1:
                            whitelistInstance = _a.sent();
                            subjectWhitelistContract = whitelistInstance.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct valid addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var whitelistAddresses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            whitelistAddresses = _a.sent();
                            // whitelistAddresses = whitelistAddresses.map(address => address.toLowerCase());
                            expect(JSON.stringify(whitelistAddresses)).to.equal(JSON.stringify(initializedWhitelistAddresses));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getWhitelistedValuesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getWhitelistedValuesAsync(subjectWhitelistContract, initialKeyAddresses)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var whitelistInstance, initialKeyAddresses, initialValueAddresses, subjectWhitelistContract;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            initialKeyAddresses = [accounts_1.ACCOUNTS[0].address, accounts_1.ACCOUNTS[1].address];
                            initialValueAddresses = [accounts_1.ACCOUNTS[2].address, accounts_1.ACCOUNTS[3].address];
                            return [4 /*yield*/, helpers_1.deployAddressToAddressWhiteListContract(web3, initialKeyAddresses, initialValueAddresses)];
                        case 1:
                            whitelistInstance = _a.sent();
                            subjectWhitelistContract = whitelistInstance.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct valid value type addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var valueTypeAddresses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            valueTypeAddresses = _a.sent();
                            expect(JSON.stringify(valueTypeAddresses)).to.equal(JSON.stringify(initialValueAddresses));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getModulesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getModulesAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var _this = this;
        return __generator(this, function (_a) {
            test('gets modules', function () { return __awaiter(_this, void 0, void 0, function () {
                var modules, expectedModules;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            modules = _a.sent();
                            expectedModules = [
                                rebalanceAuctionModuleInstance.address,
                            ];
                            expect(JSON.stringify(modules)).to.equal(JSON.stringify(expectedModules));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getFactoriesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getFactoriesAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var _this = this;
        return __generator(this, function (_a) {
            test('gets factories', function () { return __awaiter(_this, void 0, void 0, function () {
                var factories, expectedFactories;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            factories = _a.sent();
                            expectedFactories = [
                                setTokenFactoryInstance.address,
                                rebalancingSetTokenFactoryInstance.address,
                            ];
                            expect(JSON.stringify(factories)).to.equal(JSON.stringify(expectedFactories));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getExchangesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getExchangesAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.registerExchange(web3, coreInstance.address, 1, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets exchanges', function () { return __awaiter(_this, void 0, void 0, function () {
                var exchanges, expectedExchanges;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            exchanges = _a.sent();
                            expectedExchanges = [
                                accounts_1.DEFAULT_ACCOUNT,
                            ];
                            expect(JSON.stringify(exchanges)).to.equal(JSON.stringify(expectedExchanges));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getPriceLibrariesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, systemAPI.getPriceLibrariesAsync()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.addPriceLibraryAsync(coreInstance, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets price libraries', function () { return __awaiter(_this, void 0, void 0, function () {
                var priceLibraries, expectedPriceLibraries;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            priceLibraries = _a.sent();
                            expectedPriceLibraries = [
                                accounts_1.DEFAULT_ACCOUNT,
                            ];
                            expect(JSON.stringify(priceLibraries)).to.equal(JSON.stringify(expectedPriceLibraries));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=SystemAPI.spec.js.map