# API Overview #

The library is split into several submodules which provide various features.  These are stored in various subobjects below the main library.  There are also some commonly used functions which are stored in the root namespace of the library.

## Table of contents ##

- [API Overview](#api-overview)
	- [Table of contents](#table-of-contents)
- [rle](#rle)
	- [POSITIVE_INFINITY](#positive_infinity)
	- [NEGATIVE_INFINITY](#negative_infinity)
	- [compareCoord(a, b)](#comparecoorda-b)
- [rle.iterators](#rleiterators)
	- [createStencil(volume, stencil)](#createstencilvolume-stencil)
	- [StencilIterator(volume, stencil, ptrs, coord)](#stenciliteratorvolume-stencil-ptrs-coord)
		- [Members](#members)
			- [volume](#volume)
			- [stencil](#stencil)
			- [ptrs](#ptrs)
			- [coord](#coord)
		- [Methods:](#methods)
			- [clone()](#clone)
			- [hasNext()](#hasnext)
			- [next()](#next)
			- [nextCoord()](#nextcoord)
			- [seek(ncoord)](#seekncoord)
	- [createMultiStencil(volumes, stencil)](#createmultistencilvolumes-stencil)
	- [MultiIterator(volumes, stencil, ptrs, coord)](#multiiteratorvolumes-stencil-ptrs-coord)
		- [Members](#members-1)
			- [volumes](#volumes)
			- [stencil](#stencil-1)
			- [ptrs](#ptrs-1)
			- [coord](#coord-1)
		- [Methods](#methods-1)
			- [clone()](#clone-1)
			- [subiterator(n)](#subiteratorn)
			- [hasNext()](#hasnext-1)
			- [next()](#next-1)
			- [nextCoord()](#nextcoord-1)
			- [seek(coord)](#seekcoord)
- [rle.stencils](#rlestencils)
	- [SURFACE](#surface)
	- [MOORE](#moore)
	- [VON_NEUMANN](#von_neumann)
- [rle.binary](#rlebinary)
	- [BinaryRun(coord, value)](#binaryruncoord-value)
		- [Members](#members-2)
			- [coord](#coord-2)
			- [value](#value)
	- [BinaryVolume(runs)](#binaryvolumeruns)
		- [Members](#members-3)
			- [runs](#runs)
		- [Methods](#methods-2)
			- [clone()](#clone-2)
			- [testPoint(point)](#testpointpoint)
			- [testPointList(point_list)](#testpointlistpoint_list)
			- [surface()](#surface-1)
	- [empty()](#empty)
	- [sample(resolution, potential)](#sampleresolution-potential)
	- [merge(volumes, r_func)](#mergevolumes-r_func)
	- [unite(a, b)](#unitea-b)
	- [intersect(a, b)](#intersecta-b)
	- [subtract(a, b)](#subtracta-b)
	- [complement(a)](#complementa)
	- [dilate(volume, stencil)](#dilatevolume-stencil)
	- [erode(volume, stencil)](#erodevolume-stencil)
	- [closing(volume, stencil)](#closingvolume-stencil)
	- [opening(volume, stencil)](#openingvolume-stencil)
	- [labelComponents(volume)](#labelcomponentsvolume)
	- [splitComponents(volume, [labelStruct])](#splitcomponentsvolume-labelstruct)


# `rle` #

The root namespace for library.  Contains constants and common methods for operating on runs.

## `POSITIVE_INFINITY`

Upper bound for coordinate system

## `NEGATIVE_INFINITY`

Lower bound for coordinate system

## `compareCoord(a, b)`

Compares a pair of 3D vectors colexicographically to recover relative ranking.

Params:
* a, b : A pair of 3D vectors

Returns:
* < 0 if a comes before b
* > 0 if b comes before a
* = 0 if rank of a = rank of b

# rle.iterators #

Code for iterating over volumes

## `createStencil(volume, stencil)`

Creates a stencil iterator for iterating over a run length encoded volume with the given stencil template.

Params:
* `volume`  : A run length encoded volume (eg. a BinaryVolume)
* `stencil` : An array of length 3 arrays representing the coordinates of a stencil

Returns:
* A `StencilIterator` object pointing to the start of volume


## `StencilIterator(volume, stencil, ptrs, coord)`

A `StencilIterator` maintains a collection of pointers into a volume.

### Members

#### `volume`

A reference to the volume object to be iterated over.

#### `stencil`

An array of coordinate offsets representing the

#### `ptrs`

An array of pointers into the volume representing the current runs at the position.

#### `coord`

The current position of the iterator in the volume

### Methods:

#### `clone()`

Returns a copy of the stencil iterator

#### `hasNext()`

Returns a boolean truth value representing whether the iterator is at the end of the volume.

#### `next()`

Advances the iterator to the next coordinate
    
#### `nextCoord()`

Returns the next coordinate of the iterator

#### `seek(ncoord)`

Sets the position of the iterator to ncoord

## `createMultiStencil(volumes, stencil)`

Creates a multi volume stencil iterator.

Params:
* `volumes`: An array of volume objects (eg. `BinaryVolume`s)
* `stencil`: A stencil, just like in `createStencil()`

## `MultiIterator(volumes, stencil, ptrs, coord)`

A multi volume stencil iterator.

### Members

#### `volumes`

#### `stencil`

#### `ptrs`

#### `coord`

### Methods

#### `clone()`

Returns a copy of the iterator

#### `subiterator(n)`

Params:
* `n` is an integer between `0` and `volumes.length-1` inclusive identifying a particular volume.

Returns:
* A `StencilIterator` associated to `volumes[n]` at the current position of the iterator.

#### `hasNext()`

Returns `true` if `next()` will advance iterator, `false` otherwise.

#### `next()`

Advances the iterator to next run.

#### `nextCoord()`

Returns the next coordinate of the iterator

#### `seek(coord)`

Sets the position of the iterator to `coord`


# `rle.stencils` #

Some useful stencils for iterating over volumes.

## `SURFACE`

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

## `MOORE`

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

## `VON_NEUMANN`

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

### Members

#### `coord`

The start of the run

#### `value`

The value of the run


## `BinaryVolume(runs)`

A data structure for representing smooth run length encoded volumetric data.  (In other words, a narrowband level set representation of a solid object).

### Members

#### `runs`

An array of `BinaryRun` objects.

### Methods

#### `clone()`

Makes a deep copy of the volume

#### `testPoint(point)`

Tests if a single point is contained in the volume

#### `surface()`

Extracts a mesh from the binary volume using surface nets

## `empty()`

Creates an empty volume object

## `sample(resolution, potential)`

Params:
* `resolution`: A length 3 array of integers representing the resolution at which to sample.
* `potential`: A function taking a 3D vector as input that returns an approximation of the signed distance field of some solid object.

Returns:
* A `BinaryVolume` representing the potential function in the region `[0,0,0]` to `resolution`.

## `merge(volumes, r_func)`

Combines a collection of volumes together using an R-function.

Params:
* `volumes`: An array of volume objects
* `r_func`: An R-function

Returns:
* A merged `BinaryVolume` which is obtained by applying `r_func` to each field point-wise.

## `unite(a, b)`

Returns the set-theoretic union of `BinaryVolume`s `a` and `b`

## `intersect(a, b)`

Returns the set-theoretic intersection of `BinaryVolume`s `a` and `b`.

## `subtract(a, b)`

Returns the set-theoretic difference of `a - b`.

## `complement(a)`

Returns the set-theoretic complement of `a`.

## `dilate(volume, stencil)`

Dilates `volume` by the structuring element `stencil`

## `erode(volume, stencil)`

Erodes `volume` by the structuring element `stencil`.

## `closing(volume, stencil)`

Computes the morphological closing of a volume.  Equivalent to:

    erode(dilate(volume, stencil), stencil)

## `opening(volume, stencil)`

Computes the morphological opening of a volume.  Equivalent to:

    dilate(erode(volume, stencil), stencil)

## `labelComponents(volume)`

Labels all of the connected components within a `BinaryVolume`

Params:
* `volume`:  The volume to label

Returns: An object containing the following members:
* `count`: The number of connected components.
* `labels`: An array of integers with length equal `count` representing the label of each component.

## `splitComponents(volume, [labelStruct])`

Separates a volume into each of its connected components.

Params:
* `volume`: The volume to segment
* (optional) `labelStruct`: A structure containing the result of calling `labelComponents`.  If not present, this data is computed.

Returns:
* An array of binary volumes, each containing a different connected component of `volume`.
