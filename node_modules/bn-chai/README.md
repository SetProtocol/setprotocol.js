# bn-chai
bn-chai extends [Chai](http://chaijs.com/) with assertions about [bn.js](https://github.com/indutny/bn.js/) decimals.

## Installation
```bash
npm install -s bn-chai
```

## Setup
```javascript
var chai = require('chai');
var BN = require('bn.js');
var bnChai = require('bn-chai');
chai.use(bnChai(BN));
```

## Usage

When comparing two [bn.js](https://github.com/indutny/bn.js/) decimals **bn1** and **bn2**, instead of doing:

```javascript
expect(bn1.eq(bn2)).to.be.true;
```

You can do this instead:

```javascript
expect(bn1).to.eq.BN(bn2);
```

This plugin is also handy when comparing a [bn.js](https://github.com/indutny/bn.js/) decimal to an inline constant, so instead of writing:

```javascript
expect(bn1.eq(new BN('1'))).to.be.true;
```

You can simply write:

```javascript
expect(bn1).to.eq.BN(1);
```

Which is simpler and more readable.

## Assertions

### eq
Asserts that the target is **equal** to the given object. 
```javascript
expect(new BN('1')).to.eq.BN(1);
expect(new BN('1')).not.to.eq.BN(0);
```

### lt
Asserts that the target is **less than** the given object. 
```javascript
expect(new BN('0')).to.be.lt.BN(1);
expect(new BN('1')).not.to.be.lt.BN(1);
```

### lte
Asserts that the target is **less than** or **equal** to the given object. 
```javascript
expect(new BN('0')).to.be.lte.BN(1);
expect(new BN('1')).to.be.lte.BN(1);
expect(new BN('2')).not.to.be.lte.BN(1);
```

### gt
Asserts that the target is **greater than** the given object. 
```javascript
expect(new BN('1')).to.be.gt.BN(0);
expect(new BN('1')).not.to.be.gt.BN(1);
```

### gte
Asserts that the target is **greater than** or **equal** to the given object. 
```javascript
expect(new BN('1')).to.be.gte.BN(0);
expect(new BN('1')).to.be.gte.BN(1);
expect(new BN('1')).not.to.be.gte.BN(2);
```

### negative
Asserts that the target is **negative**.
```javascript
expect(new BN('-1')).to.be.negative;
expect(new BN('1')).not.to.be.negative;
```

### even
Asserts that the target is **even**.
```javascript
expect(new BN('2')).to.be.even;
expect(new BN('1')).not.to.be.even;
```

### odd
Asserts that the target is **odd**.
```javascript
expect(new BN('1')).to.be.odd;
expect(new BN('2')).not.to.be.odd;
```

### zero
Asserts that the target is equal to 0.
```javascript
expect(new BN('0')).to.be.zero;
expect(new BN('1')).not.to.be.zero;
```

## Mixing BN, numbers and strings

You can mix BN with numbers and strings freely:

```javascript
expect(new BN('1')).to.eq.BN(new BN('1'));
expect(new BN('1')).to.eq.BN('1');
expect(new BN('1')).to.eq.BN(1);

expect('1').to.eq.BN(new BN('1'));
expect('1').to.eq.BN('1');
expect('1').to.eq.BN(1);

expect(1).to.eq.BN(new BN('1'));
expect(1).to.eq.BN('1');
expect(1).to.eq.BN(1);
```
