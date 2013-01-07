exports.box = new Function("x",
  "return Math.min(Math.min(Math.abs(x[0]-50), Math.abs(x[1]-50)), Math.abs(x[2]-50)) - 30;"
);

exports.sphere = new Function("x",
  "return Math.sqrt( Math.pow(x[0]-50, 2) + Math.pow(x[1]-50, 2) + Math.pow(x[2] - 50, 2) ) - 25;"
);
