`rle-voxels`
=========

...is a Javascript library for working with run-length encoded volumes.  It is currently a work in progress, so expect this stuff to change over time.

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


`rle.iterators`
---------------

`rle.stencils`
--------------

`rle.binary`
------------


Acknowledgements
================
(c) Mikola Lysenko 2012-2013.  MIT License.
