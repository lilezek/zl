var zl = zl || {};

(function() {
  // Nota, no usar "use strict" para este pedazo de código;
  // Preparar el runtime:
  var $zl_mostrar = function(arg, callback) {
    outWrite(arg.mensaje + "\n");
    callback(null,{});
  }

  var $zl_mostrarnumero = function(arg, callback) {
    outWrite(arg.mensaje.toPrecision(7) + "\n");
    callback(null,{});
  }

  var $zl_leernumero = function(arg, callback) {
    inRead(function cbck(err, value) {
      var x = parseInt(value);
      if (isNaN(x))
        isRead(cbck);
      else
        callback(null, {mensaje: parseInt(value)});
    });
  }
  var $zl_leer = function(arg, callback) {
    $("#input").prop("disabled",false);
    inRead(function(err, value) {
      callback(null, {mensaje: value});
    });
  }

  var $zl_aleatorio = function(arg, callback) {
    callback(null,{
      resultado: Math.round((Math.random() * (arg.maximo - arg.minimo)) + arg.minimo)
    });
  }

  var $zl_limpiar = function(arg, callback) {
    $("#output").get(0).innerHTML = "";
    callback(null,{});
  }

  zl.Ejecutar = function(javascript) {
    // Cargar el código:
    $zl_limpiar({}, function(){});
    eval(javascript);

    // Preparar la ejecución:
    var ejecucion = "";
    if (typeof $zl_inicio !== "undefined") {
      ejecucion += "$zl_inicio({},function() {";
    }
    if (typeof $zl_fotograma !== "undefined") {
      ejecucion += "var $zlinterval=setInterval(function cbck(){"+
        "clearInterval($zlinterval);"+
        "$zl_fotograma({},function(){$zlinterval = setInterval(cbck,"+1/zl.configuracion.fps*1000+")})"+
      "},"+1/zl.configuracion.fps*1000+")";
    }
    if (typeof $zl_inicio !== "undefined") {
      ejecucion += "});";
    }

    // Y Ejecutar
    eval(ejecucion);
  }
})();
