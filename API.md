# API #

## `Volume(runs)` ##

A sorted list of runs (encoded as `Run` objects) representing a multiphase narrowband level set.  Must have the property that every voxel near the surface is contained within a radius 1 von Neumann neighborhood.

## `Run(coord, distance, phase)` ##

An object recording a point on a phase boundary.

* `coord` is the voxel (integer rounded) xyz coordinate of the point
* `distance` is the approximate distance to the phase boundary
* `phase` is the material phase of the voxel

## `empty()` ##

Creates an empty volume 

## `sample(lo, hi, phase_func[, dist_func])` ##

Samples the level set of `potential`  at uniform spacing over the range lo-hi

Params:
* `lo`: A 3D vector of integers giving the coordinates of the volume
* `hi`: A 3D vector of upper bounds
* `phase_func`: A function taking a coordinate represented as a length 3 array that returns an integer representing the phase of the material at this point.
* `dist_func`: (optional) a function taking a coordinate represented as a length 3 array that returns the distance to the phase boundary.  If not present, distance is assumed to be constant (1).

Returns:
* A `Volume` representing the potential function in the region `[0,0,0]` to `resolution`.

Example:

    //A signed distance function for a sphere with radius 10 centered at the origin
    function sphere_dist(x) {
      return 10 - Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2]);
    };
    
    //Create a sphere
    var sphere = rle.sample([-16,-16,-16], [16,16,16], function(x) {
      if(sphere_dist(x) > 0) {
        return 1;
      }
      return 0;
    }, function(x) {
      return Math.abs(sphere_dist(x));
    });

## `surface(volume[,lo,hi,solid_func])` ##

Extracts a triangulated mesh representing the level set encoded in volume.

Params:
* `volume`:  The `Volume` object to query against
* `lo`: (optional) lower bound on region to extract surface from.  Default unbounded
* `hi`: (optional) upper bound on region to extract surface from.  Default unbounded
* `solid_func`: (optional) A function that takes a phase as input and returns a flag determing whether to include the phase in the solid or not.  

Returns:
An object with two members representing an indexed triangulated mesh:
* `positions`: A list of vertex positions represented as 3D coordinate vectors
* `faces`: A list of triangles represnted by arrays of 3 integer indices into the `positions` array.
* `phases`: An array with the same length as `faces` that storing the material phase of each face.

## `apply(volume, stencil, func)` ##

Applies a stencil based function to the volume

Params:
* `volume`: An instance of `Volume`
* `stencil`: An array of 3D coordinates represnting stencil offsets
* `func`: A function taking array of values and returning a new field value

Returns:
* The effect of applying `func` pointwise to the volume with `stencil` arguments.

## `merge(volumes, r_func)` ##

Merges a collection of volumes together

Params:
* `volumes`: An array of volumes
* `r_func`: An R-function

Returns: The pointwise merge of all functions

## `testPoint(volume, point)` ##

Tests a point against the volume

Params:
* `volume`: A `Volume`
* `point`: A 3D array representing a point.

Returns: `true` or `false` if `point` is contained in `volume`.

## `testRay(volume, origin, direction, [max_t])` ##

Cast a ray against the volume

Params:
* `volume`: A `Volume`
* `origin`: The origin of the ray
* `direction`: The direction of the ray
* `max_t`: An optional limit on the distance to cast the ray

Returns:
A ray hit record object containing the following parameters:
* `hit`: A boolean flag determing whether or not the ray hit the volume.
* `t`: The t-value for the point the ray hit the volume.
* `x`: A 3D array giving the point the ray hit the surface.

## `lpStencil(p, radius)` ##

Creates a stencil in the shape of an L^p ball with the given radius.

Params:
* `p`: The power of the norm
* `radius`: The radius of the ball.

Returns:
An array of 3D integer indices in the shape of the specified neighborhood.

Example:
`lpStencil(1, radius)` gives a von Neumann stencil, while `lpStencil(Number.POSITIVE_INFINITY, radius)` gives the Moore neighborhood.  Taking `p = 2` gives a spherical stencil.

## `labelComponents(volume)` ##

Labels the connected components of volume.

Params:
* `volume`: A `Volume`

Returns:
An object with the following properties:
* `count`: A count of the number of connected components
* `labels`:  An array with length = `volume.runs.length` labelling the connected component of each run.

## `splitComponents(volume[, labelStruct])` ##

Splits a volume into separate connected components.

Params:
* `volume`: A `Volume`
* `labelStruct`: An optional structure which is the output of calling `labelComponents(volume)`

Returns:
An array of `Volume` objects, one for each separate connected component.
