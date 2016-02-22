var modulo = function(zl, async) {
  "use strict";

  // Dependencias en NodeJS
  if (!zl.io && typeof require !== "undefined") {
    require("./njsio")(zl);
  }

  // Async en NodeJS
  if (!async && typeof require !== "undefined") {
    async = require("async");
  }

  if (!async) {
    console.error("Se requiere async para la ejecución.");
    return zl;
  }

  zl.ejecucion = zl.ejecucion || {};

  var rte = {};
  if (typeof window !== "undefined")
    window.$zl_rte = rte;

  rte.$precision = function(arg) {
    return (zl.configuracion.precision > 0 ?
      arg.toPrecision(zl.configuracion.precision) :
      arg);
  }

  // mensaje es Texto de Entrada
  rte.mostrar = function(arg) {
    zl.io.outWrite(arg.mensaje + "\n");
  }

  rte.mostrarnumero = function(arg) {
    zl.io.outWrite(rte.$precision(arg.mensaje) + "\n");
  }

  rte.leernumero = function(arg, callback) {
    var oldabortar = this.$abortar;
    var self = this;
    this.$abortar = zl.io.abortRead;
    zl.io.inRead(function cbck(err, value) {
      var x = parseFloat(value);
      if (isNaN(x))
        zl.io.inRead(cbck);
      else {
        self.$abortar = oldabortar;
        callback(null, {
          mensaje: x
        });
      }
    });
  }

  rte.leer = function(arg, callback) {
    var oldabortar = this.$abortar;
    var self = this;
    this.$abortar = zl.io.abortRead;
    zl.io.inRead(function(err, value) {
      self.$abortar = oldabortar;
      callback(null, {
        mensaje: value
      });
    });
  }

  rte.aleatorio = function(arg) {
    return {
      resultado: Math.round((Math.random() * (arg.maximo - arg.minimo)) + arg.minimo)
    };
  }

  rte.limpiar = function(arg) {
    zl.io.limpiar();
  }

  rte.productoTexto = function(arg) {
    var texto =
      typeof arg.izq === "string" ? arg.izq : arg.der;

    var veces =
      typeof arg.izq === "number" ? arg.izq : arg.der;
    return (function ttimes(t, n) {
      // Hack: decimal a entero
      n = ~~n;
      if (n === 0)
        return "";
      var x = ttimes(t, n / 2);
      if (n % 2 === 0)
        return x + x;
      else
        return x + x + t;
    })(texto, veces);
  }

  rte.construirLista = function(dimensiones) {
    // TODO: Construir la lista usando el constructor del tipo, no ceros para rellenar.
    var r = {
      v: [],
      offsets: [],
      get: function construirLista$get() {
        var resultado = this.v;
        for (var i = 0; i < arguments.length; i++) {
          resultado = resultado[arguments[i] - this.offsets[i]];
          if (typeof resultado === "undefined" || resultado === null)
            throw zl.error.newError(zl.error.E_EJECUCION_INDICE_DESCONTROLADO, {
              array: this.v,
              indices: Array.prototype.slice(arguments)
            })
        }
        return resultado;
      },
      set: function construirLista$set(valor) {
        var resultado = this.v;
        var i;
        for (i = 1; i < arguments.length - 1; i++) {
          resultado = resultado[arguments[i] - this.offsets[i - 1]];
          if (typeof resultado === "undefined" || resultado === null)
            throw zl.error.newError(zl.error.E_EJECUCION_INDICE_DESCONTROLADO, {
              array: this.v,
              indices: Array.prototype.slice(arguments)
            })
        }
        if (typeof resultado[arguments[i] - this.offsets[i - 1]] === "undefined" || resultado[arguments[i] - this.offsets[i - 1]] === null)
          throw zl.error.newError(zl.error.E_EJECUCION_INDICE_DESCONTROLADO, {
            array: this.v,
            indices: Array.prototype.slice(arguments)
          });
        resultado[arguments[i] - this.offsets[i - 1]] = valor;
      }
    };

    r.v = (function _generarArray(dim, i) {
      if (i == dim.length) {
        return 0;
      } else {
        var resultado = [];
        r.offsets[i] = dim[i][0];
        for (var j = dim[i][0]; j <= dim[i][1]; j++) {
          resultado.push(_generarArray(dim, i + 1));
        }
        return resultado;
      }
    })(dimensiones, 0);
    return r;
  }

  rte.$ratonCanvas = function() {
    return zl.io.posicionRatonCanvas();
  }

  rte.$alAcabar = function() {

  }

  rte.$pausar = function($local, $global, $entrada, $salida, pos, callback) {
    var oldabortar = this.$abortar;
    var self = this;
    this.$abortar = function() {
      zl.io.abortPause();
    };
    zl.io.pause($local, $global, $entrada, $salida, pos, function() {
      self.$abortar = oldabortar;
      callback.apply(self, arguments);
    });
  }

  // Utilidades y hacks asíncronos
  rte.async = async;
  // Útil para generar una función que al llamarla
  // delegará en un this distinto.
  rte.$impersonar = function(func, thisObject) {
    return function() {
      func.apply(thisObject, arguments);
    }
  }


  rte.$tipos = {
    "numero": {
      constructor: function(v) {
        return v || 0;
      },
      '>': null
    },
    "booleano": {
      constructor: function(v) {
        return v || false;
      }
    }
  };

  rte.$asincrono = {};

  var requestAnimationFrame;
  if (typeof window !== "undefined") {
    requestAnimationFrame = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;
  }
  if (!requestAnimationFrame) {
    requestAnimationFrame = function(callback) {
      setTimeout(callback, 1 / zl.configuracion.fps * 1000);
    };
  }


  rte.$fotograma = true;
  rte.$animStart = null;
  rte.$siguienteFotograma = function(fotogramacbk) {
    var self = this;
    if (this.$fotograma) {
      requestAnimationFrame(function(timestamp) {
        if (!self.$animStart)
          self.$delta = 0
        else
          self.$delta = timestamp - self.$animStart;
        self.$animStart = timestamp;
        if (self.$asincrono.fotograma) {
          fotogramacbk({}, function() {
            self.$siguienteFotograma(fotogramacbk);
          });
        } else {
          fotogramacbk({});
          self.$siguienteFotograma(fotogramacbk);
        }
      });
    }
  }

  zl.eval = function(codigo) {
    eval(codigo);
  }

  zl.Cargar = function(javascript) {
    var carga = zl.writeJson({}, rte);
    // Cargar el código:
    rte.limpiar({});
    zl.eval.call(carga, javascript);
    return carga;
  }

  zl.Ejecutar = function(carga) {
    // Preparar la ejecución:
    var ejecucion = "\"use strict\";var $t = this;";

    if (typeof carga.inicio === "function") {
      ejecucion += "$t.inicio({}";
      // TODO: Distinguir si this.inicio es asíncrona o no.
      if (carga.$asincrono.inicio)
        ejecucion += ",function() {"
      else
        ejecucion += ");"
    }
    // TODO: Tener en cuenta el retardo de cálculo y restárselo al interval.
    if (typeof carga.fotograma === "function") {
      ejecucion += "$t.$abortar=function(){$t.$fotograma=false;};"
      ejecucion += "$t.$siguienteFotograma($t.fotograma);";
    } else if (typeof carga.inicio === "function") {
      ejecucion += "$t.$alAcabar(null);";
    }
    if (typeof carga.inicio === "function" && carga.$asincrono.inicio) {
      ejecucion += "});";
    }

    // Y Ejecutar
    zl.eval.call(carga, ejecucion);
  }

  zl.Abortar = function(carga) {
    // Romper las llamadas asíncronas:
    if (carga.$abortar)
      carga.$abortar();
    delete carga.$abortar;
  }
  return zl;
}

if (typeof module !== "undefined") {
  module.exports = modulo;
} else {
  this.zl = modulo(this.zl || {}, async);
}
