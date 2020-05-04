import { ValidatorResult } from '../schemas';
export declare const schemaAssertionsError: {
    DOES_NOT_CONFORM_TO_SCHEMA: (variableName: string, schemaId: string, value: any, validationResult: ValidatorResult) => string;
};
