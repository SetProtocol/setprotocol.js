# #!/bin/bash
rm -rf documentation;

typedoc --theme markdown --excludeExternals --includeDeclarations  --externalPattern \"**/node_modules/**\" --ignoreCompilerErrors --exclude '**/*+(assertions|constants|errors|schemas|util)/*.ts' --json documentation/typedoc.json src/*

tsc ./scripts/docs/typedocToMdParser.ts --outDir ./documentation

node ./scripts/docs/generateMarkdown