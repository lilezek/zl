var zl = zl || {};
zl.error = zl.error || {};

(function() {
  "use strict";

  function Error(tipo, traza) {
    this.tipo = tipo;
    this.traza = traza;
    return this;
  }

  zl.error.posicionCaracter = function(texto, posicion) {
    var resultado = {linea: 1, columna: 1};
    for (var i = 0; i < posicion; i++) {
      resultado.columna += 1;
      if (texto[i] == "\n") {
        resultado.linea += 1;
        resultado.columna = 0;
      }
    }
    return resultado;
  }

  zl.error.obtenerMensaje = function(error, zlcodigo) {
    return JSON.stringify(error);
  }

  // distintos errores:
  zl.error.E_SIMBOLO = 1;
  zl.error.E_PALABRA_RESERVADA = 2;
  zl.error.E_NOMBRE_SUBRUTINA_YA_USADO = 3;
  zl.error.E_NOMBRE_DATO_YA_USADO = 4;
  zl.error.E_MODIFICADOR_REPETIDO = 5;
  zl.error.E_USO_INDEBIDO_MODIFICADOR_GLOBAL = 6;

  zl.error.newError = function(a,b) {
    return new Error(a,b);
  }

  zl.error.esError = function(err) {
     return err && err.constructor && err.constructor.name === "Error";
  }
})();
