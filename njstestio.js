var modulo = function(zl) {
  "use strict";
  zl.io = zl.io || {};
  zl.test = zl.test || {};
  zl.test.lineas = [];

  zl.io.outWrite = function(msg) {
    console.log(msg);
    zl.test.lineas.push(msg);
  }

  zl.io.inRead = function(callback) {
    //TODO: Stub
  }

  zl.io.abortRead = function() {
    //TODO: Stub
  }

  zl.io.limpiar = function() {
    console.log("limpiando");
    zl.test.lineas = [];
  }

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
