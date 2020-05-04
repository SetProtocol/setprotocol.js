export declare const ERC20Detailed: {
    "contractName": string;
    "abi": ({
        "constant": boolean;
        "inputs": {
            "name": string;
            "type": string;
        }[];
        "name": string;
        "outputs": {
            "name": string;
            "type": string;
        }[];
        "payable": boolean;
        "stateMutability": string;
        "type": string;
        "anonymous"?: undefined;
    } | {
        "inputs": {
            "name": string;
            "type": string;
        }[];
        "payable": boolean;
        "stateMutability": string;
        "type": string;
        "constant"?: undefined;
        "name"?: undefined;
        "outputs"?: undefined;
        "anonymous"?: undefined;
    } | {
        "anonymous": boolean;
        "inputs": {
            "indexed": boolean;
            "name": string;
            "type": string;
        }[];
        "name": string;
        "type": string;
        "constant"?: undefined;
        "outputs"?: undefined;
        "payable"?: undefined;
        "stateMutability"?: undefined;
    })[];
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
            "ERC20Detailed": number[];
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
            "symbolAliases": any[];
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
            "baseContracts": {
                "arguments": any;
                "baseName": {
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
                "id": number;
                "nodeType": string;
                "src": string;
            }[];
            "contractDependencies": number[];
            "contractKind": string;
            "documentation": string;
            "fullyImplemented": boolean;
            "id": number;
            "linearizedBaseContracts": number[];
            "name": string;
            "nodeType": string;
            "nodes": ({
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
                };
                "value": any;
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
                            "id": number;
                            "isConstant": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "lValueRequested": boolean;
                            "leftHandSide": {
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
                            "nodeType": string;
                            "operator": string;
                            "rightHandSide": {
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
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
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
                            "id": number;
                            "name": string;
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
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": any[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "constant"?: undefined;
                "stateVariable"?: undefined;
                "storageLocation"?: undefined;
                "typeDescriptions"?: undefined;
                "typeName"?: undefined;
                "value"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": {
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
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                    }[];
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
                    "parameters": any[];
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
                            "id": number;
                            "name": string;
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
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "constant"?: undefined;
                "stateVariable"?: undefined;
                "storageLocation"?: undefined;
                "typeDescriptions"?: undefined;
                "typeName"?: undefined;
                "value"?: undefined;
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
            "ERC20Detailed": number[];
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
            "symbolAliases": any[];
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
            "baseContracts": {
                "arguments": any;
                "baseName": {
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
                "id": number;
                "nodeType": string;
                "src": string;
            }[];
            "contractDependencies": number[];
            "contractKind": string;
            "documentation": string;
            "fullyImplemented": boolean;
            "id": number;
            "linearizedBaseContracts": number[];
            "name": string;
            "nodeType": string;
            "nodes": ({
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
                };
                "value": any;
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
                            "id": number;
                            "isConstant": boolean;
                            "isLValue": boolean;
                            "isPure": boolean;
                            "lValueRequested": boolean;
                            "leftHandSide": {
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
                            "nodeType": string;
                            "operator": string;
                            "rightHandSide": {
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
                            "src": string;
                            "typeDescriptions": {
                                "typeIdentifier": string;
                                "typeString": string;
                            };
                        };
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
                            "id": number;
                            "name": string;
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
                    "src": string;
                };
                "returnParameters": {
                    "id": number;
                    "nodeType": string;
                    "parameters": any[];
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "constant"?: undefined;
                "stateVariable"?: undefined;
                "storageLocation"?: undefined;
                "typeDescriptions"?: undefined;
                "typeName"?: undefined;
                "value"?: undefined;
            } | {
                "body": {
                    "id": number;
                    "nodeType": string;
                    "src": string;
                    "statements": {
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
                        "functionReturnParameters": number;
                        "id": number;
                        "nodeType": string;
                        "src": string;
                    }[];
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
                    "parameters": any[];
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
                            "id": number;
                            "name": string;
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
                    "src": string;
                };
                "scope": number;
                "src": string;
                "stateMutability": string;
                "superFunction": any;
                "visibility": string;
                "constant"?: undefined;
                "stateVariable"?: undefined;
                "storageLocation"?: undefined;
                "typeDescriptions"?: undefined;
                "typeName"?: undefined;
                "value"?: undefined;
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
        "details": string;
        "methods": {
            "decimals()": {
                "return": string;
            };
            "name()": {
                "return": string;
            };
            "symbol()": {
                "return": string;
            };
        };
        "title": string;
    };
    "userdoc": {
        "methods": {};
    };
};
