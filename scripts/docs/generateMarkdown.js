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

const methodSource = "https://github.com/SetProtocol/setprotocol.js/tree/master/src/";

// Classes to include in our markdown file generation
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
		name: 'ERC20API',
		apiPath: 'setProtocol.erc20',
	},
	{
		name: 'ExchangeIssueAPI',
		apiPath: 'setProtocol.exchangeIssue',
	},
	{
		name: 'PayableExchangeIssueAPI',
		apiPath: 'setProtocol.payableExchangeIssue',
	},
	{
		name: 'RebalancingManagerAPI',
		apiPath: 'setProtocol.rebalancingManager',
	},
	{
		name: 'SetTokenAPI',
		apiPath: 'setProtocol.setToken',
	},
	{
		name: 'SystemAPI',
		apiPath: 'setProtocol.system',
	},
	{
		name: 'RebalancingAPI',
		apiPath: 'setProtocol.rebalancing',
	},
]

/**
 * An instance of a TypedocParser, which is capable of turning Typedoc JSON
 * into more human-friendly documentation instructions.
 */
const parser = new Parser(inputFile, classes, methodSource);

console.log(`Parsing and Generating Markdown "${inputFile}"`);
parser.parse();

console.log(`Writing to "${outputFile}"`);
parser.writeToFile(outputFile);

console.log("Complete, exiting.");
