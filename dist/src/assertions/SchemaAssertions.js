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
var errors_1 = require("../errors");
var schemas_1 = require("../schemas");
/*
 * A bunch of this has been borrowed from the awesome Dharma.js's repo
*/
var SchemaAssertions = /** @class */ (function () {
    function SchemaAssertions() {
        this.validator = new schemas_1.SchemaValidator();
    }
    SchemaAssertions.prototype.isValidAddress = function (variableName, value) {
        this.assertConformsToSchema(variableName, value, schemas_1.schemas.addressSchema);
    };
    SchemaAssertions.prototype.isValidBytes32 = function (variableName, value) {
        this.assertConformsToSchema(variableName, value, schemas_1.schemas.bytes32Schema);
    };
    SchemaAssertions.prototype.isValidBytes = function (variableName, value) {
        this.assertConformsToSchema(variableName, value, schemas_1.schemas.bytesSchema);
    };
    SchemaAssertions.prototype.isValidNumber = function (variableName, value) {
        this.assertConformsToSchema(variableName, value, schemas_1.schemas.numberSchema);
    };
    SchemaAssertions.prototype.IsValidWholeNumber = function (variableName, value) {
        this.assertConformsToSchema(variableName, value, schemas_1.schemas.wholeNumberSchema);
    };
    SchemaAssertions.prototype.assertConformsToSchema = function (variableName, value, schema) {
        var validationResult = this.validator.validate(value, schema);
        var hasValidationErrors = validationResult.errors.length > 0;
        if (hasValidationErrors) {
            throw new Error(errors_1.schemaAssertionsError.DOES_NOT_CONFORM_TO_SCHEMA(variableName, schema.id, value, validationResult));
        }
    };
    return SchemaAssertions;
}());
exports.SchemaAssertions = SchemaAssertions;
//# sourceMappingURL=SchemaAssertions.js.map