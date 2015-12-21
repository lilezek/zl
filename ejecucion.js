var zl = zl || {};
zl.ejecucion = zl.ejecucion || {};

(function() {
  // Nota, no usar "use strict" para este pedazo de código.

  // El módulo interno contiene las funciones básicas del lenguaje.
  // Recibe un módulo y devuelve el mismo módulo con las transformaciones oportunas.
  var moduloInterno = function(mod) {
    // Tipos básicos:
    var numero = zl.entorno.newTipo(mod);
    var booleano = zl.entorno.newTipo(mod);
    var texto = zl.entorno.newTipo(mod);
    {
      zl.writeJson(numero, {
        nombre: "numero",
        opbinario: {
          '>': {
            'numero': 'booleano'
          },
          '+': {
            'numero': 'numero'
          }
        }
      });

      zl.writeJson(booleano, {
        nombre: "booleano"
      });

      zl.writeJson(texto, {
        nombre: "texto"
      });

      numero.serializar();
      booleano.serializar();
      texto.serializar();

      mod.registrar(numero);
      mod.registrar(booleano);
      mod.registrar(texto);
    }


    // Aleatorio:
    {
      var aleatorio = zl.entorno.newSubrutina(mod);
      var declresultado = zl.entorno.newDeclaracion(aleatorio);
      var declminimo = zl.entorno.newDeclaracion(aleatorio);
      var declmaximo = zl.entorno.newDeclaracion(aleatorio);

      zl.writeJson(declresultado, {
        nombre: "resultado",
        tipo: numero,
        modificadores: declresultado.M_SALIDA
      });

      zl.writeJson(declmaximo, {
        nombre: "maximo",
        tipo: numero,
        modificadores: declmaximo.M_ENTRADA
      });

      zl.writeJson(declminimo, {
        nombre: "minimo",
        tipo: numero,
        modificadores: declminimo.M_ENTRADA
      });

      zl.writeJson(aleatorio, {
        nombre: "aleatorio",
        modificadores: {
          es: true
        },
        declaraciones: {
          resultado: declresultado,
          minimo: declminimo,
          maximo: declmaximo
        }
      });
      aleatorio.serializar();
      mod.registrar(aleatorio);
    }

    // Mostrar:
    {
      var mostrar = zl.entorno.newSubrutina(mod);
      var declmensaje = zl.entorno.newDeclaracion(mostrar);

      zl.writeJson(declmensaje, {
        nombre: "mensaje",
        tipo: texto,
        modificadores: declresultado.M_ENTRADA
      });

      zl.writeJson(mostrar, {
        nombre: "mostrar",
        modificadores: {
          es: true
        },
        declaraciones: {
          mensaje: declmensaje
        }
      });
      mostrar.serializar();
      mod.registrar(mostrar);
    }

    // Mostrar numero:
    {
      var mostrarnumero = zl.entorno.newSubrutina(mod);
      var declmensaje = zl.entorno.newDeclaracion(mostrarnumero);

      zl.writeJson(declmensaje, {
        nombre: "mensaje",
        tipo: numero,
        modificadores: declresultado.M_ENTRADA
      });

      zl.writeJson(mostrarnumero, {
        nombre: "mostrarnumero",
        modificadores: {
          es: true
        },
        declaraciones: {
          mensaje: declmensaje
        }
      });
      mostrar.serializar();
      mod.registrar(mostrarnumero);
    }

    // leer Numero:
    {
      var leerNumero = zl.entorno.newSubrutina(mod);
      var declmensaje = zl.entorno.newDeclaracion(leerNumero);

      zl.writeJson(declmensaje, {
        nombre: "mensaje",
        tipo: numero,
        modificadores: declresultado.M_SALIDA
      });

      zl.writeJson(leerNumero, {
        nombre: "leernumero",
        modificadores: {
          es: true,
          asincrono: true
        },
        declaraciones: {
          mensaje: declmensaje
        }
      });
      leerNumero.serializar();
      mod.registrar(leerNumero);
    }

    // TODO: acabar el módulo
    mod.serializar();
    return mod;
  }


  zl.Ejecutar = function(javascript) {
    // Cargar el código:
    $zl_limpiar({}, function() {});
    eval(javascript);

    // Preparar la ejecución:
    var ejecucion = "";
    if (typeof $zl_inicio !== "undefined") {
      ejecucion += "$zl_inicio({},function() {";
    }
    if (typeof $zl_fotograma !== "undefined") {
      ejecucion += "var $zlinterval=setInterval(function cbck(){" +
        "clearInterval($zlinterval);" +
        "$zl_fotograma({},function(){$zlinterval = setInterval(cbck," + 1 / zl.configuracion.fps * 1000 + ")})" +
        "}," + 1 / zl.configuracion.fps * 1000 + ")";
    }
    if (typeof $zl_inicio !== "undefined") {
      ejecucion += "});";
    }

    // Y Ejecutar
    eval(ejecucion);
  }

  zl.ejecucion.moduloInterno = moduloInterno;
})();

// A parte del módulo, se preparar el runtime:

var $zl_tipos = {
  "numero": {
    constructor: function(v) {
      return {
        v: v || 0,
        tipo: "numero"
      }
    },
    '>' : {
      "numero": function (izq,der) {
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

// mensaje es Texto de Entrada
var $zl_mostrar = function(arg, callback) {
  outWrite(arg.mensaje + "\n");
  callback(null, {});
}

// mensaje es Texto de Entrada
var $zl_mostrarnumero = function(arg, callback) {
  outWrite(arg.mensaje + "\n");
  callback(null, {});
}


var $zl_mostrarnumero = function(arg, callback) {
  outWrite(arg.mensaje.toPrecision(7) + "\n");
  callback(null, {});
}

var $zl_leernumero = function(arg, callback) {
  inRead(function cbck(err, value) {
    var x = parseInt(value);
    if (isNaN(x))
      isRead(cbck);
    else
      callback(null, {
        mensaje: parseInt(value)
      });
  });
}

var $zl_leer = function(arg, callback) {
  $("#input").prop("disabled", false);
  inRead(function(err, value) {
    callback(null, {
      mensaje: value
    });
  });
}

var $zl_aleatorio = function(arg, callback) {
  callback(null, {
    resultado: Math.round((Math.random() * (arg.maximo - arg.minimo)) + arg.minimo)
  });
}

var $zl_limpiar = function(arg, callback) {
  $("#output").get(0).innerHTML = "";
  callback(null, {});
}
