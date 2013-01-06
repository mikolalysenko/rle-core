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


How it works
============

Internally rle-voxels represents a volume as a list of runs sorted in colexicographic order.  This allows for efficient point membership queries and fast iteration.

Limitations
-----------

rle-voxels does not support in place updates of volumes.  The reason for this is that there is no standard balanced binary search tree data structure for Javascript, and so far I haven't seen any performant implementations which would be suitable for storing the large sort of data sets.  Ideally, the best sort of data structure would be a cache-oblivious B* tree, but implementing this within Javascript is incredibly difficult due to the fact that it is hard to make gaurantees about the placement of structures in memory.

Documentation
=============

Here are some resources which explain how to use this library:

* [API Reference]https://github.com/mikolalysenko/rle-voxels/blob/master/API.md)
* Test cases
* Interactive WebGL demo
* Blog post on internals of rle-voxels

Acknowledgements
================
(c) 2012-2013 Mikola Lysenko (mikolalysenko@gmail.com).  MIT License.
