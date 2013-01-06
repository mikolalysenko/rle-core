`rle-voxels`
=========

...is a Javascript library for working with 3D run-length encoded volumes.  It is currently a work in progress, so expect this stuff to change over time.

Features:

* Run length encoding
* Flexible iterator system
* Supported volume types: Binary
* Efficient point membership queries
* Isosurface extraction
* Boolean set operations (CSG)
* Connected component labelling
* Morphological (Minkowski) operations (dilation, erosion, etc.)

Installation
============

Via npm:

    npm install rle-voxels

And to use it:

    var rle = require("rle-voxels");
    var box = rle.binary.sample([100, 100, 100], new Function("x",
          "return Math.min(Math.min(Math.abs(x[0]-50), Math.abs(x[1]-50)), Math.abs(x[2]-50)) - 30;"
        );
    var mesh = box.surface();

API
===

The library is split into several submodules which provide various features.  These are stored in various subobjects below the main library.  There are also some commonly used functions which are stored in the root namespace of the library.


`rle`
-----

Root namespace for library.  Contains constants and other common values.

### `POSITIVE_INFINITY`

Upper bound for coordinate system

### `NEGATIVE_INFINITY`

Lower bound for coordinate system

### `compareCoord(a, b)`

Compares a pair of 3D vectors colexicographically to recover relative ranking.

Returns:
* < 0 if a comes before b
* > 0 if b comes before a
* = 0 if rank of a = rank of b

### `bisect(runs, lo, hi, coord)`

Finds the lower bound on coord within the range [lo, hi) of runs.


`rle.iterators`
---------------

Code for iterating over volumes

### `createStencil(volume, stencil)`

Creates a stencil iterator for iterating over a run length encoded volume with the given stencil template.

### `StencilIterator`

A `StencilIterator` walks over a volume in a fixed pattern.  

#### `StencilIterator.volume`

A reference to the volume this iterator is walking over.

#### `StencilIterator.stencil`

An array of 3D coordinates representing the offsets of the stencil.

#### `StencilIterator.ptrs`

An array of integers representing the current position of the iterator in the volume.

#### `StencilIterator.coord`

A 3D vector 

#### `StencilIterator.clone()`

Returns a copy of the stencil iterator

#### `StencilIterator.hasNext()`

Checks if iterator is at end of list.

#### `StencilIterator.next()`

Advances stencil of iterators by one run.

#### `StencilIterator.nextCoord()`

Returns the next coordinate of the iterator.

#### `StencilIterator.seek(coord)`

Sets the iterator to coordinate.


### `createMultiStencil(volumes, stencil)`

### `MultiIterator`

#### `MultiIterator.clone()`

#### `MultiIterator.hasNext()`

#### `MultiIterator.next()`

#### `MultiIterator.nextCoord()`

#### `MultiIterator.seek(coord)`


`rle.stencils`
--------------

Some useful templates for iterating over volumes.

### `SURFACE`

A 2x2x2 cube stencil:
    
    SURFACE = [
      [ 0, 0, 0],
      [-1, 0, 0],
      [ 0,-1, 0],
      [-1,-1, 0],
      [ 0, 0,-1],
      [-1, 0,-1],
      [ 0,-1,-1],
      [-1,-1,-1]
    ];

### `MOORE`

A stencil representing the Moore neighborhood of a point:

    MOORE = [
      [ 0, 0, 0],
      [-1, 0, 0],
      [ 1, 0, 0],
      [ 0,-1, 0],
      [ 0, 1, 0],
      [ 0, 0,-1],
      [ 0, 0, 1]
    ];

### `VON_NEUMANN`

A 3x3x3 cube centered at [0,0,0]:

    VON_NEUMANN = [];
    for(var dz=-1; dz<=1; ++dz)
    for(var dy=-1; dy<=1; ++dy)
    for(var dx=-1; dx<=1; ++dx) {
      VON_NEUMANN.push([dx,dy,dz]);
    }


`rle.binary`
------------
This module contains code and utilities for working on 3D solid objects.


### `BinaryRun(coord, value)`


### `BinaryVolume(runs)`

#### `BinaryVolume.clone()`

#### `BinaryVolume.surface()`

#### `BinaryVolume.labelComponents()`

#### `BinaryVolume.splitComponents([labels])`


### `EMPTY_VOLUME`


### `sample(resolution, potential)`

### `merge(volumes, merge_func)`

### `union(a, b)`

### `intersect(a, b)`

### `subtract(a, b)`

### `complement(a)`

### `dilate(a, kernel)`

### `erode(a, kernel)`



Acknowledgements
================
(c) Mikola Lysenko 2012-2013.  MIT License.
