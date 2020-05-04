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
var jsonschema_1 = require("jsonschema");
var schemas_1 = require("./schemas");
var customFormats_1 = require("./customFormats");
/**
 * Borrowed, with slight modification, from the wonderful dharma codebase and 0x.js project codebase:
 * https://github.com/0xProject/0x.js/tree/development/packages/json-schemas
 */
var SchemaValidator = /** @class */ (function () {
    function SchemaValidator() {
        this._validator = new jsonschema_1.Validator();
        this.addCustomValidators();
        for (var _i = 0, _a = _.values(schemas_1.schemas); _i < _a.length; _i++) {
            var schema = _a[_i];
            this._validator.addSchema(schema, schema.id);
        }
    }
    SchemaValidator.prototype.addSchema = function (schema) {
        this._validator.addSchema(schema, schema.id);
    };
    SchemaValidator.prototype.validate = function (instance, schema) {
        return this._validator.validate(instance, schema);
    };
    SchemaValidator.prototype.isValid = function (instance, schema) {
        var isValid = this.validate(instance, schema).errors.length === 0;
        return isValid;
    };
    SchemaValidator.prototype.addCustomValidators = function () {
        this._validator.customFormats.BigNumber = customFormats_1.bigNumberFormat;
        this._validator.customFormats.wholeBigNumber = customFormats_1.wholeBigNumberFormat;
    };
    return SchemaValidator;
}());
exports.SchemaValidator = SchemaValidator;
//# sourceMappingURL=schemaValidator.js.map