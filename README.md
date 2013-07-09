`rle-core`
=========
...is the central package in the [`rle` narrowband level set family of packages](https://github.com/mikolalysenko/rle-core).  These tools are currently a work in progress, so expect many changes in the coming months.  This package contains fundamental data structures for working with multiphase narrowband level sets. Higher order algorithms are to be built on top of these tools.

Overview
========
A multiphase solid is an extension of the usual concept of a solid object to structures with multiple distinct material phases.  One can recover the usual definition of a solid by just taking the number of phases = 2.

A narrowband level set is a sparse representation of a level set as it is sampled on a regular grid.  However, instead of storing an entire dense array of voxels, narrowband methods only store voxels which are near the boundary of the level set.  This means that their storage and processing requirements are typically O(n^2/3) of the size of a dense level set.

The `rle-*` libraries are split into several components, which we could group coarsely into two layers

Foundation
----------
* [`rle-core`](https://github.com/mikolalysenko/rle-core): Foundational data structures and algorithms
* [`rle-sample`](https://github.com/mikolalysenko/rle-sample): Algorithms for sampling level sets
* [`rle-stencils`](https://github.com/mikolalysenko/rle-stencils): Commonly used stencils
* [`rle-mesh`](https://github.com/mikolalysenko/rle-mesh): Surface extraction and meshing operations
* [`rle-funcs`](https://github.com/mikolalysenko/rle-funcs): Generic surface processing primitives.
* [`rle-classify`](https://github.com/mikolalysenko/rle-classify): Primitive classification and queries.

Extensions
----------
* [`rle-components`](https://github.com/mikolalysenko/rle-components): Connected component labelling and extraction.
* [`rle-csg`](https://github.com/mikolalysenko/rle-csg): Constructive solid geometry (aka boolean set operations)
* [`rle-repair`](https://github.com/mikolalysenko/rle-repair): Repair and validation methods
* [`rle-rasterize`](https://github.com/mikolalysenko/rle-rasterize): Rasterizes meshes into level sets.
* [`rle-morphology`](https://github.com/mikolalysenko/rle-morphology): Mathematical morphology for level sets.


Getting Started
===============
To install the core library, you grab it from npm:

    npm install rle-core
    
By itself rle-core probably isn't enough to do anything terribly interesting.  So if you want to do something cool, you will probably want to import one of the other libraries - like [`rle-sample`](https://github.com/mikolalysenko/rle-sample), which lets you sample level sets; or [`rle-mesh`](https://github.com/mikolalysenko/rle-mesh) which lets you convert level sets into meshes.  To install those packages, just do:

    npm install rle-sample rle-mesh
    
Then you can use them to generate a boxy level set and convert it into a mesh:

    var box = require("rle-sample").solid.dense([-10, -10, -10], [10, 10, 10], function(x) {
      return Math.max(Math.abs(x[0]), Math.abs(x[1]), Math.abs(x[2]));
    });
    
    var mesh = require("rle-mesh")(box);
    
Demos
=====
If you want to see some examples of what you can do with narrow band level sets, here are a few demos:

* [Isosurface mesh extraction](http://mikolalysenko.github.com/rle-mesh/examples/simpleMultiphase/www/index.html)
* [Game of Life in 3D](http://mikolalysenko.github.com/rle-core/life3d/index.html)
* [Morphology Demo](http://mikolalysenko.github.com/rle-morphology/example/www/index.html)

`rle-core` API
==============
`rle-core` contains iterators and data structures.  There are basically two kinds of RLE volumes, StaticVolumes and DynamicVolumes.  Whichever one you pick should depend on the application you have in mind.  If your volume is short lived, and you are going to be modifying it a lot, use a DynamicVolume.  Accessing StaticVolumes is around 10% more efficient, and they use less memory since they are built on top of typed arrays.  However, constructing a StaticVolume is pretty expensive and so don't build one if you are only going to keep it around for a short time.

## `StaticVolume` and `DynamicVolume`

Both of these classes have a pretty similar structure.  They each have 3 fields which coorespond to the data stored in the runs:

* `coords`: An array of 3 arrays corresponding to the x/y/z coordinates of the start of each run.
* `distances`: An array of floats representing the distance to phase boundary for each run.
* `phases`: An array of different phases for each run, represented as 32 bit signed integers

`new`ing a volume with no arguments gives an empty volume.  The volumes define the following methods:

### `volume.clone()`
Makes a deep copy of the volume.

### `volume.length()`
Returns the number of runs in the volume

### `volume.bisect(coord, lo, hi)`
Does a binary search to locate coord within the volume.  `lo` and `hi` are optional bounds on the lower/upper bounds of the coordinate within the volume.

### `volume.push(x, y, z, distance, phase)` (DynamicVolume only)
Appends a run to the volume at x/y/z with given phase and distance to boundary

### `volume.pop()` (DynamicVolume only)
Removes the last run from the volume.

### `volume.toStatic()` (DynamicVolume only)
Returns a static version of the volume

### `volume.toDynamic()` (StaticVolume only)
Returns a dynamic version of the volume

## `StencilIterator` and `MultiIterator`

There are also two different types of iterators.  `StencilIterator`s and `MultiIterator`s.  The main difference is that `StencilIterator` is optimized to iterate over a single volume, while `MultiIterator` iterates over several volumes simultaneously.  To create a stencil iterator, you call:

### `core.beginStencil(volume, stencil)`
Which returns a stencil iterator for the given volume with the given stencil pattern (for example, Moore neighborhood, von Neumann, etc.)

For multi iterators, it is a similar pattern.

### `core.beginMulti(volumes, stencil)`
Here volumes is an array of volumes, and stencil is again some pattern.

Each of the iterator types has the following common data:
* `volume`(`s`): A single volume/array of volumes referencing the volume which is currently being iterated over.
* `stencil`: The stencil pattern
* `ptrs`: An array of pointers into the volume, with one entry per point in the stencil
* `coord`: The current coordinates of the the stencil.

And similarly, all the stencils define the following methods

### `iter.clone()`
Returns a deep copy of th iterator

### `iter.hasNext()`
Returns true if the iterator can be advanced, false otherwise

### `iter.next()`
Advances the iterator forward one run

### `iter.seek(coord)`
Sets the iterator coordinate to `coord`

### `iter.getValues(phases, distances)`
Retrieves the phases/distance-to-phase-boundary for each point in the iterator.  

### `iter.subiterator(n)` (MultiIterator only)
Returns the stencil iterator associated to volume `n` at the location of the current multiiterator.

## Miscellaneous stuff

Finally, `rle-core` also defines the following constants:

* `NEGATIVE_INFINITY`: A special value representing the start of a coordinate.  This is not the same as `Number.NEGATIVE_INFINITY`
* `POSITIVE_INFINITY`: A special value representing the end coordinate of the volume.  Not the same as `Number.POSITIVE_INFINITY`
* `EPSILON`: A small floating point number.

And two helper methods:

### `compareCoord(a, b)`
Compares two coordinates lexicographically

### `saturateAbs(x)`
Returns |x| clamped to [0,1]

Acknowledgements
================
(c) 2012-2013 Mikola Lysenko (mikolalysenko@gmail.com).  BSD License.
