exports.box = new Function("x",
  "return 1 - Math.max(Math.max(Math.abs(x[0]-10), Math.abs(x[1]-10)), Math.abs(x[2]-10));"
);

exports.sphere = new Function("x",
  "return Math.sqrt( Math.pow(x[0]-50, 2) + Math.pow(x[1]-50, 2) + Math.pow(x[2] - 50, 2) ) - 25;"
);
