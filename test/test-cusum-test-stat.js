'use strict';

var chai = require('chai');
var expect = chai.expect;

var cusum = require('../index');

describe('cusum', function () {
  it('should return [] if baseline > data.length', function () {
    expect(cusum([], 1, 0)).to.deep.equal([]);
  });

  it('should return [] if baseline + guardBand > data.length', function () {
    expect(cusum([1], 1, 1)).to.deep.equal([]);
  });

  it('should return input if baseline=0', function () {
    // With baseline < 2, testStat is just input
    expect(cusum([0, 1, 2, 3], 0, 0)).to.deep.equal([0, 1, 2, 3]);
  });

  // TODO more tests
});
