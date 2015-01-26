module.exports = optimize;

/*
Takes a dependency object, consisting of module dependencies keyed
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
function optimize(pages, builder) {
  return getPageBundles(pages, builder)
    .then(function(bundles) { return extractCommon(bundles, builder); })
    .then(function(bundles) { return extractSharedDep(bundles, builder); });
}

function extractSharedDep(bundles, builder) {
  var sharedDepBundle = {
    routes: [],
    tree: {}
  };

  //run through bundles - if a bundle is shared by another, cut it into moduleCounts
  var moduleCounts = getModuleCounts(bundles);
  bundles.map(function(bundle) {
    Object.keys(bundle.tree).map(function(module) {
      if (moduleCounts[module] > 1) {
        sharedDepBundle.routes = sharedDepBundle.routes.concat(bundle.routes);
        sharedDepBundle.tree[module] = bundle.tree[module];
        delete bundle.tree[module];
      }
    });
  });

  sharedDepBundle.routes = removeDuplicates(sharedDepBundle.routes);
  bundles.push(sharedDepBundle);
  return bundles;
}

//Extract a bundle of modules common to each of the current bundles
function extractCommon(bundles, builder) {
  var commonBundle = {
    routes: [],
    tree: {}
  };

  bundles.map(function(bundle) {
    commonBundle.routes = commonBundle.routes.concat(bundle.routes);

    if (Object.keys(commonBundle.tree).length === 0)
      commonBundle.tree = bundle.tree;

    commonBundle.tree = builder.intersectTrees(commonBundle.tree, bundle.tree);
  });

  bundles.map(function(bundle) {
    bundle.tree = builder.subtractTrees(bundle.tree, commonBundle.tree);
  });

  commonBundle.routes = removeDuplicates(commonBundle.routes);
  bundles.push(commonBundle);
  return bundles;
}

//Counts the number of times each module occurs in the list of bundles.
function getModuleCounts(bundles) {
  var moduleCounts = {};
  bundles.map(function(bundle) {
    Object.keys(bundle.tree).map(function(module) {
      if (!moduleCounts[module]) moduleCounts[module] = 0;
      moduleCounts[module]++;
    });
  });

  return moduleCounts;
}

//Remove duplicates in an array
function removeDuplicates(array) {
  return array.filter(function(x, i) {
    return array.indexOf(x) === i;
  });
}

//Given the dependencies keyed by page, returns a list of bundle objects
// bundling all the dependencies for each route. We then transform this
// extractCommon and extractShared to get the described output.
function getPageBundles(pages, builder) {
  var routeModules = [];

  return Object.keys(pages).reduce(function(chain, next) {
    return chain
      .then(function() { return getPageTree(pages[next], builder); })
      .then(function(tree) {
        routeModules.push({
          routes: [next],
          tree: tree
        });
      });
  }, Promise.resolve())
    .then(function() { return routeModules; });
}

function getPageTree(modules, builder) {
  return Promise.all(modules.map(builder.trace.bind(builder)))
    .then(function(trees) {
      return trees.reduce(function(result, next) {
        return builder.addTrees(result, next.tree);
      }, {});
    });
}
