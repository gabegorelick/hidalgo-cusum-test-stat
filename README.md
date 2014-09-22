# hidalgo-cusum-test-stat

> [Hidalgo.js](https://github.com/gabegorelick/hidalgo.js) library to calculate CUSUM-based test statistics

Yes it's a long name, but at least it's descriptive.

## Install

```sh
$ npm install --save hidalgo-cusum-test-stat
```

## Usage

For best results, use with [hidalgo-cusum-pvalue](https://github.com/gabegorelick/hidalgo-cusum-pvalue):

```js
var testStat = require('hidalgo-cusum-test-stat');
var pValue = require('hidalgo-cusum-pvalue');

var stats = testStat([0, 1, 2, 3 /*, ... more data ... */], 28, 2);
var pValues = stats.map(pValue);
```

## API

### `cusum(data, baseline, guardBand [, options])`

Calculates an array of test statistics. Returns an array of numbers of length `data.length - baseline - guardBand`.

This function takes the following mandatory parameters:

* `data` - array of numbers representing data points
* `baseline` - number of previous data points to use. This should be at least 28 for best results.
* `guardBand` - number of data points in between the baseline and the point to calculate

Formally, `cusum[i]` is a function of `data[i - baseline - guardBand..i - guardBand]`. In other words, if your baseline
is 28 and your guard band is 2 (which are the recommended defaults), then CUSUM will look at the 28 data points
preceding `i-2` to calculate `cusum[i]`. This means that CUSUM will not output values for the first
`baseline + guardBand` values in `data`.

`cusum` also takes an optional `options` parameter. `options` is an object with the following keys:

* `generateBaseline` - Function to generate baseline data from the input array. Use this to alter the data set
for example, by removing long strings of 0 counts. Defaults to returning the input array unchanged
* `cusumK` - Number to subtract from the test stat. Defaults to 0.5
* `minSigma` - Minimum σ. The standard deviation of the baseline data is used only if it is greater than `minSigma`.
Otherwise, `minSigma` is used. Defaults to 0.5
* `resetLevel` - Test statistics larger than `resetLevel` are reduced. Defaults to 4
