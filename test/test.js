var fs = require('fs');
var optimize = require('../optimize');
var builder = new require('systemjs-builder');
builder.config(fs.readFileSync('config.js'));

var pages = {
  'page1': ['lib/p1f1', 'lib/p1p2f1', 'lib/shared'],
  'page2': ['lib/p2f1', 'lib/p1p2f1', 'lib/shared'],
  'page3': ['lib/p3f1', 'lib/shared']
};

//builder.trace('lib/p1f1').then(console.log.bind(console));
Promise.all(Object.keys(pages).map(function(key) {
  return Promise.all(pages[key].map(builder.trace.bind(builder)))
    .then(function(trees) { pages[key] = trees; });
}))
  .then(function() { return optimize(pages); })
  .then(console.log.bind(console))
