var zl = zl || {};
zl.error = zl.error || {};

(function() {
  "use strict";

  zl.error.obtenerLista = function(compilacion) {
    var lista = [];
    var i = 0;
    while (compilacion) {
      lista[i] = {};
      lista[i].begin = compilacion.begin;
      lista[i].end = compilacion.end;
      lista[i].tipo = compilacion.tipo;
      lista[i].error = compilacion.error;
      lista[i].reduccion = compilacion.resultado;
      compilacion = compilacion.intento;
      i++;
    }
    return lista;
  }

  zl.error.obtenerMensaje = function(compilacion) {
    var listaDeErrores = zl.error.obtenerLista(compilacion);
    // Análisis de errores

    // 1 Símbolo inesperado
    if (listaDeErrores[0].error == zl.error.E_SIMBOLO) {
      return JSON.stringify(listaDeErrores);
    }

    // 2 Palabra reservada
    if (listaDeErrores[0].error == zl.error.E_PALABRA_RESERVADA) {
      var palabra = listaDeErrores[listaDeErrores.length-1].reduccion[0];
      return "La palabra '"+palabra+"' está reservada y no se puede usar como nombre";
    }
  }

  // distintos errores:
  zl.error.E_SIMBOLO = 1;
  zl.error.E_PALABRA_RESERVADA = 2;
})();
