<p align="center"><img src="https://s3-us-west-1.amazonaws.com/set-protocol/set-logo.svg" width="64" /></p>

<p align="center">
  <a href="https://circleci.com/gh/SetProtocol/set-protocol-oracles/tree/master">
    <img src="https://img.shields.io/circleci/project/github/SetProtocol/set-protocol-oracles/master.svg" />
  </a>
  <a href='https://coveralls.io/github/SetProtocol/set-protocol-oracles'>
    <img src='https://coveralls.io/repos/github/SetProtocol/set-protocol-oracles/badge.svg?branch=master' alt='Coverage Status' />
  </a>
  <a href='https://github.com/SetProtocol/set-protocol-oracles/blob/master/LICENSE'>
    <img src='https://img.shields.io/github/license/SetProtocol/set-protocol-oracles.svg' alt='License' />
  </a>
  <a href='https://www.npmjs.com/package/set-protocol-oracles'>
    <img src='https://img.shields.io/npm/v/set-protocol-oracles.svg' alt='NPM' />
  </a>
</p>

# Set Protocol Oracles

This repository contains smart contracts that implement any data-related dependencies of the Set Protocol system. We use [Truffle](https://github.com/trufflesuite/truffle) as a development environment for compiling, testing, and deploying our contracts.


## Testing
0. Docker Set up
Firstly, you need to install Docker. The easiest way is to follow the Instructions on https://docs.docker.com/install/#supported-platforms

You need to pull the docker image that you want to use by using the following command:

```
docker pull ethereum/solc:0.5.7
```

If you wish not to set up docker, you can turn off the `docker: true` flag in truffle.js

1. Run yarn install
```
yarn install
```

2. Run an ethereum chain on a separate terminal window
```
yarn chain
```

3. Run unit tests
```
yarn test
```
