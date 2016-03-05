var modulo = function(zl, async) {
  "use strict";

  // Dependencias en NodeJS
  if (!zl.io && typeof require !== "undefined") {
    require("./njsio")(zl);
  }


  if (!async) {
    console.error("Se requiere async para la ejecución.");
    return zl;
  }

  zl.ejecucion = zl.ejecucion || {};

  var rte = {};
  // Dependencias Web
  if (typeof window !== "undefined") {
    window.$zl_rte = rte;
  }

  rte.$precision = function(arg) {
    return (this.$configuracion.precision > 0 ?
      arg.toPrecision(this.$configuracion.precision) :
      arg);
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

  rte.$alError = function(e) {
    this.$continuar = false;
    throw e;
  }

  rte.$pausar = function($local, $global, $entrada, $salida, pos, callback) {
    if (this.$continuar) {
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


  rte.$error = zl.error;
  rte.$colores = zl.tablaColores;

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

  rte.$continuar = true;
  rte.$animStart = null;
  rte.$siguienteFotograma = function(fotogramacbk, main) {
    var self = this;
    if (this.$continuar) {
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

  rte.$writeJson = zl.writeJson;

  zl.eval = function(codigo) {
    eval(codigo);
  }

  zl.Cargar = function(javascript) {
    var carga = zl.writeJson({}, rte);
    carga.$io = zl.io;
    carga.$asincrono = {};
    carga.$configuracion = {};
    if (typeof document !== "undefined") {
      carga.$canvas = document.getElementById("canvas");
      carga.$ctx2d = carga.$canvas.getContext("2d");
      carga.$ctx2d.font = "normal 14pt arial";
    }
    // Cargar el código:
    zl.io.limpiar();
    zl.eval.call(carga, javascript);
    return carga;
  }

  zl.Ejecutar = function(carga) {
    // Preparar la ejecución:
    var ejecucion = '"use strict";\nvar main = new this.$principal(this);\nvar self = this;\nfunction iniciarFotograma() {\n  if (main.fotograma) {\n    self.$abortar = function() {\n      self.$continuar = false;\n    }\n    self.$siguienteFotograma(self.$impersonar(main.fotograma,main));\n  } else {\n    self.$alAcabar(null);\n  }\n}\nif (main.inicio) {\n  if (self.$asincrono.inicio) {\n    main.inicio({}, function() {\n      iniciarFotograma();\n    });\n  } else {\n    main.inicio({});\n    iniciarFotograma();\n  }\n}else self.$alAcabar();';

    // Y Ejecutar
    try {
      zl.eval.call(carga, ejecucion);
    } catch (e) {
      carga.$alError(e);
    }
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
  // TODO: Ejecución ahora depende de error.
  module.exports = modulo;
} else {
  this.zl = modulo(this.zl || {}, async);
}
