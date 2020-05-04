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
exports.schemaAssertionsError = {
    DOES_NOT_CONFORM_TO_SCHEMA: function (variableName, schemaId, value, validationResult) { return "\n        Expected " + variableName + " to conform to schema " + schemaId + ".\n\n        Encountered: " + JSON.stringify(value, undefined, '\t') + "\n\n        Validation errors: " + validationResult.errors.join(', ') + "\n      "; },
};
//# sourceMappingURL=schemaErrors.js.map