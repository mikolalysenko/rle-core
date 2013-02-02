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
For beginners, there is really only one method you will ever need in this package:

### `sample(lo, hi, phase_func[, distance_func])`

* `lo`: Lower bound on the volume, represented as 3d array of ints
* `hi`: Upper bound on the volume, 3d array of ints
* `phase_func(x)`: A function taking a 3d array of floats as input, returning an int representing the phase of the level set at point x.
* `distance_func(x)`: (Optional) A function that returns the distance to the phase boundary

**Returns:** A dynamic narrowband level set representation of `phase_func`

With this method and the tools in the other  packages, you should be able to get around pretty easily.  The rest of the details are mostly internal stuff, like iteration and allocation.  Feel free to ignore it if this is your first time using rle.

The rest of the stuff
=====================
This package contains iterators and data structures.  There are basically two kinds of RLE volumes, StaticVolumes and DynamicVolumes.  Whichever one you pick should depend on the application you have in mind.  If your volume is short lived, and you are going to be modifying it a lot, use a DynamicVolume.  Accessing StaticVolumes is around 10% more efficient, and they use less memory since they are built on top of typed arrays.  However, constructing a StaticVolume is pretty expensive and so don't build one if you are only going to keep it around for a short time.

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

### `iter.subiterator(n)` (MultiIterator only)
Returns the stencil iterator associated to volume `n` at the location of the current multiiterator.

## Miscellaneous stuff

Finally, `rle-core` also defines the following constants:

* `NEGATIVE_INFINITY`: A special value representing the start of a coordinate.  This is not the same as `Number.NEGATIVE_INFINITY`
* `POSITIVE_INFINITY`: A special value representing the end coordinate of the volume.  Not the same as `Number.POSITIVE_INFINITY`
* `EPSILON`: A small floating point number.

Acknowledgements
================
(c) 2012-2013 Mikola Lysenko (mikolalysenko@gmail.com).  BSD License.
