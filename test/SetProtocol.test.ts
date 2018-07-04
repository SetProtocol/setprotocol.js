import * as chai from "chai";
import * as Web3 from "web3";
import SetProtocol from '../src';

const provider = new Web3.providers.HttpProvider("http://localhost:8545");

const { expect } = chai;

// SetProtocol.test.ts
describe(`SetProtocol`, () => {
  const setProtocolInstance = new SetProtocol(provider);
  it(`should instantiate a new setProtocolInstance`, () => {
    expect(setProtocolInstance instanceof SetProtocol);
  });

  it(`should set a provider in setProtocolInstance`, () => {
    expect(setProtocolInstance.provider).to.exist;
  });
});
