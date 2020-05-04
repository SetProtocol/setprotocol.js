export declare const Rebalance: {
    "contractName": string;
    "abi": any[];
    "metadata": string;
    "bytecode": string;
    "deployedBytecode": string;
    "sourceMap": string;
    "deployedSourceMap": string;
    "source": string;
    "sourcePath": string;
    "ast": {
        "absolutePath": string;
        "exportedSymbols": {
            "Rebalance": number[];
        };
        "id": number;
        "nodeType": string;
        "nodes": ({
            "id": number;
            "literals": string[];
            "nodeType": string;
            "src": string;
            "absolutePath"?: undefined;
            "file"?: undefined;
            "scope"?: undefined;
            "sourceUnit"?: undefined;
            "symbolAliases"?: undefined;
            "unitAlias"?: undefined;
            "baseContracts"?: undefined;
            "contractDependencies"?: undefined;
            "contractKind"?: undefined;
            "documentation"?: undefined;
            "fullyImplemented"?: undefined;
            "linearizedBaseContracts"?: undefined;
            "name"?: undefined;
            "nodes"?: undefined;
        } | {
            "absolutePath": string;
            "file": string;
            "id": number;
            "nodeType": string;
            "scope": number;
            "sourceUnit": number;
            "src": string;
            "symbolAliases": {
                "foreign": number;
                "local": any;
            }[];
            "unitAlias": string;
            "literals"?: undefined;
            "baseContracts"?: undefined;
            "contractDependencies"?: undefined;
            "contractKind"?: undefined;
            "documentation"?: undefined;
            "fullyImplemented"?: undefined;
            "linearizedBaseContracts"?: undefined;
            "name"?: undefined;
            "nodes"?: undefined;
        } | {
            "baseContracts": any[];
            "contractDependencies": any[];
            "contractKind": string;
            "documentation": string;
            "fullyImplemented": boolean;
            "id": number;
            "linearizedBaseContracts": number[];
            "name": string;
            "nodeType": string;
            "nodes": ({
                "canonicalName": string;
                "id": number;
                "members": ({
                    "constant": boolean;
                    "id": number;
                    "name": string;
                    "nodeType": string;
                    "scope": number;
                    "src": string;
                    "stateVariable": boolean;
                    "storageLocation": string;
                    "typeDescriptions": {
                        "typeIdentifier": string;
                        "typeString": string;
                    };
                    "typeName": {
                        "baseType": {
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "src": string;
                            "stateMutability": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "id": number;
                        "length": any;
                        "nodeType": string;
                        "src": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                    };
                    "value": any;
                    "visibility": string;
                } | {
                    "constant": boolean;
                    "id": number;
                    "name": string;
                    "nodeType": string;
                    "scope": number;
                    "src": string;
                    "stateVariable": boolean;
                    "storageLocation": string;
                    "typeDescriptions": {
                        "typeIdentifier": string;
                        "typeString": string;
                    };
                    "typeName": {
                        "baseType": {
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                            "stateMutability"?: undefined;
                        };
                        "id": number;
                        "length": any;
                        "nodeType": string;
                        "src": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                    };
                    "value": any;
                    "visibility": string;
                })[];
                "name": string;
                "nodeType": string;
                "scope": number;
                "src": string;
                "visibility": string;
                "body"?: undefined;
                "documentation"?: undefined;
                "implemented"?: undefined;
                "kind"?: undefined;
                "modifiers"?: undefined;
                "parameters"?: undefined;
                "returnParameters"?: undefined;
                "stateMutability"?: undefined;
                "superFunction"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": {
                        "expression": {
                            "argumentTypes": any;
                            "arguments": {
                                "argumentTypes": any;
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "expression": {
                                "argumentTypes": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                }[];
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "isConstant": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "kind": string;
                            "lValueRequested": boolean;
                            "names": string[];
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                    }[];
                };
                "documentation": any;
                "id": number;
                "implemented": boolean;
                "kind": string;
                "modifiers": any[];
                "name": string;
                "nodeType": string;
                "parameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "stateMutability": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                                "stateMutability"?: undefined;
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "contractScope": any;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "referencedDeclaration": number;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    }[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "canonicalName"?: undefined;
                "members"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": {
                        "expression": {
                            "argumentTypes": any;
                            "components": {
                                "argumentTypes": any;
                                "expression": {
                                    "argumentTypes": any;
                                    "id": number;
                                    "name": string;
                                    "nodeType": string;
                                    "overloadedDeclarations": any[];
                                    "referencedDeclaration": number;
                                    "src": string;
                                    "typeDescriptions": {
                                        "typeIdentifier": string;
                                        "typeString": string;
                                    };
                                };
                                "id": number;
                                "isConstant": boolean;
                                "isLValue": boolean;
                                "isPure": boolean;
                                "lValueRequested": boolean;
                                "memberName": string;
                                "nodeType": string;
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "id": number;
                            "isConstant": boolean;
                            "isInlineArray": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "lValueRequested": boolean;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                    }[];
                };
                "documentation": any;
                "id": number;
                "implemented": boolean;
                "kind": string;
                "modifiers": any[];
                "name": string;
                "nodeType": string;
                "parameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "contractScope": any;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "referencedDeclaration": number;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    }[];
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "stateMutability": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                                "stateMutability"?: undefined;
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "canonicalName"?: undefined;
                "members"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": ({
                        "assignments": number[];
                        "declarations": {
                            "constant": boolean;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "scope": number;
                            "src": string;
                            "stateVariable": boolean;
                            "storageLocation": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                            "typeName": {
                                "baseType": {
                                    "id": number;
                                    "name": string;
                                    "nodeType": string;
                                    "src": string;
                                    "typeDescriptions": {
                                        "typeIdentifier": string;
                                        "typeString": string;
                                    };
                                };
                                "id": number;
                                "length": any;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "value": any;
                            "visibility": string;
                        }[];
                        "id": number;
                        "initialValue": {
                            "argumentTypes": any;
                            "arguments": {
                                "argumentTypes": any;
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "expression": {
                                "argumentTypes": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                }[];
                                "expression": {
                                    "argumentTypes": any;
                                    "id": number;
                                    "name": string;
                                    "nodeType": string;
                                    "overloadedDeclarations": any[];
                                    "referencedDeclaration": number;
                                    "src": string;
                                    "typeDescriptions": {
                                        "typeIdentifier": string;
                                        "typeString": string;
                                    };
                                };
                                "id": number;
                                "isConstant": boolean;
                                "isLValue": boolean;
                                "isPure": boolean;
                                "lValueRequested": boolean;
                                "memberName": string;
                                "nodeType": string;
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "isConstant": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "kind": string;
                            "lValueRequested": boolean;
                            "names": any[];
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "nodeType": string;
                        "src": string;
                        "expression"?: undefined;
                        "functionReturnParameters"?: undefined;
                    } | {
                        "expression": {
                            "argumentTypes": any;
                            "components": {
                                "argumentTypes": any;
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "id": number;
                            "isConstant": boolean;
                            "isInlineArray": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "lValueRequested": boolean;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                        "assignments"?: undefined;
                        "declarations"?: undefined;
                        "initialValue"?: undefined;
                    })[];
                };
                "documentation": string;
                "id": number;
                "implemented": boolean;
                "kind": string;
                "modifiers": any[];
                "name": string;
                "nodeType": string;
                "parameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "contractScope": any;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "referencedDeclaration": number;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                            "contractScope"?: undefined;
                            "referencedDeclaration"?: undefined;
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "stateMutability": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                                "stateMutability"?: undefined;
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "canonicalName"?: undefined;
                "members"?: undefined;
            })[];
            "scope": number;
            "src": string;
            "literals"?: undefined;
            "absolutePath"?: undefined;
            "file"?: undefined;
            "sourceUnit"?: undefined;
            "symbolAliases"?: undefined;
            "unitAlias"?: undefined;
        })[];
        "src": string;
    };
    "legacyAST": {
        "absolutePath": string;
        "exportedSymbols": {
            "Rebalance": number[];
        };
        "id": number;
        "nodeType": string;
        "nodes": ({
            "id": number;
            "literals": string[];
            "nodeType": string;
            "src": string;
            "absolutePath"?: undefined;
            "file"?: undefined;
            "scope"?: undefined;
            "sourceUnit"?: undefined;
            "symbolAliases"?: undefined;
            "unitAlias"?: undefined;
            "baseContracts"?: undefined;
            "contractDependencies"?: undefined;
            "contractKind"?: undefined;
            "documentation"?: undefined;
            "fullyImplemented"?: undefined;
            "linearizedBaseContracts"?: undefined;
            "name"?: undefined;
            "nodes"?: undefined;
        } | {
            "absolutePath": string;
            "file": string;
            "id": number;
            "nodeType": string;
            "scope": number;
            "sourceUnit": number;
            "src": string;
            "symbolAliases": {
                "foreign": number;
                "local": any;
            }[];
            "unitAlias": string;
            "literals"?: undefined;
            "baseContracts"?: undefined;
            "contractDependencies"?: undefined;
            "contractKind"?: undefined;
            "documentation"?: undefined;
            "fullyImplemented"?: undefined;
            "linearizedBaseContracts"?: undefined;
            "name"?: undefined;
            "nodes"?: undefined;
        } | {
            "baseContracts": any[];
            "contractDependencies": any[];
            "contractKind": string;
            "documentation": string;
            "fullyImplemented": boolean;
            "id": number;
            "linearizedBaseContracts": number[];
            "name": string;
            "nodeType": string;
            "nodes": ({
                "canonicalName": string;
                "id": number;
                "members": ({
                    "constant": boolean;
                    "id": number;
                    "name": string;
                    "nodeType": string;
                    "scope": number;
                    "src": string;
                    "stateVariable": boolean;
                    "storageLocation": string;
                    "typeDescriptions": {
                        "typeIdentifier": string;
                        "typeString": string;
                    };
                    "typeName": {
                        "baseType": {
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "src": string;
                            "stateMutability": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "id": number;
                        "length": any;
                        "nodeType": string;
                        "src": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                    };
                    "value": any;
                    "visibility": string;
                } | {
                    "constant": boolean;
                    "id": number;
                    "name": string;
                    "nodeType": string;
                    "scope": number;
                    "src": string;
                    "stateVariable": boolean;
                    "storageLocation": string;
                    "typeDescriptions": {
                        "typeIdentifier": string;
                        "typeString": string;
                    };
                    "typeName": {
                        "baseType": {
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                            "stateMutability"?: undefined;
                        };
                        "id": number;
                        "length": any;
                        "nodeType": string;
                        "src": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                    };
                    "value": any;
                    "visibility": string;
                })[];
                "name": string;
                "nodeType": string;
                "scope": number;
                "src": string;
                "visibility": string;
                "body"?: undefined;
                "documentation"?: undefined;
                "implemented"?: undefined;
                "kind"?: undefined;
                "modifiers"?: undefined;
                "parameters"?: undefined;
                "returnParameters"?: undefined;
                "stateMutability"?: undefined;
                "superFunction"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": {
                        "expression": {
                            "argumentTypes": any;
                            "arguments": {
                                "argumentTypes": any;
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "expression": {
                                "argumentTypes": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                }[];
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "isConstant": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "kind": string;
                            "lValueRequested": boolean;
                            "names": string[];
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                    }[];
                };
                "documentation": any;
                "id": number;
                "implemented": boolean;
                "kind": string;
                "modifiers": any[];
                "name": string;
                "nodeType": string;
                "parameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "stateMutability": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                                "stateMutability"?: undefined;
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "contractScope": any;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "referencedDeclaration": number;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    }[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "canonicalName"?: undefined;
                "members"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": {
                        "expression": {
                            "argumentTypes": any;
                            "components": {
                                "argumentTypes": any;
                                "expression": {
                                    "argumentTypes": any;
                                    "id": number;
                                    "name": string;
                                    "nodeType": string;
                                    "overloadedDeclarations": any[];
                                    "referencedDeclaration": number;
                                    "src": string;
                                    "typeDescriptions": {
                                        "typeIdentifier": string;
                                        "typeString": string;
                                    };
                                };
                                "id": number;
                                "isConstant": boolean;
                                "isLValue": boolean;
                                "isPure": boolean;
                                "lValueRequested": boolean;
                                "memberName": string;
                                "nodeType": string;
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "id": number;
                            "isConstant": boolean;
                            "isInlineArray": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "lValueRequested": boolean;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                    }[];
                };
                "documentation": any;
                "id": number;
                "implemented": boolean;
                "kind": string;
                "modifiers": any[];
                "name": string;
                "nodeType": string;
                "parameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "contractScope": any;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "referencedDeclaration": number;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    }[];
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "stateMutability": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                                "stateMutability"?: undefined;
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "canonicalName"?: undefined;
                "members"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": ({
                        "assignments": number[];
                        "declarations": {
                            "constant": boolean;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "scope": number;
                            "src": string;
                            "stateVariable": boolean;
                            "storageLocation": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                            "typeName": {
                                "baseType": {
                                    "id": number;
                                    "name": string;
                                    "nodeType": string;
                                    "src": string;
                                    "typeDescriptions": {
                                        "typeIdentifier": string;
                                        "typeString": string;
                                    };
                                };
                                "id": number;
                                "length": any;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "value": any;
                            "visibility": string;
                        }[];
                        "id": number;
                        "initialValue": {
                            "argumentTypes": any;
                            "arguments": {
                                "argumentTypes": any;
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "expression": {
                                "argumentTypes": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                }[];
                                "expression": {
                                    "argumentTypes": any;
                                    "id": number;
                                    "name": string;
                                    "nodeType": string;
                                    "overloadedDeclarations": any[];
                                    "referencedDeclaration": number;
                                    "src": string;
                                    "typeDescriptions": {
                                        "typeIdentifier": string;
                                        "typeString": string;
                                    };
                                };
                                "id": number;
                                "isConstant": boolean;
                                "isLValue": boolean;
                                "isPure": boolean;
                                "lValueRequested": boolean;
                                "memberName": string;
                                "nodeType": string;
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "isConstant": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "kind": string;
                            "lValueRequested": boolean;
                            "names": any[];
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "nodeType": string;
                        "src": string;
                        "expression"?: undefined;
                        "functionReturnParameters"?: undefined;
                    } | {
                        "expression": {
                            "argumentTypes": any;
                            "components": {
                                "argumentTypes": any;
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "overloadedDeclarations": any[];
                                "referencedDeclaration": number;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            }[];
                            "id": number;
                            "isConstant": boolean;
                            "isInlineArray": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "lValueRequested": boolean;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                        "assignments"?: undefined;
                        "declarations"?: undefined;
                        "initialValue"?: undefined;
                    })[];
                };
                "documentation": string;
                "id": number;
                "implemented": boolean;
                "kind": string;
                "modifiers": any[];
                "name": string;
                "nodeType": string;
                "parameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "contractScope": any;
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "referencedDeclaration": number;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "id": number;
                            "name": string;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                            "contractScope"?: undefined;
                            "referencedDeclaration"?: undefined;
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": ({
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "stateMutability": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    } | {
                        "constant": boolean;
                        "id": number;
                        "name": string;
                        "nodeType": string;
                        "scope": number;
                        "src": string;
                        "stateVariable": boolean;
                        "storageLocation": string;
                        "typeDescriptions": {
                            "typeIdentifier": string;
                            "typeString": string;
                        };
                        "typeName": {
                            "baseType": {
                                "id": number;
                                "name": string;
                                "nodeType": string;
                                "src": string;
                                "typeDescriptions": {
                                    "typeIdentifier": string;
                                    "typeString": string;
                                };
                                "stateMutability"?: undefined;
                            };
                            "id": number;
                            "length": any;
                            "nodeType": string;
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
                        "value": any;
                        "visibility": string;
                    })[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "canonicalName"?: undefined;
                "members"?: undefined;
            })[];
            "scope": number;
            "src": string;
            "literals"?: undefined;
            "absolutePath"?: undefined;
            "file"?: undefined;
            "sourceUnit"?: undefined;
            "symbolAliases"?: undefined;
            "unitAlias"?: undefined;
        })[];
        "src": string;
    };
    "compiler": {
        "name": string;
        "version": string;
    };
    "networks": {};
    "schemaVersion": string;
    "updatedAt": string;
    "devdoc": {
        "author": string;
        "methods": {};
        "title": string;
    };
    "userdoc": {
        "methods": {};
    };
};
