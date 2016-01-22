var modulo = function(zl) {
  "use strict";
  zl.io = zl.io || {};

  zl.io.outWrite = function(msg) {
    console.log(msg);
  }

  zl.io.inRead = function(callback) {
    //TODO: Stub
  }

  zl.io.abortRead = function() {
    //TODO: Stub
  }

  zl.io.limpiar = function() {
    //TODO: Stub
  }

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
