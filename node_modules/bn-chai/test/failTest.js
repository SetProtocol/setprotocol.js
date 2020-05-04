const chai = require('chai');
const expect = chai.expect;
const BN = require('bn.js');
const bnChai = require('../index.js');
chai.use(bnChai(BN));

// all tests should fail

describe('bn-chai fail tests', function () {
  it('invoking BN without properties', function() {
    expect(new BN('1')).to.be.BN(1);
  })

  it('invoking not.BN without properties', function() {
    expect(new BN('1')).not.to.be.BN(1);
  })

  it('should be equal', function () {
    expect(new BN('1')).to.be.eq.BN(new BN('2'));
  });

  it('should not be equal', function () {
    expect(new BN('1')).to.not.be.eq.BN(new BN('1'));
  });

  it('should be negative', function () {
    expect(new BN('1')).to.be.negative;
  });

  it('should not be negative', function () {
    expect(new BN('-1')).to.not.be.negative;
  });

  it('should be even', function () {
    expect(new BN('1')).to.be.even;
  });

  it('should be odd', function () {
    expect(new BN('2')).to.be.odd;
  });

  it('should be zero', function () {
    expect(new BN('1')).to.be.zero;
  });

  it('should not ne zero', function () {
    expect(new BN('0')).to.not.be.zero;
  });

  it('should be below', function () {
    expect(new BN('1')).to.be.lt.BN(new BN('1'));
  });

  it('should be most', function () {
    expect(new BN('1')).to.be.lte.BN(new BN('0'));
  });

  it('should be above', function () {
    expect(new BN('1')).to.be.gt.BN(new BN('1'));
  });

  it('should be least', function () {
    expect(new BN('0')).to.be.gte.BN(new BN('1'));
  });
});