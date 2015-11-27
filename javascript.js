var zl = zl || {};
zl.javascript = zl.javascript || {};

(function() {
  "use strict";

  // Generar la cabecera
  // TODO: Hacerlo a partir del entorno
  zl.javascript.cabecera = function(compilado, entorno) {
    var resultado = "var $zl_inicio;(function(){\"use strict\";";
    for (var k in entorno.globales) {
      resultado += "var $zl_"+k+";";
    }
    return resultado;
  }

  // Generar el final
  // TODO: Hacerlo a partir del entorno
  zl.javascript.final = function(compilado, entorno) {
    return "})();"
  }

  zl.javascript.generar = function(compilado, entorno) {
    return zl.javascript.compilarCodigo(compilado, entorno);
  }

  zl.javascript.compilarCodigo = function(compilado, entorno) {
    return zl.javascript.programa(compilado, entorno);
  }

  zl.javascript.programa = function(compilado, entorno) {
    return  zl.javascript.cabecera(compilado, entorno) +
            zl.javascript.subrutinas(compilado.subrutinas, entorno) +
            zl.javascript.final(compilado, entorno);
  }

  zl.javascript.subrutina = function(compilado, entorno) {
    //TODO: tratar los modificadores y los datos correctamente
    entorno.cambiarSubrutina(compilado.nombre);
    var resultado = "";
    if (!entorno.subrutinaActual.modificadores.externa)
      resultado += "var ";

    resultado += zl.javascript.nombre(compilado.nombre, entorno) + "=function(arg){" +
            zl.javascript.datos(compilado.datos, entorno) +
            zl.javascript.sentencias(compilado.sentencias, entorno) +
            "return{"

    var coma = "";
    for (var k in entorno.subrutinaActual.datos) {
      var dato = entorno.subrutinaActual.datos[k];
      if (dato.modificador == dato.M_SALIDA || dato.modificador == dato.M_ENTRADA_SALIDA) {
        resultado += dato.nombre + ":" + zl.javascript.nombre(dato.nombre) + coma;
      }
      coma = ",";
    }

    resultado += "};};";
    return resultado;
  }

  zl.javascript.datos = function(compilado, entorno) {
    //TODO: tratar los modificadores y los datos correctamente
    var resultado = "";
    for (var k in entorno.subrutinaActual.datos) {
      var dato = entorno.subrutinaActual.datos[k];
      if (dato.modificador == dato.M_ENTRADA || dato.modificador == dato.M_ENTRADA_SALIDA)
        resultado += "var " + zl.javascript.nombre(dato.nombre) + "=arg." + dato.nombre + ";";
      else if (dato.modificador != dato.M_GLOBAL)
        resultado += "var " + zl.javascript.nombre(dato.nombre) + ";";
    }
    return resultado;
  }

  zl.javascript.subrutinas = function(compilado, entorno) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += zl.javascript.subrutina(compilado[i], entorno);
    }
    return resultado;
  }

  zl.javascript.sentencias = function(compilado, entorno) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += zl.javascript.sentencia(compilado[i], entorno);
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
      resultado = "var $zlr = " +
        zl.javascript.nombre(compilado.nombre, entorno) +
        "(" +
        zl.javascript.llamadaEntrada(compilado.entrada, entorno) +
        ")" +
        zl.javascript.llamadaSalida(compilado.salida,entorno);
    } else if (compilado.tipo == "mientras") {
      resultado = "while(" + zl.javascript.expresion(compilado.condicion, entorno) + "){" +
        zl.javascript.sentencias(compilado.sentencias, entorno) +
        "}"
    } else if (compilado.tipo == "repetir") {
      var tempvar = "$zlt_"+entorno.pedirNombreTemporal();
      resultado = "{var " + tempvar + " = "+ zl.javascript.expresion(compilado.veces, entorno) +";"
      resultado += "while(" + tempvar + "--){"
      resultado += zl.javascript.sentencias(compilado.sentencias, entorno);
      resultado += "}}";
    } else if (compilado.tipo == "sicondicional") {
      var siguiente = compilado.siguiente;
      resultado = "if(" + zl.javascript.expresion(compilado.condicion) + "){" +
                  zl.javascript.sentencias(compilado.sentencias)+
                  "}";
      while (siguiente) {
        if (siguiente.condicion)
          resultado +=  "else if(" + zl.javascript.expresion(siguiente.condicion) + "){" +
              zl.javascript.sentencias(siguiente.sentencias)+
              "}";
        else
          resultado +=  "else{" +
              zl.javascript.sentencias(siguiente.sentencias)+
              "}";

        siguiente = siguiente.siguiente;
      }
    }
    return resultado + ";";
  }

  zl.javascript.llamadaEntrada = function(compilado, entorno) {
    var resultado = "{";
    if (compilado.length > 0) {
      resultado += compilado[0].izq + ":" + zl.javascript.expresion(compilado[0].der, entorno);
      for (var i = 1; i < compilado.length; i++) {
        resultado += ","+compilado[i].izq + ":" + zl.javascript.expresion(compilado[i].der, entorno);
      }
    }
    return resultado + "}";
  }

  zl.javascript.llamadaSalida = function(compilado, entorno) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += ";"+zl.javascript.nombre(compilado[i].der) + "=$zlr." + compilado[i].izq;
    }
    return resultado;
  }

  zl.javascript.nombre = function(compilado, entorno) {
    return "$zl_" + compilado.toLowerCase();
  }

  zl.javascript.expresion = function(compilado, entorno) {
    // Operaciones con dos operadores:
    var operador = zl.javascript.operador(compilado.op, entorno);
    if (compilado.izq && compilado.der) {
      var izq = zl.javascript.expresion(compilado.izq);
      var der = zl.javascript.expresion(compilado.der);

      return izq + " " +  operador +  " " + der;
    } else if (compilado.der && operador) {
      var der = (compilado.der.tipo.indexOf("expresion") > -1 ?
        zl.javascript.expresion(compilado.der) :
        zl.javascript.evaluacion(compilado.der));
      return operador + der;
    } else {
      return zl.javascript.evaluacion(compilado);
    }
  }

  zl.javascript.operador = function(compilado, entorno) {
    if (compilado == "=")
      return "==";
    if (compilado == "o")
      return "||";
    if (compilado == "y")
      return "&&";
    return compilado;
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
