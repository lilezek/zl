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
      lista[i].opcion = compilacion.opcion;
      lista[i].error = compilacion.error;
      lista[i].reduccion = compilacion.resultado;
      compilacion = compilacion.intento;
      i++;
    }
    return lista;
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

  zl.error.obtenerMensaje = function(compilacion, zlcodigo) {
    var listaDeErrores = zl.error.obtenerLista(compilacion);
    var siguienteCaracter = (zlcodigo.length > listaDeErrores[0].end ? zlcodigo[listaDeErrores[0].end] : "");
    // Análisis de errores

    // 1 Símbolo inesperado
    if (listaDeErrores[0].error == zl.error.E_SIMBOLO) {
      // Nada escrito:
      if (zlcodigo.trim() == "")
        return "Escribe algo de código a la izquierda para empezar."
      for (var i = listaDeErrores.length-1; i >= 0; i--) {
        // Falta un paréntesis:
        // Evaluación opción 6 
        if (listaDeErrores[i].tipo == "evaluacion" && listaDeErrores[i].opcion == 6) {
          var pos = zl.error.posicionCaracter(zlcodigo, listaDeErrores[i].begin);
          return "Hay un paréntesis '(' en la línea "+pos.linea+" que está sin cerrar";
        }
      }
      // Sobra paréntesis:
      if (siguienteCaracter == ")") {
        var pos = zl.error.posicionCaracter(zlcodigo, listaDeErrores[0].end);
        return "Hay un paréntesis ')' en la línea "+pos.linea+" que sobra";
      }
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
