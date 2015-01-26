var fs = require('fs');
var optimize = require('../optimize');
var builder = new require('systemjs-builder');
builder.config(fs.readFileSync('config.js'));

var pages = {
  'page1': ['lib/p1f1', 'lib/p1p2f1', 'lib/shared'],
  'page2': ['lib/p2f1', 'lib/p1p2f1', 'lib/shared'],
  'page3': ['lib/p3f1', 'lib/shared']
};

optimize(pages, builder)
  .then(console.log.bind(console));
