const chai = require('chai');
const expect = chai.expect;
const BN = require('bn.js');
const bnChai = require('../index.js');
chai.use(bnChai(BN));

describe('bn-chai', function () {
  it('should preserve the original equal function', function() {
    expect('!@#$').to.be.equal('!@#$');
  })

  it('should be equal', function () {
    expect(new BN('1')).to.eq.BN(new BN('1'));
  })

  it('should be equal', function () {
    expect(new BN('1')).to.be.eq.BN(new BN('1'));
    expect(new BN('1')).to.be.eq.BN(1);
    expect(new BN('1')).to.be.eq.BN('1');
    expect(1).to.be.eq.BN('1');
  });

  it('should not be equal', function () {
    expect(new BN('1')).not.to.be.eq.BN(new BN('0'));
    expect(new BN('1')).to.not.be.eq.BN(0);
    expect(new BN('1')).to.not.be.eq.BN('0');
    expect(1).to.not.be.eq.BN('0');
  });

  it('should be negative', function () {
    expect(new BN('-1')).to.be.negative;
    expect('-1').to.be.negative;
    expect(-1).to.be.negative;
  });

  it('should not be negative', function () {
    expect(new BN('1')).to.not.be.negative;
  });

  it('should be even', function () {
    expect(new BN('2')).to.be.even;
    expect('2').to.be.even;
    expect(2).to.be.even;
  });

  it('should not be even', function () {
    expect(1).to.not.be.even;
  });

  it('should be odd', function () {
    expect(new BN('1')).to.be.odd;
    expect('1').to.be.odd;
    expect(1).to.be.odd;
  });

  it('should not be odd', function () {
    expect(2).to.not.be.odd;
  });

  it('should be zero', function () {
    expect(new BN('0')).to.be.zero;
    expect('0').to.be.zero;
    expect(0).to.be.zero;
  });

  it('should not be zero', function () {
    expect(new BN('1')).to.not.be.zero;
  });

  it('should be below', function () {
    expect(new BN('0')).to.be.lt.BN(new BN('1'));
  });

  it('should not be below', function () {
    expect(new BN('1')).to.not.be.lt.BN(new BN('1'));
  });

  it('should be most', function () {
    expect(new BN('0')).to.be.lte.BN(new BN('1'));
    expect(new BN('1')).to.be.lte.BN(new BN('1'));
  });

  it('should not be most', function () {
    expect(new BN('2')).to.not.be.lte.BN(new BN('1'));
  });

  it('should be above', function () {
    expect(new BN('1')).to.be.gt.BN(new BN('0'));
  });

  it('should not be above', function () {
    expect(new BN('1')).to.not.be.gt.BN(new BN('1'));
  });

  it('should be least', function () {
    expect(new BN('1')).to.be.gte.BN(new BN('0'));
    expect(new BN('1')).to.be.gte.BN(new BN('1'));
  });

  it('should not be least', function () {
    expect(new BN('1')).to.not.be.gte.BN(new BN('2'));
  });

  it('should be BN', function () {
    expect(new BN('1')).to.be.BN;
  });

  it('should not be BN', function () {
    expect(1).not.to.be.BN;
  });
});