//Performs a k-way merge on a collection of volumes
function merge(volumes, merge_func) {
  var merged_runs = []
    , values      = new Array(volumes.length);
  for(var iter = createMultiStencil(volumes, CROSS_STENCIL); iter.hasNext(); iter.next()) {
  
    for(var i=0; i<values.length; ++i) {
      values[i] = volumes[i].runs[iter.ptrs[i][0]].value;
    }
    var rho   = merge_func(values)
      , sign  = rho < 0;
    for(var i=1; i<6; ++i) {
      for(var j=0; j<values.length; ++j) {
        values[j] = volumes[j].runs[iter.ptrs[j][i]].value;
      }
      var f = merge_func(values[i]);
      if(sign !== (f<0)) {
        merged_runs.push(new Run(iter.coord.slice(0), rho));
        break;
      }
    }
  }
  return new BinaryVolume(merged_runs);
}

//k-way tree merging
exports.merge         = merge;
