// TAKEN pretty much verbatim from the awesome dharma repo

/**
 * Script usage:
 *
 * node scripts/documentation/parse_typedoc.js
 */

const Parser = require("../../documentation/typedocToMdParser");

/**
 * The location of a Typedoc generated JSON file, that contains documentation
 * data for the API.
 *
 * @type {string}
 */
const inputFile = "./documentation/typedoc.json";

/**
 * The writeable location of the markdown file.
 *
 * @type {string}
 */
const outputFile = "./documentation/output.md";

// Classes to include in our markdown file genreation
const classes = [
	{
		name: 'SetProtocol',
		apiPath: 'setProtocol',
	},
	{
		name: 'OrderAPI',
		apiPath: 'setProtocol.orders',
	},
	{
		name: 'ERC20Wrapper',
		apiPath: 'setProtocol.erc20',
	},
	{
		name: 'SetTokenWrapper',
		apiPath: 'setProtocol.setToken',
	},
]

/**
 * An instance of a TypedocParser, which is capable of turning Typedoc JSON
 * into more human-friendly documentation instructions.
 */
const parser = new Parser(inputFile, classes);

console.log(`Parsing and Generating Markdown "${inputFile}"`);
parser.parse();

console.log(`Writing to "${outputFile}"`);
parser.writeToFile(outputFile);

console.log("Complete, exiting.");
