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

  var rte = zl.ejecucion.rte = {};
  // Dependencias Web
  if (typeof window !== "undefined") {
    window.$zl_rte = rte;

    // TODO: Completar esta tabla
    var table = {
      "8": "BORRAR",
      "31": "",
      "32": "ESPACIO",
      "33": "!",
      "34": "\"",
      "35": "#",
      "36": "$",
      "37": "IZQUIERDA",
      "38": "ARRIBA",
      "39": "DERECHA",
      "40": "ABAJO",
      "41": ")",
      "42": "*",
      "43": "+",
      "45": "-",
      "47": "/",
      "48": "0",
      "49": "1",
      "50": "2",
      "51": "3",
      "52": "4",
      "53": "5",
      "54": "6",
      "55": "7",
      "56": "8",
      "57": "9",
      "58": ":",
      "59": ";",
      "60": "<",
      "61": "=",
      "62": ">",
      "63": "?",
      "64": "@",
      "65": "A",
      "66": "B",
      "67": "C",
      "68": "D",
      "69": "E",
      "70": "F",
      "71": "G",
      "72": "H",
      "73": "I",
      "74": "J",
      "75": "K",
      "76": "L",
      "77": "M",
      "78": "N",
      "79": "O",
      "80": "P",
      "81": "Q",
      "82": "R",
      "83": "S",
      "84": "T",
      "85": "U",
      "86": "V",
      "87": "W",
      "88": "X",
      "89": "Y",
      "90": "Z",
      "91": "[",
      "92": "\\",
      "93": "]",
      "94": "^",
      "95": "_",
      "96": "`",
      "123": "{",
      "124": "|",
      "125": "}",
      "126": "~",
      "127": "",
      "188": ",",
      "190": "."
    }

    var pulsadas = {};

    $(document).on("keydown", function(e) {
      pulsadas[table[e.which] || e.which] = true;
    }).on("keyup", function(e) {
      pulsadas[table[e.which] || e.which] = false;
    });


    rte.$teclas = function() {
      return pulsadas;
    }
  }

  rte.$precision = function(arg) {
    return (this.$configuracion.precision > 0 ?
      arg.toPrecision(this.$configuracion.precision) :
      arg);
  }

  rte.$accesoGet = function() {
    var resultado = this.v;
    for (var i = 0; i < arguments.length; i++) {
      resultado = resultado[arguments[i]];
      if (typeof resultado === "undefined" || resultado === null)
        throw zl.error.newError(zl.error.E_EJECUCION_INDICE_DESCONTROLADO, {
          array: this.v,
          indices: Array.prototype.slice(arguments)
        })
    }
    return resultado;
  }

  rte.$accesoSet = function() {
    var resultado = this.v;
    var i;
    for (i = 1; i < arguments.length - 1; i++) {
      resultado = resultado[arguments[i]];
      if (typeof resultado === "undefined" || resultado === null)
        throw zl.error.newError(zl.error.E_EJECUCION_INDICE_DESCONTROLADO, {
          array: this.v,
          indices: Array.prototype.slice(arguments)
        })
    }
    if (typeof resultado[arguments[i]] === "undefined" || resultado[arguments[i]] === null)
      throw zl.error.newError(zl.error.E_EJECUCION_INDICE_DESCONTROLADO, {
        array: this.v,
        indices: Array.prototype.slice(arguments)
      });
    resultado[arguments[i]] = valor;
  }

  rte.$generarArray = function(dim, i, defaultConstructor) {
    if (i == dim.length) {
      return defaultConstructor();
    } else {
      var resultado = [];
      for (var j = 0; j <= dim[i]; j++) {
        resultado.push(rte.$generarArray(dim, i + 1, defaultConstructor));
      }
      return resultado;
    }
  }

  rte.$listaCompatible = function(otraLista) {
    var a = this.v;
    var b = otra.v;

    function arraySameSizeRecursive(a, b) {
      var result = a.length === b.length;
      for (var i = 0; i < a.length && result; i++) {
        result = arraySameSizeRecursive(a[i], b[i]);
      }
      return result;
    }
  }

  rte.construirListaVacia = function(dimensiones) {
    var lista = {
      v: []
    }; // TODO: Cambiar el constructor por defecto
    lista.v = rte.$generarArray(dimensiones, 0, function() {
      return 0;
    });
    return lista;
  }

  rte.construirLista = function(valores) {
    var lista = {
      v: []
    };
    lista.v = valores;
    for (var i = 0; i < lista.v.length; i++) {
      if (lista.v[i].constructor && lista.v[i].constructor.name === "zlLista") {
        lista.v[i] = lista.v[i].v;
      }
    }
    return lista;
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
        // Con esto evitamos que se den saltos en el tiempo con el pausar
        self.$animStart = null;
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
