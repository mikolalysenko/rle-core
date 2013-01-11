# API #


## Volume(runs) ##

A sorted list of runs (encoded as `Run` objects) representing a narrowband level set.  Must have the property that every voxel near the surface is contained within a radius 1 von Neumann neighborhood.

## `Run(coord, value)` ##

A tuple consisting of a pair of elements `coord` and `value` representing the coordinate

## `empty()` ##

Creates an empty volume 

## `sample(lo, hi, potential)` ##

Samples the level set of `potential`  at uniform spacing over the range lo-hi

Params:
* `lo`: A 3D vector of integers giving the coordinates of the volume
* `hi`: A 3D vector of upper bounds
* `potential`: A function taking a 3D vector as input that returns an approximation of the signed distance field of some solid object.

Returns:
* A `Volume` representing the potential function in the region `[0,0,0]` to `resolution`.

Example:

    //Create narrowband level set for a sphere
    var sphere = rle.sample([-16,-16,-16], [16,16,16], function(x) {
      return 10 - Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]);
    });

## `surface(volume, [lo,hi])` ##

Extracts a triangulated mesh representing the level set encoded in volume.


## `apply(volume, stencil, func)` ##

## `merge(volumes, r_func)` ##



