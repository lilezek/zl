var zl = zl || {};
zl.error = zl.error || {};

(function() {
  "use strict";

  zl.error.obtenerMensaje = function(compilacion) {
    return JSON.stringify(compilacion);
  }

  // distintos errores:
  zl.error.E_SIMBOLO = 1;
  zl.error.E_PALABRA_RESERVADA = 2;
})();
