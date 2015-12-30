var zl = zl || {};
zl.ejecucion = zl.ejecucion || {};

(function() {
  "use strict";

  var rte = window.$zl_rte = {};

  // mensaje es Texto de Entrada
  rte.mostrar = function(arg) {
    outWrite(arg.mensaje + "\n");
  }

  rte.mostrarnumero = function(arg) {
    outWrite(arg.mensaje.toPrecision(7) + "\n");
  }

  rte.leernumero = function(arg, callback) {
    rte.$ultimorte.$abortar = abortRead;
    inRead(function cbck(err, value) {
      var x = parseFloat(value);
      if (isNaN(x))
        inRead(cbck);
      else
        callback(null, {
          mensaje: x
        });
    });
  }

  rte.leer = function(arg, callback) {
    rte.$ultimorte.$abortar = abortRead;
    inRead(function(err, value) {
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
    $("#output").get(0).innerHTML = "";
  }

  rte.$alAcabar = function() {

  }

  rte.$tipos = {
    "numero": {
      constructor: function(v) {
        return {
          v: v || 0,
          tipo: "numero"
        }
      },
      '>': {
        "numero": function(izq, der) {
          return $zl_tipos["booleano"].constructor(izq.v > der.v);
        }
      }
    },
    "booleano": {
      constructor: function(v) {
        return {
          v: v || false,
          tipo: "booleano"
        }
      }
    }
  };

  zl.eval = function(codigo) {
    eval(codigo);
  }

  zl.Cargar = function(javascript) {
    var carga = rte.$ultimorte = zl.writeJson({}, rte);
    // Cargar el código:
    rte.limpiar({});
    zl.eval.call(carga, javascript);
    return carga;
  }

  zl.Ejecutar = function(carga) {
    // Preparar la ejecución:
    var ejecucion = "var $t = this;";

    // TODO: Distinguir si this.inicio es asíncrona o no.
    if (typeof carga.inicio === "function") {
      ejecucion += "$t.inicio({},function() {";
    }
    // TODO: Tener en cuenta el retardo de cálculo y restárselo al interval.
    if (typeof carga.fotograma === "function") {
      ejecucion += "$t.$interval=setInterval(function cbck(){" +
        "clearInterval($t.$interval);" +
        "$t.fotograma({},function(){$t.$interval = setInterval(cbck," + 1 / zl.configuracion.fps * 1000 + ")})" +
        "}," + 1 / zl.configuracion.fps * 1000 + ");";
    } else {
      ejecucion += "$t.$alAcabar();";
    }
    if (typeof carga.inicio === "function") {
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
    // Romper la ejecución de los fotogramas:
    clearInterval(carga.$interval);
  }

})();
