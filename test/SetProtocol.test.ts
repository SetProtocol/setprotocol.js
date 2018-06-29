import * as chai from "chai";
import * as Web3 from "web3";
import SetProtocol from '../src';

const provider = new Web3.providers.HttpProvider("http://localhost:8545");

const { expect } = chai;

// SetProtocol.test.ts
describe(`SetProtocol`, () => {
  const setProtocolInstance = new SetProtocol(provider);
  it(`should run test suite`, () => {
    expect(1).to.equal(1);
  });

  it(`should expose the V1 API`, () => {
    expect(setProtocolInstance.v1).to.include.all.keys('contracts', 'erc20', 'setToken');
  });
});
