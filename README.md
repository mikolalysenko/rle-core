`rle-core`
=========

...is the central package in the `rle-*` CommonJS libraries for 3D narrow band level sets.  These tools are currently a work in progress, so expect stuff to change over time.  This package contains fundamental data structures for working with narrowband level sets. Higher order algorithms are to be built on top of these tools.

Installation
============

First, install it via npm:

    npm install rle-core

Then, you can use the core library as follows:

    var core = require("rle-core");
    
    //Create a box
    var box = core.sample([-10,-10,-10], [10,10,10], function(x) {
      return Math.max(x[0], x[1], x[2]) < 10 ? 0 : 1
    });

Or if you want some more features, you can just pull in rle-all:

    npm install rle



Just the basics
===============

For beginners, there are really only two methods you will ever need to use in this package:

* `empty`
* `sample`

With these tools and the other packages, you should be able to get around and do basic volume

API
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

### `coords : Array(Array(int))`

### `distances : Array(float)`

### `phases : Array(int)`

### `clone()`

### `Volume.length()`

### `Volume.point(i,retval)`

### `Volume.bisect(coord, lo, hi)`


`VolumeBuilder`
---------------

### `push`


`StencilIterator`/`MultiIterator`
---------------------------------

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
