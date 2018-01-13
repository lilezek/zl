var modulo = function(zl) {
  "use strict";

  zl.javascript = zl.javascript || {};
  // Función auxiliar
  // Genera nombres temporales para que no se repitan
  var temporal = 0;

  function pedirNombreTemporal() {
    return temporal++;
  }

  /**
   *
   * Este trozo de código asegura que el script es auto ejecutable (dentro de lo posible).
   *
   */

  var autoejecutableSnippet = `var delta = 0;
var lt = 0;
var frame;

function __webRunAt60hz(callback) {
  if (window && window.requestAnimationFrame && window.performance && window.performance.now) {
      var nt = window.performance.now();
      delta = nt - lt;
      if (!lt) {
        delta = 0;
      }
      lt = nt;
      window.requestAnimationFrame(callback);
      return true;
  }
  return false;
}

var interval;

function __runAt60hz(callback) {
  if (interval)
    clearInterval(interval);
  if (!__webRunAt60hz(callback)) {
    __runAtnthHz(60, callback);
  }
}

var running;
var __continue = true;

function __runAtnthHz(freq, callback) {
  if (interval)
    clearInterval(interval);
  interval = setTimeout(function() {
    var nt = new Date().getTime();
    delta = nt - lt;
    if (!lt) {
      delta = 0;
    }
    lt = nt;
    callback();
  }, 1. / freq);
}

var framing;
async function __frameA(prepareNextFrame, frame) {
  if (!__continue)
    return;
  if (!$exterior.$evento('prefotograma', {}))
    prepareNextFrame(__frameA.bind(this, prepareNextFrame, frame));
  if (framing)
    return;
  framing = true;
  await frame({})
  framing = false;
}

function __frame(prepareNextFrame, frame) {
  if (!__continue)
    return;
  if (!$exterior.$evento('prefotograma', {}))
    prepareNextFrame(__frame.bind(this, prepareNextFrame, frame));
  if (framing)
    return;
  framing = true;
  frame({})
  framing = false;
}

async function __afterInicio(proto) {
  $exterior.$evento('postinicio', null);
  if (proto.fotograma) {
    // TODO: usar la frecuencia
    if (proto.$async.fotograma) {
      __frameA(__runAt60hz, proto.fotograma.bind(proto));
    } else {
      __frame(__runAt60hz, proto.fotograma.bind(proto));
    }
  } else {
    $exterior.$evento('fin', {});
  }
}

function __emitEvent(event, obj) {
  var ret = null;
  if (event in $exterior.$evsync) {
    for (var i = $exterior.$evsync[event].length-1; i >= 0 && !ret; i--) {
      ret = $exterior.$evsync[event][i](obj);
    }
  }
  return ret;
}

function __asyncNextCallbackIfNotResult(error, result, eventarray, obj, callback) {
  if (error || result || eventarray.length <= 0) {
    callback(error, result);
  } else {
    var nextArray = eventarray.slice(0, eventarray.length - 1);
    eventarray[eventarray.length - 1].call(this, obj, function(err, val) {
      __asyncNextCallbackIfNotResult(err, val, nextArray, obj, callback);
    });
  }
}

function __emitAsyncEvent(event, obj, callback) {
  if (!__continue)
    return;
  if (event in $exterior.$evasync && $exterior.$evasync[event].length > 0) {
    __asyncNextCallbackIfNotResult(null, null, $exterior.$evasync[event], obj, callback);
  } else {
    callback(null, null);
  }
}

function __writeJson(obj, json) {
  for (var k in json) {
    obj[k] = json[k];
  }
  return obj;
}

function __precision(n) {
  // TODO: terminar
  return '' + n;
}

async function __exec() {
  // Preinicio:
  for (var k in $exterior) {
    if (k.indexOf('Prototipo') > -1 && k.indexOf('Prototipo') == (k.length - 9)) {
      if ($exterior[k].preinicio) {
        $exterior[k].preinicio($exterior[k]);
      }
    }
  }
  if ($exterior.$principal) {
    var proto = $exterior.$principal($exterior);

    $exterior.$evento('postinicio', null);

    // Inicio sincrono:
    if (proto.inicio && !('inicio' in proto.$async)) {
      proto.inicio({});
    } else if (proto.inicio) {
      await proto.inicio({});
    }
    await __afterInicio(proto);    
  }
}

function __export() {
  module.exports = $exterior;
}

$exterior.$error = function(error) {
  // TODO: Introducir un error en tiempo de ejecución.
  if (!__emitEvent('abortar', error))
    __continue = false;
}

$exterior.$precision = $exterior.$precision || function __precision(arg) {
  return (this.$configuracion.precision > 0 ?
    arg.toPrecision(this.$configuracion.precision) :
    arg);
}

$exterior.$evsync = $exterior.$evsync || {};

$exterior.$evasync = $exterior.$evasync || {};

$exterior.$evento = function(event, obj) {
  return __emitEvent(event, obj);
}

$exterior.$eventoasincrono = async function(event, obj) {
  return new Promise((res, rej) => {
    __emitAsyncEvent(event, obj, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  })
}

$exterior.$evsync.on = $exterior.$evsync.on || function(event, callback) {
  if (event in this) {
    this[event].push(callback);
  } else {
    this[event] = [callback];
  }
}

$exterior.$evasync.on = $exterior.$evasync.on || $exterior.$evsync.on;


$exterior.$evsync.on('delta', function(arg) {
  return delta;
});


if (typeof module !== 'undefined' && module.exports && require) {
  if (require.main === module) {
    const readline = require('readline');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    $exterior.$evasync.on('leer',function(obj, callback) {
      rl.question('> ', function(v) {
        callback(null, v);
      });
    });

    $exterior.$evsync.on('escribir',function(obj) {
      process.stdout.write(obj);
    });

    $exterior.$evsync.on('fin',function(obj) {
      rl.close();
    });

    __exec();
  } else {
    __export();
  }
} else {
  __exec();
}`

  zl.javascript.constructor = function(compilado, simbolo) {
    var resultado = "this." + simbolo.nombre + "=function " + simbolo.nombre + "($in){\"use strict\";";
    var integraciones = simbolo.arrayDeIntegraciones();
    for (var i = 0; i < integraciones.length; i++) {
      // Ignorar la integración con $internal
      var nombre = integraciones[i].configuracion.nombremodulo;
      if (nombre !== '$internal')
        resultado += "$in." + nombre + ".call(this, $in);"
    }
    resultado += "this.$miembros={";
    var coma = "";
    for (var k in simbolo.globales) {
      var d = simbolo.globales[k];
      if (d.tipoInstancia.tipo.constr) {
        resultado += coma + d.nombre + ":new $exterior." + d.tipoInstancia.tipo.constr + "(";
        resultado += "$exterior";
        resultado += ")";
      } else {
        resultado += coma + d.nombre + ":null";
      }
      coma = ",";
    }
    resultado += "};" +
      "__writeJson(this, $in." + simbolo.nombre + "Prototipo);" +
      "return this;};";
    return resultado;
  }

  // Generar el final
  zl.javascript.objeto = function(compilado, simbolo) {
    var resultado = "var $exterior = this;this." + simbolo.nombre + "Prototipo = {" +
      zl.javascript.subrutinas(compilado.subrutinas, simbolo) +
      ',$async: {' +
        simbolo.arrayDeSubrutinas().filter(function(v){
          return 'asincrona' in v.modificadores;
        }).map(function(v) {
          return v.nombre + ': true';
        }).join(',')+
        '}'+
        ",$configuracion : " + JSON.stringify(simbolo.configuracion) +
      "};";
    return resultado;
  }

  zl.javascript.modulo = function(compilado, simbolo) {
    temporal = 0;
    return zl.javascript.objeto(compilado, simbolo) +
      zl.javascript.constructor(compilado, simbolo) + '\n' +
      (simbolo.nombre === "$principal" ? autoejecutableSnippet : '');
  }

  zl.javascript.subrutinas = function(compilado, simbolo) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += zl.javascript.subrutina(compilado[i], simbolo.subrutinaPorNombre(compilado[i].nombre)) +
        (compilado.length === i + 1 ? "" : ",");
    }
    return resultado;
  }

  zl.javascript.subrutina = function(compilado, simbolo) {
    //TODO: tratar los modificadores y los datos correctamente
    var resultado = "";
    if (simbolo.modificadores.interna)
      resultado += "$";

    var sentencias = "";
    if (simbolo.modificadores.primitiva) {
      sentencias = simbolo.segmentoPrimitivo;
    } else {
      sentencias = zl.javascript.sentencias(compilado.sentencias, simbolo);
    }

    if (simbolo.modificadores.asincrona) {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + ": async function($entrada){var $self = this;var $salida={};var $res={};var $local={};" +
        zl.javascript.datos(compilado.datos, simbolo.declaraciones) +
        sentencias +
        "return $salida;";
    } else {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + ": function($entrada){var $self = this;var $res={};var $salida={};var $local={};" +
        zl.javascript.datos(compilado.datos, simbolo.declaraciones) +
        sentencias +
        "return $salida;";
    }
    var coma = "";
    for (var k in simbolo.datos) {
      var dato = simbolo.datos[k];
      if (dato.modificadores & dato.M_SALIDA) {
        resultado += dato.nombre + ":" + zl.javascript.nombre(dato.nombre) + coma;
      }
      coma = ",";
    }

    resultado += "}";
    return resultado;
  }

  zl.javascript.datos = function(compilado, simbolo) {
    //TODO: tratar los modificadores y los datos correctamente
    var resultado = "";
    for (var k in simbolo) {
      var dato = simbolo[k];
      // Si es global, ignorar:
      if (dato.modificadores != dato.M_GLOBAL)
        resultado += zl.javascript.dato(dato, simbolo) + ";";
    }
    return resultado;
  }

  zl.javascript.sentencias = function(compilado, simbolo) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += zl.javascript.sentencia(compilado[i], simbolo);
    }
    return resultado;
  }

  zl.javascript.sentencia = function(compilado, simbolo) {
    var resultado = "";
    if (compilado.tipo == "asignacion") {
      var dato = simbolo.declaraciones[compilado.variable.dato.toLowerCase()];
      var lvalor = zl.javascript.lvalorAsignacion(compilado.variable, simbolo).replace("$prefijo$", zl.javascript.datoprefijo(dato, simbolo));
      if (lvalor.indexOf("(&)") > -1) {
        resultado = lvalor.replace("(&)", zl.javascript.expresion(compilado.valor, simbolo));
      } else {
        resultado = lvalor + "=" + zl.javascript.expresion(compilado.valor, simbolo);
      }
    } else if (compilado.tipo == "llamada") {
      resultado = zl.javascript.llamada(compilado, simbolo);
    } else if (compilado.tipo == "mientras") {
      resultado = zl.javascript.mientras(compilado, simbolo);
    } else if (compilado.tipo == "repetir") {
      resultado = zl.javascript.repetir(compilado, simbolo);
    } else if (compilado.tipo == "sicondicional") {
      resultado = zl.javascript.sicondicional(compilado, simbolo);
    } else if (compilado.tipo == "pausar") {
      resultado = "await $exterior.$eventoasincrono('pausar', [$local, $self.$miembros, $entrada, $salida," +
        ~~((compilado.begin + compilado.end) / 2) +
        "]);";
    }
    return resultado + ";";
  }

  zl.javascript.lvalorAsignacion = function(compilado, simbolo) {
    var resultado = "$prefijo$" + compilado.dato.toLowerCase();
    var tipoActual = simbolo.declaraciones[compilado.dato.toLowerCase()].tipoInstancia;
    var modulo = simbolo.padre;
    for (var i = 0; i < compilado.accesos.length - 1; i++) {
      var acceso = compilado.accesos[i];
      var der = zl.javascript.expresion(acceso, simbolo);
      resultado = (acceso.localizacion ? "$exterior." + acceso.localizacion.nombre + "Prototipo." : "") + acceso.alias + "({izquierda:" + resultado + ",derecha:" + der + "}).resultado"
    }
    if (compilado.accesos.length) {
      var acceso = compilado.accesos[compilado.accesos.length - 1];
      var der = zl.javascript.expresion(acceso, simbolo);
      resultado = (acceso.localizacion ? "$exterior." + acceso.localizacion.nombre + "Prototipo." : "") + acceso.alias + "({izquierda:" + resultado + ",derecha:" + der + ", resultado: (&)})"
    }
    return resultado;
  }

  zl.javascript.lvalor = function(compilado, simbolo) {
    var resultado = "$prefijo$" + compilado.dato.toLowerCase();
    var tipoActual = simbolo.declaraciones[compilado.dato].tipoInstancia;
    var modulo = simbolo.padre;
    for (var i = 0; i < compilado.accesos.length; i++) {
      var acceso = compilado.accesos[i];
      var der = zl.javascript.expresion(acceso, simbolo);
      resultado = (acceso.localizacion ? "$exterior." + acceso.localizacion.nombre + "Prototipo." : "") + acceso.alias + "({izquierda:" + resultado + ",derecha:" + der + "}).resultado"
    }
    return resultado;
  }

  zl.javascript.llamada = function(compilado, simbolo) {
    var nombre = compilado.nombre.toLowerCase();
    var sub = simbolo.padre.subrutinaPorNombre(nombre);
    // La subrutina puede encontrarse en otro módulo
    var contexto = (compilado.contexto ? zl.javascript.lvalor(compilado.contexto, simbolo) : null)
    if (!contexto)
      nombre = "$self." + nombre;
    else {
      var dato = simbolo.declaraciones[compilado.contexto.dato];
      contexto = contexto.replace("$prefijo$", zl.javascript.datoprefijo(dato, simbolo));
      sub = dato.tipoInstancia.tipo.modulo.subrutinaPorNombre(nombre);
      nombre = contexto + "." + nombre
    }
    if (compilado.asincrono)
      return "$res=await " + nombre + "(" +
        zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
    else
      return "$res=" + nombre + "(" +
        zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
  }

  zl.javascript.mientras = function(compilado, simbolo) {
    var tempcallback = "$zlt_" + pedirNombreTemporal();
    return "while(" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
      zl.javascript.sentencias(compilado.sentencias, simbolo) +
      "}";
  }

  zl.javascript.sicondicional = function(compilado, simbolo) {
    var siguiente = compilado.siguiente;
    var resultado = "";
    resultado = "if(" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
      zl.javascript.sentencias(compilado.sentencias, simbolo) +
      "}";
    while (siguiente) {
      if (siguiente.condicion)
        resultado += "else if(" + zl.javascript.expresion(siguiente.condicion, simbolo) + "){" +
        zl.javascript.sentencias(siguiente.sentencias, simbolo) +
        "}";
      else
        resultado += "else{" +
        zl.javascript.sentencias(siguiente.sentencias, simbolo) +
        "}";
      siguiente = siguiente.siguiente;
    }
    return resultado;
  }

  zl.javascript.repetir = function(compilado, simbolo) {
    var tempvar = "$zlt_" + pedirNombreTemporal();
    return "var " + tempvar + "=" + zl.javascript.expresion(compilado.veces, simbolo) + ";" +
      "while(" + tempvar + "-- >= 1){" +
      zl.javascript.sentencias(compilado.sentencias, simbolo) +
      "}";
  }

  zl.javascript.llamadaEntrada = function(compilado, simbolo) {
    var resultado = "{";
    if (compilado.length > 0) {
      resultado += compilado[0].izq.toLowerCase() + ":" + zl.javascript.expresion(compilado[0].der, simbolo);
      for (var i = 1; i < compilado.length; i++) {
        resultado += "," + compilado[i].izq.toLowerCase() + ":" + zl.javascript.expresion(compilado[i].der, simbolo);
      }
    }
    return resultado + "}";
  }

  zl.javascript.llamadaSalida = function(compilado, simbolo) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      var dato = simbolo.declaraciones[compilado[i].der.toLowerCase()];
      resultado += zl.javascript.datoprefijo(dato, simbolo);
      resultado += zl.javascript.nombre(dato.nombre, simbolo) + "=$res." + compilado[i].izq + ";";
    }
    return resultado;
  }

  zl.javascript.nombre = function(compilado, simbolo) {
    return compilado.toLowerCase();
  }

  zl.javascript.expresion = function(compilado, simbolo) {
    var modulo = simbolo.padre;
    // Operaciones con dos operadores:
    // TODO: Comprobar si la operación no es simple, sino que tiene
    // un alias en javascript.
    var operador = zl.javascript.operador(compilado.op, simbolo);
    if (compilado.izq && compilado.der) {
      var izq = zl.javascript.expresion(compilado.izq, simbolo);
      var der = zl.javascript.expresion(compilado.der, simbolo);
      var tipoizq = compilado.izq.tipofinal;
      var tipoder = compilado.der.tipofinal;
      var opcn = modulo.operadorBinario(compilado.op, tipoizq, tipoder);
      if (opcn.alias.length > 0) {
        var resultado = "$exterior.";
        if (modulo) {
          resultado += opcn.localizacion.nombre + "Prototipo.";
        }
        return resultado + opcn.alias + "({izquierda:" + izq + ",derecha:" + der + "}).resultado"
      }
      return izq + " " + operador + " " + der;
    } else if (compilado.der && operador) {
      var der = (compilado.der.tipo.indexOf("expresion") > -1 ?
        zl.javascript.expresion(compilado.der, simbolo) :
        zl.javascript.evaluacion(compilado.der, simbolo));
      return operador + der;
    } else {
      return zl.javascript.evaluacion(compilado, simbolo);
    }
  }

  zl.javascript.operador = function(compilado, simbolo) {
    if (compilado == "=")
      return "==";
    if (compilado == "o")
      return "||";
    if (compilado == "y")
      return "&&";
    if (compilado == "no")
      return "!";
    return compilado;
  }

  zl.javascript.evaluacion = function(compilado, simbolo) {
    if (compilado.tipo == "numero") {
      return compilado.valor;
    } else if (compilado.tipo == "texto") {
      return compilado.valor;
    } else if (compilado.tipo == "letra") {
      return compilado.valor;
    } else if (compilado.tipo == "verdadero") {
      return "true";
    } else if (compilado.tipo == "falso") {
      return "false";
    } else if (compilado.tipo == "lista") {
      // TODO: revisar esta optimizacion:
      var lista = {
        $configuracion: {
          nombremodulo: "\"lista\""
        }
      };
      lista.$miembros = {
        v: Array.prototype.slice.call(compilado.valor)
      };
      lista.$miembros.v = lista.$miembros.v.map(function(el) {
        return zl.javascript.expresion(el, simbolo);
      })
      var x = JSON.stringify(lista).replace(/([^\\])\"/g, "$1");
      x = x.replace(/\\\"/g, "\"")
      return x;
    } else if (compilado.tipo == "conversion") {
      var subrutina = compilado.subrutinaConversora.subrutina;
      var modulo = subrutina.padre;
      return "$exterior." + modulo.nombre + "Prototipo." + subrutina.nombre + "({" +
        subrutina.conversion.datoEntrada.nombre + ":" + zl.javascript.evaluacion(compilado.evaluacion, simbolo) +
        "})." + subrutina.conversion.datoSalida.nombre;
    } else if (compilado.tipo == "acceso") {
      var dato = simbolo.declaraciones[compilado.nombre.toLowerCase()];
      var r = zl.javascript.datoprefijo(dato, simbolo);
      r += zl.javascript.nombre(compilado.nombre, simbolo);
      return "$exterior.$accesoGet.call(" + r + "," + zl.javascript.listaAcceso(compilado.acceso, dato) + ")";
    } else
    if (compilado.tipo == "nombre") {
      var dato = simbolo.declaraciones[compilado.valor.toLowerCase()];
      var r = zl.javascript.datoprefijo(dato, simbolo);

      return r + zl.javascript.nombre(compilado.valor, simbolo);
    } else if (compilado.tipo == "expresion") {
      return "(" + zl.javascript.expresion(compilado.valor, simbolo) + ")";
    }
  }


  zl.javascript.listaAcceso = function(compilado, simbolo) {
    var resultado = "";
    var coma = "";
    for (var i = 0; i < compilado.length; i++) {
      var expresion = zl.javascript.expresion(compilado[i], simbolo);
      resultado += coma + expresion + ("-" + simbolo.genericidad.offsets[i]);
      coma = ",";
    }
    return resultado;
  }

  zl.javascript.datoprefijo = function(dato, simbolo) {
    var resultado;
    if (dato.modificadores === dato.M_LOCAL)
      resultado = "$local.";
    else if (dato.modificadores & dato.M_SALIDA)
      resultado = "$salida.";
    else if (dato.modificadores & dato.M_ENTRADA)
      resultado = "$entrada.";
    else if (dato.modificadores & dato.M_GLOBAL)
      resultado = "$self.$miembros.";
    return resultado;
  }

  zl.javascript.dato = function(dato, simbolo) {
    if ((dato.modificadores & dato.M_SALIDA) && (dato.modificadores & dato.M_ENTRADA)) {
      return "$salida." + zl.javascript.nombre(dato.nombre) + "=$entrada." + zl.javascript.nombre(dato.nombre);
    }
    if (!(dato.modificadores & dato.M_ENTRADA) && dato.tipoInstancia.tipo.constr !== "") {
      var resultado = zl.javascript.datoprefijo(dato, simbolo);
      resultado += zl.javascript.nombre(dato.nombre) + "= new $exterior." + dato.tipoInstancia.tipo.constr + "(";
      resultado += "$exterior";
      return resultado + ");";
    }
    return "";
  }
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
