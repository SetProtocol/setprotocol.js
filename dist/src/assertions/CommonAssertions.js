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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
var util_1 = require("../util");
var constants_1 = require("../constants");
var CommonAssertions = /** @class */ (function () {
    function CommonAssertions() {
    }
    CommonAssertions.prototype.greaterThanZero = function (quantity, errorMessage) {
        if (quantity.lte(constants_1.ZERO)) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.includes = function (arr1, val, errorMessage) {
        if (!arr1.includes(val)) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isEqualLength = function (arr1, arr2, errorMessage) {
        if (arr1.length !== arr2.length) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isGreaterThan = function (quantity1, quantity2, errorMessage) {
        if (quantity1.lte(quantity2)) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isGreaterOrEqualThan = function (quantity1, quantity2, errorMessage) {
        if (quantity1.lt(quantity2)) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isLessOrEqualThan = function (quantity1, quantity2, errorMessage) {
        if (quantity1.gt(quantity2)) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isMultipleOf = function (quantity, baseQuantity, errorMessage) {
        if (!quantity.modulo(baseQuantity).isZero()) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isValidString = function (value, errorMessage) {
        if (!value) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isNotUndefined = function (value, errorMessage) {
        if (!value) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isNotEmptyArray = function (array, errorMessage) {
        if (array.length == 0) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isValidExpiration = function (expiration, errorMessage) {
        if (Date.now() > expiration.times(1000).toNumber()) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isValidLength = function (arr, len, errorMessage) {
        if (arr.length !== len) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isEqualBigNumber = function (bigNumber1, bigNumber2, errorMessage) {
        if (!bigNumber1.eq(bigNumber2)) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isEqualAddress = function (address1, address2, errorMessage) {
        if (address1.toLowerCase() !== address2.toLowerCase()) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.isDifferentAddress = function (address1, address2, errorMessage) {
        if (address1.toLowerCase() == address2.toLowerCase()) {
            throw new Error(errorMessage);
        }
    };
    CommonAssertions.prototype.verifyProportionsSumToOne = function (percentages, errorMesage) {
        var total = constants_1.ZERO;
        _.each(percentages, function (percentage) {
            total = total.add(percentage);
        });
        if (!total.eq(new util_1.BigNumber(1))) {
            throw new Error(errorMesage);
        }
    };
    return CommonAssertions;
}());
exports.CommonAssertions = CommonAssertions;
//# sourceMappingURL=CommonAssertions.js.map