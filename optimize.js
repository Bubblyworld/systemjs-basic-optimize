module.exports = optimize;

/*
Takes a dependency object, consisting of module dependencies' trace records keyed
 by page ID, for example:
{
  'page1' : ['page1-module1', 'page1-module2', 'shared'],
  'page2' : ['page2-module1', 'shared']
}

Outputs a list of bundle objects, which contain the modules in that bundle
 as well as a list of pages that the bundle is visible to, keyed by page ID.
 For example:
 [
  { routes: ['page1', 'page2'], tree: ...common tree...},
  { routes: ['page1'], tree: ...page 1 tree...},
  ...
 ]
*/
function optimize(pages) {
  var modules = {};
  Object.keys(pages).map(function(key) {
    pages[key].map(function(trace) {
      Object.keys(trace.tree).map(function(moduleName) {
        var record = trace.tree[moduleName];
        if (!modules[moduleName]) modules[moduleName] = {
          record: record,
          deps: []
        };

        modules[moduleName].deps.push(key);
      });
    });
  });

  var bundles = {};
  Object.keys(modules).map(function(key) {
    modules[key].deps = removeDuplicates(modules[key].deps);

    var index = modules[key].deps.sort().join();
    bundles[index] = bundles[index] || {
      routes: modules[key].deps,
      tree: {}
    };

    bundles[index].tree[key] = modules[key].record;
  });

  return Object.keys(bundles).map(function(key) { return bundles[key]; });
}

function removeDuplicates(xs) {
  return xs.filter(function(x, i) {
    return xs.indexOf(x) === i;
  });
}
