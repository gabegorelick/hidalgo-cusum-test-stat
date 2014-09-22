'use strict';

var assign = require('object-assign');
var stdev = require('compute-stdev');
var mean = require('compute-mean');

/**
 * Calculate test statistics to feed into hidalgo-cusum-pvalue.
 *
 * `data` is an array of numbers. `baseline` is the number of previous data points to use. This
 * should be at least 28 for best results. `guardBand` specifies the number of data points in between the baseline and
 * the point to calculate. Formally, cusum[i] is a function of data[i - baseline - guardBand..i - guardBand]. In other
 * words, if your baseline is 28 and your guardBand is 2 (which are the recommended defaults), then CUSUM will look
 * at the 28 data points preceding i-2 to calculate cusum[i]. This means that CUSUM will not output values for the
 * first `baseline + guardBand` values in `data`. So the returned array will be length
 * `data.length - baseline - guardBand`.
 */
module.exports = function cusum (data, baseline, guardBand, options) {
  if (typeof guardBand !== 'number') {
    // While we could provide sane defaults for baseline and guardBand (28 and 2, respectively), that won't work on
    // smaller data sets (even though CUSUM won't be that useful in such cases). We also don't want to deal with every
    // combination of baseline and guardBand being undefined, e.g. what should baseline be if guardBand is 2
    // and the input data is of length 10? It's best to leave those decisions up to the caller.
    throw new Error('You must specify baseline and guardBand');
  }

  // set some sane defaults
  options = assign({
    cusumK: 0.5,
    minSigma: 0.5,
    resetLevel: 4,
    generateBaseline: function (data) {
      return data;
    }
  }, options);

  var testStat = [];
  var testBase = data.slice(0, baseline);
  for (var i = baseline + guardBand; i < data.length; i++) {

    // TODO do we need to completely regenerate baseline data each time?
    var baselineData = options.generateBaseline(testBase);

    if (baselineData.length >= 2) { // min 2 needed for stdev
      var sigma = Math.max(stdev(baselineData), options.minSigma);
      var zStat = (data[i] - mean(baselineData)) / sigma;

      var carry = 0;
      var carryIndex = i - baseline - guardBand - 1;
      if (carryIndex > 0 && carryIndex < testStat.length) {
        if (testStat[carryIndex] > options.resetLevel) {
          carry = 0.5 * options.resetLevel;
        } else {
          carry = Math.max(0, testStat[carryIndex]);
        }
      }

      testStat.push(Math.max(0, carry + zStat - options.cusumK));
    } else {
      if (data[i] >= 0) { // TODO >= or > ? interpolating 0 means something, while null doesn't
        testStat.push(data[i]);
      } else {
        // TODO is there a reason to do this rather than just interpolating the negative number?
        testStat.push(null);
      }
    }

    // Move data set over one by removing first element and adding the next one at the end.
    // Hopefully this is more efficient than repeatedly slicing the input data.
    testBase.shift();
    testBase.push(data[i - guardBand]);
  }

  return testStat;
};
