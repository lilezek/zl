var zl = zl || {};
zl.analizador = {};

(function() {
  "use strict";

  function Simbolo(regex, nombre) {
    this.regex = regex;
    this.nombre = nombre;
    this.memo = {};
    return this;
  }

  Simbolo.prototype.reducir = function(pajar, posicion) {
    var aguja = pajar.substring(posicion).match(this.regex);
    if (aguja) {
      return {
        begin: posicion,
        end: posicion + aguja[0].length,
        resultado: aguja[0]
      };
    } else {
      throw zl.error.newError(zl.error.E_SIMBOLO, {
        begin: posicion,
        end: posicion,
        arbol: this.nombre
      });
    }
  }

  function Expresion(opciones, nombre) {
    this.opciones = opciones;
    this.nombre = nombre;
    this.memo = {};

    this.postproceso = function(datos, opcion) {
      return datos;
    }

    this.error = function(datos, opcion, posicion) {
      return false;
    }
    return this;
  }

  Expresion.prototype.reducir = function(pajar, posicion) {
    var posicion = posicion || 0;
    var opcion = 0;
    var resultado = {
        begin: posicion,
        end: posicion,
        tipo: this.nombre,
        opcion: 0,
        resultado: []
      };
    var error = null;
    // Backtracking:
    for (var i = 0; i < this.opciones.length; i++) {
      var cadena = this.opciones[i];
      var reduccion; 
      resultado.opcion = i;
      try {
        for (var j = 0; j < cadena.length; j++) {
          // Comprobar si ya se intentó esta reducción:
          if (cadena[j].memo && cadena[j].memo[resultado.end]) {
            reduccion = cadena[j].memo[resultado.end];
            reduccion.reintento = true;
          } else {
            cadena[j].memo[resultado.end] = reduccion = cadena[j].reducir(pajar, resultado.end);
          }
          // Añadir la reduccion
          resultado.resultado.push(reduccion.resultado);
        }

      } catch(err) {
        if (err && err.constructor && err.constructor.name === "Error") {
          if (!error) {
            error = err;
            var errarb = error.traza.arbol;
            error.traza.arbol = {
              begin: posicion,
              end: errarb.end,
              opciones: {},
              tipo: this.nombre
            };
            error.traza.arbol.opciones[i] = errarb;
          } else {
            error.traza.arbol.opciones[i] = error.traza.arbol;
          }
          // Siguiente opcion
          continue;
        } else {
          throw err;
        }
      } 

      var tmperr = this.error(resultado.resultado, i, posicion);
      resultado.end = reduccion.end;
      if (!tmperr) {
          error = null;
          opcion = i;
      } else {
        // En caso de error sintáctico, no se intentará ninguna otra opción.
        throw zl.error.newError(tmperr, resultado);
      }
    }

    if (!error) {
      resultado.resultado = this.postproceso(resultado.resultado, opcion);
      return resultado;
    } else {
      throw error;
    }
  }

  zl.analizador.newSimbolo = function(regex, nombre) {
    return new Simbolo(regex, nombre);
  }

  zl.analizador.newExpresion = function(opciones, nombre) {
    return new Expresion(opciones, nombre);
  }

  zl.analizador.newArbol = function(hijos, padre) {
    return new Arbol(hijos, padre);
  }

  zl.analizador.prepararReglas = function(reglas) {
    for (var k in reglas) {
      var r = reglas[k];
      for (var i = 0; i < r.opciones.length; i++) {
        for (var j = 0; j < r.opciones[i].length; j++) {
          if (typeof r.opciones[i][j] === "string") {
            if (!(r.opciones[i][j] in reglas)) {
              console.error("La regla " + r.opciones[i][j] + " no está definida, usada en " + r.nombre);
            }
            r.opciones[i][j] = reglas[r.opciones[i][j]];
          } else if (r.opciones[i][j] == undefined) {
            console.error("La regla " + r.nombre + " contiene un undefined");
          }
        }
      }
    }
  }

  zl.analizador.limpiarCache = function(reglas) {
    for (var k in reglas) {
      var r = reglas[k];
      for (var i = 0; i < r.opciones.length; i++) {
        for (var j = 0; j < r.opciones[i].length; j++) {
          r.opciones[i][j].memo = {};
        }
      }
    }
  }
})();
