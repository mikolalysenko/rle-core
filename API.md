# API Overview #

The library is split into several submodules which provide various features.  These are stored in various subobjects below the main library.  There are also some commonly used functions which are stored in the root namespace of the library.

# `rle` #

The root namespace for library.  Contains constants and common methods for operating on runs.

### `POSITIVE_INFINITY`

Upper bound for coordinate system

### `NEGATIVE_INFINITY`

Lower bound for coordinate system

### `compareCoord(a, b)`

Compares a pair of 3D vectors colexicographically to recover relative ranking.

Params:
* a, b : A pair of 3D vectors

Returns:
* < 0 if a comes before b
* > 0 if b comes before a
* = 0 if rank of a = rank of b


# rle.iterators #

Code for iterating over volumes

### `createStencil(volume, stencil)`

Creates a stencil iterator for iterating over a run length encoded volume with the given stencil template.

Params:
* `volume`  : A run length encoded volume (eg. a BinaryVolume)
* `stencil` : An array of length 3 arrays representing the coordinates of a stencil

Returns:
* A `StencilIterator` object pointing to the start of volume


## `StencilIterator(volume, stencil, ptrs, coord)`

A `StencilIterator` maintains a collection of pointers into a volume.

Members:

* `volume`
    A reference to the volume object to be iterated over.

* `stencil`
    An array of coordinate offsets representing the

* `ptrs`
    An array of pointers into the volume representing the current runs at the position.

* `coord`
    The current position of the iterator in the volume

Methods:

* `clone()`
    Returns: a copy of the stencil iterator

* `hasNext()`
    Returns: A boolean truth value representing whether the iterator is at the end of the volume.
    
* `next()`
    Advances the iterator to the next coordinate
    
* `nextCoord()`
    Returns: The next coordinate of the iterator

* `seek(ncoord)`
    Sets the position of the iterator to ncoord


### `createMultiStencil(volumes, stencil)`

Creates a multi volume stencil iterator that walks over multiple volumes simultaneously.


## `MultiIterator`

A multi volume stencil iterator.

### `MultiIterator.clone()`

### `MultiIterator.hasNext()`

### `MultiIterator.next()`

### `MultiIterator.nextCoord()`

### `MultiIterator.seek(coord)`


# `rle.stencils` #

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


# `rle.binary` #

This module contains code and utilities for working on 3D solid objects.


## `BinaryRun(coord, value)`


## `BinaryVolume(runs)`

### `BinaryVolume.clone()`

### `BinaryVolume.surface()`

### `BinaryVolume.labelComponents()`

### `BinaryVolume.splitComponents([labels])`

### `BinaryVolume.pmc(point)`


### `EMPTY_VOLUME`


### `sample(resolution, potential)`

### `merge(volumes, merge_func)`

### `union(a, b)`

### `intersect(a, b)`

### `subtract(a, b)`

### `complement(a)`

### `dilate(a, kernel)`

### `erode(a, kernel)`

