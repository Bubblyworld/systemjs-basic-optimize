# SystemJS Bundle Optimization
There is a plan to add automated bundle optimization into SystemJS - see [here](https://github.com/systemjs/builder/issues/51). Originally written as a default option for the [zygo](https://github.com/Bubblyworld/zygo) framework, it might be useful in the future to others.

### What it does:
This optimization is very simple:
- Put all modules shared by every page into a common bundle.
- Each group of modules shared by some but not all of the pages are bundles separately.
- Modules specific to a given page are bundled separately.

Note that step one and three are actually just special cases of step two. This particular optimization function guarantees no module duplication in the resulting set of bundles.

If you have any ideas regarding bundle optimization or APIs for doing it, [please contribute to the discussion!](https://github.com/systemjs/builder/issues/51)
