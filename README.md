# setProtocol.js
{Set} Protocol Library for Interacting With Smart Contracts

Note: This is pre-alpha software. Things will constantly be changing and getting updated.

Build the project by performing the following:
```shell
$ npm run build
```

## Installation
Using npm:
```shell
$ npm i -g npm
$ npm i --save setprotocol.js
```

In Node.js:
```js
// Import
import SetProtocol from 'setprotocol.js';

// or 
const SetProtocol = require('setprotocol.js');

// Like with web3, instantiate a new instance and pass in the provider
const setProtocolInstance = new SetProtocol(currentProvider);

// If using a registry, set the registry
setProtocolInstance.updateSetRegistryAddress(registryAddress);
```

For now, you will have to look at the source code itself for documentation, but we will be working to provide a rich set of documentation for this.