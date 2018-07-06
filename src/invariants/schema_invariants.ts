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

"use strict";

import { Schema, Schemas, SchemaValidator, ValidatorResult } from "../schemas";

export const SchemaAssertionsError = {
  DOES_NOT_CONFORM_TO_SCHEMA: (
    variableName: string,
    schemaId: string,
    value: any,
    validationResult: ValidatorResult,
  ) => `
        Expected ${variableName} to conform to schema ${schemaId}

        Encountered: ${JSON.stringify(value, undefined, "\t")}

        Validation errors: ${validationResult.errors.join(", ")}
      `,
};

/*
 * A bunch of this has been borrowed from the awesome Dharma.js's repo
*/
export class SchemaAssertions {
  private validator: SchemaValidator;

  constructor() {
    this.validator = new SchemaValidator();
  }

  public isValidAddress(variableName: string, value: any) {
    this.assertConformsToSchema(variableName, value, Schemas.addressSchema);
  }

  public isValidBytes32(variableName: string, value: any) {
    this.assertConformsToSchema(variableName, value, Schemas.bytes32Schema);
  }

  public isValidBytes(variableName: string, value: any) {
    this.assertConformsToSchema(variableName, value, Schemas.bytesSchema);
  }

  public isValidNumber(variableName: string, value: any) {
    this.assertConformsToSchema(variableName, value, Schemas.numberSchema);
  }

  public IsValidWholeNumber(variableName: string, value: any) {
    this.assertConformsToSchema(variableName, value, Schemas.wholeNumberSchema);
  }

  private assertConformsToSchema(variableName: string, value: any, schema: Schema): void {
    const validationResult = this.validator.validate(value, schema);
    const hasValidationErrors = validationResult.errors.length > 0;

    if (hasValidationErrors) {
      throw new Error(
        SchemaAssertionsError.DOES_NOT_CONFORM_TO_SCHEMA(
          variableName,
          schema.id,
          value,
          validationResult,
        ),
      );
    }
  }
}
