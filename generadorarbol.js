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
      return {
        begin: posicion,
        end: posicion,
        error: zl.error.E_SIMBOLO
      };
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
    var intento = null;
    var masDeUnIntento = false;
    var error = true;
    var opcion = 0;
    var resultado;
    // Backtracking:
    for (var i = 0; i < this.opciones.length && error; i++) {
      resultado = {
        begin: posicion,
        end: posicion,
        tipo: this.nombre,
        opcion: i,
        resultado: []
      };


      var cadena = this.opciones[i];
      var r;
      for (var j = 0; j < cadena.length; j++) {

        // Comprobar si ya se intentó esta reducción:
        if (cadena[j].memo && cadena[j].memo[resultado.end]) {
          r = cadena[j].memo[resultado.end];
          r.reintento = true;
        } else {
          cadena[j].memo[resultado.end] = r = cadena[j].reducir(pajar, resultado.end);
        }
        resultado.end = r.end
        if (r.error) {
          break;
        } else {
          resultado.resultado.push(r.resultado);
        }
      }

      // Si compila, se aplican las comprobaciones sintácticas:
      if (!r.error) {
        var tmperr = this.error(resultado.resultado, i, posicion);
        if (!tmperr) {
          error = false;
          opcion = i;
        } else {
          // En caso de error sintáctico, no se apilará ningún error adicional.
          resultado.error = tmperr;
          return resultado;
        }
      } else {
        if (intento == null || intento.end < resultado.end) {
          intento = r;
          opcion = i;
          masDeUnIntento = false;
        } else if (intento.end == r.end && !r.reintento) {
          masDeUnIntento = true;
        }
      }

    }

    if (!error) {
      resultado.resultado = this.postproceso(resultado.resultado, opcion);
      return resultado;
    } else {
      if (!masDeUnIntento)
        resultado.intento = intento;
      resultado.opcion = opcion;
      resultado.end = intento.end;
      resultado.error = intento.error;
      return resultado;
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
