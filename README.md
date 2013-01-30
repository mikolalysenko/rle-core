`rle-core`
=========

...is the central package in the `rle-*` CommonJS libraries for 3D narrow band level sets.  These tools are currently a work in progress, so expect stuff to change over time.  This package contains fundamental data structures for working with narrowband level sets. Higher order algorithms are to be built on top of these tools.

A narrowband level set is a sparse representation of a level set as it is sampled on a regular grid.  However, instead of storing an entire dense array of voxels, narrowband methods only store voxels which are near the boundary of the level set.  This means that their storage and processing requirements are typically O(n^2/3) of the size of a dense level set.  To facilitate efficient queries and streaming operations, these points are stored in lexicographic order.  Doing so allows queries like point membership or surface extraction to run with at most a logarithmic overhead.  As a result, narrowband methods are often much more efficient than dense methods.

`rle` does not support efficient in place updates of volumes (though this may eventually change in the future).  The reason for this is that there is no standard balanced binary search tree data structure for Javascript, and none of the implementations that I have seen so far are sufficiently mature, robust and performant for these sorts of data sets.  This situation will probably improve once ECMAScript 6 is more widely supported.

Overview
--------

Currently, the `rle-*` family of narrowband codes consists of the following packages:

* `rle-core`: (This one) Foundational data structures and algorithms
* `rle-mesh`: Surface extraction and meshing operations
* `rle-funcs`: Functional programming primitives for narrowband levelsets
* `rle-topology`: Topological computations on level sets (connected component extraction, etc.)
* `rle-stencils`: Commonly used stencils
* `rle-repair`: Repair and validation methods, mostly used internally
* `rle-classify`: Primitive classification and queries.  Supports points, lines, rays, boxes, etc.
* `rle-csg`: Constructive solid geometry (aka boolean set operations)
* `rle-morphology`: Mathematical morphology for level sets.

If you want your own package added to the list, open an issue and I'll stick it here.

Usage
=====

First, install it via npm:

    npm install rle-core

Then, you can use the core library as follows:

    var core = require("rle-core");
    
    //Create a box
    var box = core.sample([-10,-10,-10], [10,10,10], function(x) {
      return Math.max(x[0], x[1], x[2]) < 10 ? 0 : 1
    });



Just the basics
===============

For beginners, there are really only two methods you will ever need to use in this package:

* `empty`
* `sample`

With these tools and the other packages, you should be able to get around and do basic volume


`rle-core`
----------

### `core.empty()`

**Returns:** An empty narrowband level set

### `core.sample(lo, hi, phase_func[, distance_func])`

* `lo`: Lower bound on the volume, represented as 3d array of ints
* `hi`: Upper bound on the volume, 3d array of ints
* `phase_func(x)`: A function taking a 3d array of floats as input, returning an int representing the phase of the level set at point x.
* `distance_func(x)`: (Optional) A function that returns the distance to the phase boundary

**Returns:** A narrowband level set representation of `phase_func`

### `core.beginStencil(volume, stencil)`




### `core.beginMulti(volumes, stencil)`

### `core.NEGATIVE_INFINITY : int`

A special value representing the start of a coordinate.  This is not the same as `Number.NEGATIVE_INFINITY`

### `core.POSITIVE_INFINITY : int`

A special value representing the end coordinate of the volume.  Not the same as `Number.POSITIVE_INFINITY`

### `core.EPSILON : float`

A small floating point number.

`Volume`
--------
The `Volume` class is the basic datatype for multiphase level sets.  It has the following members:

### `Volume.coords : Array(Array(int))`

### `Volume.distances : Array(float)`

### `Volume.phases : Array(int)`

### `Volume.clone()`

### `Volume.length()`

### `Volume.push(x,y,z,distance,phase)`

### `Volume.point(i,x)`

### `Volume.bisect(coord, lo, hi)`

`StencilIterator`
-----------------

### `StencilIterator.volume : Volume`

### `StencilIterator.stencil : Array(Array(int))`

### `StencilIterator.ptrs : Array(int))`

### `StencilIterator.clone()`

### `StencilIterator.hasNext()`

### `StencilIterator.next()`

### `StencilIterator.seek(coord)`

### `StencilIterator.nextCoord([result])`

### `StencilIterator.phases([result])`

### `StencilIterator.distances([result])`

`MultiIterator`
-----------------

### `MultiIterator.volume : Volume`

### `MultiIterator.stencil : Array(Array(int))`

### `MultiIterator.ptrs : Array(int))`

### `MultiIterator.clone()`

### `MultiIterator.hasNext()`

### `MultiIterator.next()`

### `MultiIterator.seek(coord)`

### `MultiIterator.subiterator(n)`

### `MultiIterator.nextCoord([result])`

### `MultiIterator.phases([result])`

### `MultiIterator.distances([result])`

Acknowledgements
================
(c) 2012-2013 Mikola Lysenko (mikolalysenko@gmail.com).  MIT License.
