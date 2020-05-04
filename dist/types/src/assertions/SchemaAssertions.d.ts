export declare class SchemaAssertions {
    private validator;
    constructor();
    isValidAddress(variableName: string, value: any): void;
    isValidBytes32(variableName: string, value: any): void;
    isValidBytes(variableName: string, value: any): void;
    isValidNumber(variableName: string, value: any): void;
    IsValidWholeNumber(variableName: string, value: any): void;
    private assertConformsToSchema;
}
