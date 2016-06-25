var modulo = function(zl) {
  "use strict";

  zl.ejecutor = zl.ejecutor || {};

  function Ejecutor() {
    this.$evsync = {};
    this.$evasync = {};
  }

  Ejecutor.prototype.on = function (event, callback) {
    if (event in this.$evsync) {
      this.$evsync[event].push(callback);
    } else {
      this.$evsync[event] = [callback];
    }
  };

  Ejecutor.prototype.onA = function (event, callback) {
    if (event in this.$evasync) {
      this.$evasync[event].push(callback);
    } else {
      this.$evasync[event] = [callback];
    }
  };

  Ejecutor.prototype.ejecutar = function(js) {
    eval(js);
  };

  zl.ejecutor.newEjecutor = function() {
    return new Ejecutor();
  }

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
