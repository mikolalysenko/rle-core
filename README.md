`rle-core`
=========

...is a JavaScript library for working with 3D narrowband level sets.  It is currently a work in progress, so expect this stuff to change over time.  This library contains fundamental primitives and data structures for manipulating these objects.

Features for v0.1:

* Run length encoding for high performance and low memory cost
* Can perform dense sampling of implicit functions
* Surface computation via naive surface nets
* Point membership queries
* Ray tests
* Stencil based iteration
* Merging
* Connected component labelling

Planned features:

* Triangular mesh to level set conversion
* Advection/upwind methods
* Transformations/warping
* Integral operations (Minkowski functionals, etc.)

Installation
============

Via npm:

    npm install rle-voxels

And to use it:

    var rle = require("rle-voxels");
    var box = rle.sample([-40,-40,-40], [40,40,40], new Function("x",
          "return 30 - Math.min(Math.min(Math.abs(x[0]), Math.abs(x[1])), Math.abs(x[2]));"
        );
    var mesh = rle.surface(box);


Running
=======

To run one of the demos, first install [`serverify`](https://github.com/mikolalysenko/Serverify) via npm:

    sudo npm install -g serverify
    
Then go into one of the directories in `examples/` and run it.  For example:

    cd examples/simple
    serverify
    
And load the page in your browser at http://localhost:8080/index.html

Documentation
=============

Here are some resources which explain how to use this library:

* [API](https://github.com/mikolalysenko/rle-core/blob/master/API.md)
* [Example Code](https://github.com/mikolalysenko/rle-core/tree/master/examples)
* [WebGL Demos](http://mikolalysenko.github.com/rle-core/index.html)
* [Blog](http://0fps.wordpress.com)

How it works
============

Internally rle-core represents a volume as a list of runs sorted in colexicographic order.  This allows for efficient point membership queries and fast iteration.

Limitations
-----------

rle-core does not support efficient in place updates of volumes (though this may change in the future).  The reason for this is that there is no standard balanced binary search tree data structure for Javascript, and none of the implementations that I have seen so far are sufficiently mature, robust and performant for these sorts of data sets.

Acknowledgements
================
(c) 2012-2013 Mikola Lysenko (mikolalysenko@gmail.com).  MIT License.
