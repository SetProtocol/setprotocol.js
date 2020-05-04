module.exports = function(BN) {
  return function (chai, utils) {
    const addFlag = function(flag) { return function() {utils.flag(this, flag, true);} }

    chai.Assertion.addProperty('eq', addFlag('eq'));
    chai.Assertion.addProperty('lt', addFlag('lt'));
    chai.Assertion.addProperty('lte', addFlag('lte'));
    chai.Assertion.addProperty('gt', addFlag('gt'));
    chai.Assertion.addProperty('gte', addFlag('gte'));

    const negativeProperty = function(actual) {
      this.assert(actual.isNeg(),
      `expected ${actual} to be negative`,
      `expected ${actual} to not be negative`
      );
    }
  
    const evenProperty = function(actual) {
      this.assert(actual.isEven(),
      `expected ${actual} to be even`,
      `expected ${actual} to not be even`,
      );
    }
  
    const oddProperty = function(actual) {
      this.assert(actual.isOdd(),
      `expected ${actual} to be odd`,
      `expected ${actual} to not be odd`,
      );
    }
  
    const zeroProperty = function(actual) {
      this.assert(actual.isZero(),
      `expected ${actual} to be zero`,
      `expected ${actual} to not be zero`,
      );
    }
  
    const equalMethod = function(expected, actual) {
      this.assert(
        actual.eq(expected),
        `expected ${actual} to equal ${expected}`,
        `expected ${actual} to be different from ${expected}`
      );
    }
  
    const belowMethod = function(expected, actual) {
      this.assert(
        actual.lt(expected),
        `expected ${actual} to be below ${expected}`,
        `expected ${actual} to not be below ${expected}`,
      );
    }
  
    const mostMethod = function(expected, actual) {
      this.assert(
        actual.lte(expected),
        `expected ${actual} to be at most ${expected}`,
        `expected ${actual} to not be at most ${expected}`,
      );
    }
  
    const aboveMethod = function(expected, actual) {
      this.assert(
        actual.gt(expected),
        `expected ${actual} to be above ${expected}`,
        `expected ${actual} to not be above ${expected}`,
      );
    }
  
    const leastMethod = function(expected, actual) {
      this.assert(
        actual.gte(expected),
        `expected ${actual} to be at least ${expected}`,
        `expected ${actual} to not be at least ${expected}`,
      );
    }

    const overrideFn = function(newFn) {
      return function (_super) {
        return function (expected) {
          if (utils.flag(this, 'BN')) {
            newFn.apply(this, [new BN(expected), new BN(this._obj)]);
          } else {
            _super.apply(this, arguments);
          }
        }
      }
    }

    const addProp = function(newProp) {
      return function() {
        newProp.apply(this, [new BN(this._obj)]);
      }
    }

    const BNMethod = function(expected) {
      const actual = new BN(this._obj);
      expected = new BN(expected);
      if (utils.flag(this, 'eq')) equalMethod.apply(this, [expected, actual]);
      if (utils.flag(this, 'lt')) belowMethod.apply(this, [expected, actual]);
      if (utils.flag(this, 'lte')) mostMethod.apply(this, [expected, actual]);
      if (utils.flag(this, 'gt')) aboveMethod.apply(this, [expected, actual]);
      if (utils.flag(this, 'gte')) leastMethod.apply(this, [expected, actual]);
      if (!utils.flag(this, 'eq') && !utils.flag(this, 'lt') && !utils.flag(this, 'lte') &&
                                  !utils.flag(this, 'gt') && !utils.flag(this, 'gte')) {
        const msg = 'Property missing. Available: eq, lt, lte, gt, gte.';
        this.assert(utils.flag(this, 'negate'), msg, msg);
      }
    }

    chai.Assertion.addMethod('BN', BNMethod);

    chai.Assertion.addProperty('negative', addProp(negativeProperty))
    chai.Assertion.addProperty('even', addProp(evenProperty));
    chai.Assertion.addProperty('odd', addProp(oddProperty));
    chai.Assertion.addProperty('zero', addProp(zeroProperty));
  };
};
