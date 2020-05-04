"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var web3_1 = __importDefault(require("web3"));
var util_1 = require("@src/util");
var constants_1 = require("@src/constants");
var ConversionRateABI_1 = require("../external/abis/ConversionRateABI");
var KyberNetworkABI_1 = require("../external/abis/KyberNetworkABI");
var KyberReserveABI_1 = require("../external/abis/KyberReserveABI");
var kyberSnapshotAddresses_1 = require("../external/kyberSnapshotAddresses");
var web3 = new web3_1.default('http://localhost:8545');
var KyberNetworkHelper = /** @class */ (function () {
    function KyberNetworkHelper() {
        this.kyberNetworkProxy = kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberNetworkProxy;
        this.kyberReserve = kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve;
        this.defaultSlippagePercentage = new bignumber_js_1.BigNumber(3);
    }
    /* ============ Kyber Network System Methods ============ */
    // Must be called ahead of any test
    KyberNetworkHelper.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var KyberNetworkContract, KyberReserveContract, ConversionRatesContract, setReserveAddressTxData, setContractsTxData, setExpectedRateTxData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        KyberNetworkContract = new web3.eth.Contract(KyberNetworkABI_1.KyberNetworkABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberNetwork);
                        KyberReserveContract = new web3.eth.Contract(KyberReserveABI_1.KyberReserveABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve);
                        ConversionRatesContract = new web3.eth.Contract(ConversionRateABI_1.ConversionRateABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates);
                        setReserveAddressTxData = ConversionRatesContract.methods.setReserveAddress(kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: setReserveAddressTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 1:
                        _a.sent();
                        setContractsTxData = KyberReserveContract.methods.setContracts(kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberNetwork, kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates, '0x0000000000000000000000000000000000000000').encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve,
                                data: setContractsTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, KyberNetworkContract.methods.setExpectedRate(kyberSnapshotAddresses_1.KYBER_CONTRACTS.ExpectedRate).encodeABI()];
                    case 3:
                        setExpectedRateTxData = _a.sent();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberNetwork,
                                data: setExpectedRateTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    KyberNetworkHelper.prototype.fundReserveWithEth = function (_from, _quantity) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, web3.eth.sendTransaction({
                            to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve,
                            from: _from,
                            value: _quantity.toString(),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *  In this function, we are enabling an ERC20 token onto a normal Kyber Reserve (not automated or orderbook).
     *  We do three things:
     *  1. List the asset on a specific reserve by calling the KyberNetwork's listPairforReserveContract
     *     This can only be called by the operator of that reserve. Our standard reserve is operated by address 1
     *  2. Add the token to the ConversionRatesContract.
     *     This can only be called by the admin of the Kyber Network system. Our admin is account 0
     *  3. Set the Token Control Info
     *  4. Enable token for trading on Kyber
     *  See more about how to add tokens onto a kyber reserve here.
     *  https://developer.kyber.network/docs/FedPriceReservesGuide/#adding-tokens
     */
    KyberNetworkHelper.prototype.enableTokensForReserve = function (_tokenAddress, _minimalRecordResolution, _maxPerBlockImbalance, _maxTotalImbalance) {
        if (_minimalRecordResolution === void 0) { _minimalRecordResolution = new bignumber_js_1.BigNumber(1000000000000000); }
        if (_maxPerBlockImbalance === void 0) { _maxPerBlockImbalance = constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS; }
        if (_maxTotalImbalance === void 0) { _maxTotalImbalance = constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS; }
        return __awaiter(this, void 0, void 0, function () {
            var ConversionRatesContract, KyberNetworkContract, KyberReserveContract, listPairForReserveTxData, addTokenTxData, setTokenControlInfoTxData, enableTokenTradeTxData, validBaseRateTxData, setTokenWalletTxData, approveWithdrawAddressTxData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ConversionRatesContract = new web3.eth.Contract(ConversionRateABI_1.ConversionRateABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates);
                        KyberNetworkContract = new web3.eth.Contract(KyberNetworkABI_1.KyberNetworkABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberNetwork);
                        KyberReserveContract = new web3.eth.Contract(KyberReserveABI_1.KyberReserveABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve);
                        listPairForReserveTxData = KyberNetworkContract.methods.listPairForReserve(kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve, _tokenAddress, true, true, true).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.operator,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberNetwork,
                                data: listPairForReserveTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 1:
                        _a.sent();
                        addTokenTxData = ConversionRatesContract.methods.addToken(_tokenAddress).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: addTokenTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 2:
                        _a.sent();
                        setTokenControlInfoTxData = ConversionRatesContract.methods.setTokenControlInfo(_tokenAddress, _minimalRecordResolution.toString(), _maxPerBlockImbalance.toString(), _maxTotalImbalance.toString()).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: setTokenControlInfoTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 3:
                        _a.sent();
                        enableTokenTradeTxData = ConversionRatesContract.methods.enableTokenTrade(_tokenAddress).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: enableTokenTradeTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 4:
                        _a.sent();
                        validBaseRateTxData = ConversionRatesContract.methods.setValidRateDurationInBlocks(1000000000).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: validBaseRateTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 5:
                        _a.sent();
                        setTokenWalletTxData = KyberReserveContract.methods.setTokenWallet(_tokenAddress, kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.operator).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve,
                                data: setTokenWalletTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 6:
                        _a.sent();
                        approveWithdrawAddressTxData = KyberReserveContract.methods.approveWithdrawAddress(_tokenAddress, kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.operator, true).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.admin,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve,
                                data: approveWithdrawAddressTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Pass in the arguments for a Kyber Trade and it will automatically
    // set rates for the reserve that map to the source and destination token quantities.
    KyberNetworkHelper.prototype.setConversionRates = function (_sourceToken, _destinationToken, _sourceTokenQuantity, _destinationTokenQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceTokenRate, destinationTokenRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.enableTokensForReserve(_sourceToken)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.enableTokensForReserve(_destinationToken)];
                    case 2:
                        _a.sent();
                        sourceTokenRate = util_1.ether(1).div(_sourceTokenQuantity.div(util_1.ether(1)));
                        destinationTokenRate = util_1.ether(1).mul(_destinationTokenQuantity.div(util_1.ether(1)));
                        return [4 /*yield*/, this.setUpConversionRatesRaw([_sourceToken, _destinationToken], [sourceTokenRate, destinationTokenRate], [sourceTokenRate, destinationTokenRate])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    KyberNetworkHelper.prototype.setUpConversionRatesRaw = function (_tokenAddresses, _baseBuy, _baseSell) {
        return __awaiter(this, void 0, void 0, function () {
            var ConversionRatesContract, baseBuys, baseSells, bytes14Buy, bytes14Sell, indices, blockNumber, i, stepData, setQtyStepFunctionTxData, setImbalanceStepFunctionTxData, setBaseRateTxData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ConversionRatesContract = new web3.eth.Contract(ConversionRateABI_1.ConversionRateABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates);
                        baseBuys = _baseBuy.map(function (quantity) { return quantity.toString(); });
                        baseSells = _baseSell.map(function (quantity) { return quantity.toString(); });
                        bytes14Buy = ['0x0000'];
                        bytes14Sell = ['0x0000'];
                        indices = [0];
                        return [4 /*yield*/, web3.eth.getBlockNumber()];
                    case 1:
                        blockNumber = _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < _tokenAddresses.length)) return [3 /*break*/, 6];
                        stepData = [0];
                        setQtyStepFunctionTxData = ConversionRatesContract.methods.setQtyStepFunction(_tokenAddresses[i], stepData, stepData, stepData, stepData).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.operator,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: setQtyStepFunctionTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 3:
                        _a.sent();
                        setImbalanceStepFunctionTxData = ConversionRatesContract.methods.setImbalanceStepFunction(_tokenAddresses[i], stepData, stepData, stepData, stepData).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.operator,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: setImbalanceStepFunctionTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6:
                        setBaseRateTxData = ConversionRatesContract.methods.setBaseRate(_tokenAddresses, baseBuys, baseSells, bytes14Buy, bytes14Sell, blockNumber, indices).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: kyberSnapshotAddresses_1.KYBER_PERMISSIONED_ACCOUNTS.operator,
                                to: kyberSnapshotAddresses_1.KYBER_CONTRACTS.ConversionRates,
                                data: setBaseRateTxData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    KyberNetworkHelper.prototype.approveToReserve = function (_token, _quantity, _from) {
        return __awaiter(this, void 0, void 0, function () {
            var reserveContractAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reserveContractAddress = kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberReserve;
                        return [4 /*yield*/, _token.approve.sendTransactionAsync(reserveContractAddress, _quantity, { from: _from, gas: 100000 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    KyberNetworkHelper.prototype.getKyberRate = function (_sourceToken, _destinationToken, _sourceQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var KyberNetworkContract, expectedRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        KyberNetworkContract = new web3.eth.Contract(KyberNetworkABI_1.KyberNetworkABI, kyberSnapshotAddresses_1.KYBER_CONTRACTS.KyberNetwork);
                        return [4 /*yield*/, KyberNetworkContract.methods.getExpectedRate(_sourceToken, _destinationToken, _sourceQuantity.toString()).call()];
                    case 1:
                        expectedRate = (_a.sent())[0];
                        return [2 /*return*/, expectedRate];
                }
            });
        });
    };
    return KyberNetworkHelper;
}());
exports.KyberNetworkHelper = KyberNetworkHelper;
//# sourceMappingURL=kyberNetworkHelper.js.map