// Minimal implementation of the perf_hooks module
// This just provides a performance object compatible with the DOM implementation

'use strict';

// Create a minimal performance implementation
const performance = {
  now() {
    return Date.now();
  },
  mark() {},
  measure() {},
  clearMarks() {},
  clearMeasures() {},
  timeOrigin: Date.now(),
  timing: {}
};

module.exports = { performance }; 