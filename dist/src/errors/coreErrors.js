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
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreAPIErrors = {
    ARRAYS_EQUAL_LENGTHS: function (firstArray, secondArray) {
        return "The " + firstArray + " and " + secondArray + " arrays need to be equal lengths.";
    },
    EMPTY_ARRAY: function (variable) { return "The array " + variable + " cannot be empty."; },
    EXPIRATION_PASSED: function () { return 'Expiration date has already passed.'; },
    INVALID_NATURAL_UNIT: function (minNaturalUnit) {
        return "Natural unit must be larger than minimum unit, " + minNaturalUnit.toString() + ", allowed by components.";
    },
    PROPORTIONS_DONT_ADD_UP_TO_1: function () { return "The component percentages inputted do not add up to 1"; },
    QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT: function (quantityType) {
        return quantityType + " needs to be multiple of natural unit.";
    },
    QUANTITY_NEEDS_TO_BE_POSITIVE: function (quantity) {
        return "The quantity " + quantity.toString() + " inputted needs to be greater than zero.";
    },
    SIGNATURE_MISMATCH: function () { return 'Signature does not match issuance order attributes.'; },
    STRING_CANNOT_BE_EMPTY: function (variable) { return "The string " + variable + " cannot be empty."; },
};
exports.coreAssertionErrors = {
    MISSING_CORE_METHOD: function (address) {
        return "Contract at " + address + " does not implement Core interface.";
    },
};
//# sourceMappingURL=coreErrors.js.map