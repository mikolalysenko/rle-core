`rle-voxels` API
===

The library is split into several submodules which provide various features.  These are stored in various subobjects below the main library.  There are also some commonly used functions which are stored in the root namespace of the library.

Here is a highlevel breakdown of the APIs:

* [rle]
** [rle.iterators]
*** [createStencil]
*** [StencilIterator]
*** [createMultiStencil]
*** [MultiIterator]
** [rle.stencils]
*** [SURFACE]
*** [MOORE]
*** [VON_NEUMANN]
** [rle.binary]
*** [BinaryRun]
*** [BinaryVolume]
*** [EMPTY_VOLUME]
*** [sample]
*** [merge]
*** [union]
*** [intersect]
*** [complement]
*** [dilate]
*** [erode]

# rle #

The root namespace for library.  Contains constants and common methods for operating on runs.

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


# rle.iterators #

Code for iterating over volumes

### `createStencil(volume, stencil)`

Creates a stencil iterator for iterating over a run length encoded volume with the given stencil template.


### `createMultiStencil(volumes, stencil)`

Creates a multi volume stencil iterator that walks over multiple volumes simultaneously.



## `StencilIterator`

A `StencilIterator` walks over a volume in a fixed pattern.  

### `StencilIterator.volume`

A reference to the volume this iterator is walking over.

### `StencilIterator.stencil`

An array of 3D coordinates representing the offsets of the stencil.

### `StencilIterator.ptrs`

An array of integers representing the current position of the iterator in the volume.

### `StencilIterator.coord`

A 3D vector representing the current coordinate of the stencil.

### `StencilIterator.clone()`

Returns a copy of the stencil iterator

### `StencilIterator.hasNext()`

Checks if iterator is at end of list.

### `StencilIterator.next()`

Advances stencil of iterators by one run.

### `StencilIterator.nextCoord()`

Returns the next coordinate of the iterator.

#### `StencilIterator.seek(coord)`

Sets the iterator to coordinate.


### `MultiIterator`

A multi volume stencil iterator.

#### `MultiIterator.clone()`

#### `MultiIterator.hasNext()`

#### `MultiIterator.next()`

#### `MultiIterator.nextCoord()`

#### `MultiIterator.seek(coord)`


`rle.stencils`
==========

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

