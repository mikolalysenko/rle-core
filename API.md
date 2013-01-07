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

Creates a multi volume stencil iterator.

Params:
* `volumes`: An array of volume objects (eg. `BinaryVolume`s)
* `stencil`: A stencil, just like in `createStencil()`

## `MultiIterator(volumes, stencil, ptrs, coord)`

A multi volume stencil iterator.

Members:
* `volumes`
* `stencil`
* `ptrs`
* `coord`

Methods:
* `clone()`: Makes a copy
* `subiterator(n)`: Returns a `StencilIterator` associated to `volumes[n]` at the current position.
* `hasNext()`: Returns `true` if `next()` will advance iterator, `false` otherwise.
* `next()`: Advances the iterator to next run
* `nextCoord()`: Returns the next coordinate of the iterator
* `seek(coord)`: Sets the position of the iterator to `coord`


# `rle.stencils` #

Some useful stencils for iterating over volumes.

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

A single run in a binary volume.

Members:
* `coord`: The start of the run
* `value`: The value of the run

Methods:
* None


## `BinaryVolume(runs)`

A data structure for representing smooth run length encoded volumetric data.  (In other words, a narrowband level set representation of a solid object).

Members:
* `runs`: An array of `BinaryRun` objects.

Methods:
* `clone()`: Makes a deep copy of the volume
* `testPoint(point)`: Tests if a single point is contained in the volume
* `testPointList(point_list)`:  Tests if an array of points are contained within the volume.  Note that `point_list` will be sorted lexicographically.
* `surface()`: Extracts a mesh from the binary volume using surface nets


### `EMPTY_VOLUME`

### `sample(resolution, potential)`

Params:
* `resolution`: A length 3 array of integers representing the resolution at which to sample.
* `potential`: A function taking a 3D vector as input that returns an approximation of the signed distance field of some solid object.

Returns:
* A `BinaryVolume` representing the potential function in the region `[0,0,0]` to `resolution`.

### `merge(volumes, r_func)`

Combines a collection of volumes together using an R-function.

Params:
* `volumes`: An array of volume objects
* `r_func`: An R-function

Returns:
* A merged `BinaryVolume` which is obtained by applying `r_func` to each field point-wise.

### `union(a, b)`

Approximately computes the set-theoretic union of two binary volumes.

Params:
* `a,b`: A pair of `BinaryVolume`s.

Returns:
* The pointwise union of `a` and `b`.


### `intersect(a, b)`

### `subtract(a, b)`

### `complement(a)`

### `dilate(volume, kernel)`

### `erode(volume, kernel)`

### `labelComponents(volume)`

### `splitComponents(volume, [labelStruct])`


