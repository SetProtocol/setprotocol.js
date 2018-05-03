import { Schema, Schemas, SchemaValidator, ValidatorResult } from "../schemas";

export const SchemaAssertionsError = {
  DOES_NOT_CONFORM_TO_SCHEMA: (
    variableName: string,
    schemaId: string,
    value: any,
    validationResult: ValidatorResult,
  ) => `
        Expected ${variableName} to conform to schema ${schemaId}

        Encountered: ${JSON.stringify(value, null, "\t")}

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
