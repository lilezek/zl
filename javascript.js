var zl = zl || {};
zl.javascript = zl.javascript || {};

(function() {
  "use strict";

  // Generar la cabecera
  // TODO: Hacerlo a partir del entorno
  zl.javascript.cabecera = function(compilado, entorno) {
    return "(function(){/*\"use strict\"*/";
  }

  // Generar el final
  // TODO: Hacerlo a partir del entorno
  zl.javascript.final = function(compilado, entorno) {
    return "})();"
  }

  zl.javascript.generar = function(compilado, entorno) {
    var cab = zl.javascript.cabecera(compilado, entorno);
    var fin = zl.javascript.final(compilado, entorno);
    var cod = zl.javascript.compilarCodigo(compilado, entorno);
    return cab + cod + fin;
  }

  zl.javascript.compilarCodigo = function(compilado, entorno) {
    // TODO: De momento lista de sentencias:
    return zl.javascript.sentencias(compilado, entorno);
  }

  zl.javascript.sentencias = function(compilado, entorno) {

    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += zl.javascript.sentencia(compilado[i]);
    }
    return resultado;
  }

  zl.javascript.sentencia = function(compilado, entorno) {
    var resultado = "";
    if (compilado.tipo == "asignacion") {
      resultado = zl.javascript.nombre(compilado.variable, entorno) +
        "=" +
        zl.javascript.expresion(compilado.valor);
    } else if (compilado.tipo == "llamada") {
      resultado = zl.javascript.nombre(compilado.nombre, entorno) +
        "(" +
        zl.javascript.llamadaAsignacion(compilado.asignaciones, entorno) +
        ")";
    } else if (compilado.tipo == "mientras") {
      resultado = "while (" + zl.javascript.expresion(compilado.condicion, entorno) + "){" +
        zl.javascript.sentencias(compilado.sentencias, entorno) +
        "}"
    }
    return resultado + ";";
  }

  zl.javascript.llamadaAsignacion = function(compilado, entorno) {
    var resultado = "{";
    if (compilado[0].tipo == "entrada") {
      resultado += compilado[0].izq + ":" + zl.javascript.expresion(compilado[0].der, entorno);
    }
    for (var i = 1; i < compilado.length; i++) {
      if (compilado[i].tipo == "entrada") {
        resultado += compilado[i].izq + ":" + zl.javascript.expresion(compilado[i].der, entorno);
      }
    }
    return resultado + "}";
  }

  zl.javascript.nombre = function(compilado, entorno) {
    return "$zl_" + compilado;
  }

  zl.javascript.expresion = function(compilado, entorno) {
    // Operaciones con dos operadores:
    if (compilado.izq && compilado.der) {
      var izq = zl.javascript.expresion(compilado.izq);
      var der = zl.javascript.expresion(compilado.der);

      return izq + compilado.op + der;
    } else if (compilado.der && compilado.op) {
      var der = (compilado.der.tipo.indexOf("expresion") > -1 ?
        zl.javascript.expresion(compilado.der) :
        zl.javascript.evaluacion(compilado.der));
      return compilado.op + der;
    } else {
      return zl.javascript.evaluacion(compilado);
    }
  }

  zl.javascript.evaluacion = function(compilado, entorno) {
    if (compilado.tipo == "numero") {
      return compilado.valor;
    } else if (compilado.tipo == "texto") {
      return compilado.valor;
    } else if (compilado.tipo == "letra") {
      return compilado.valor;
    } else if (compilado.tipo == "boleano") {
      return "" + (compilado.valor == "verdadero");
    } else if (compilado.tipo == "nombre") {
      return zl.javascript.nombre(compilado.valor);
    } else if (compilado.tipo == "expresion") {
      return "(" + zl.javascript.expresion(compilado.valor, entorno) + ")";
    }
  }
})();
