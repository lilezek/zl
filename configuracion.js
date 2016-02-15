var modulo = function(zl) {
  "use strict";
  zl.configuracion = zl.configuracion || {};
  var zlc = zl.configuracion;
  zlc.fps = 10;
  zlc.precision = 0;

  return zl;
};

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
