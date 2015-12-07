var zl = zl || {};
zl.javascript = zl.javascript || {};

(function() {
  "use strict";

  // Generar la cabecera
  // TODO: Hacerlo a partir del entorno
  zl.javascript.cabecera = function(compilado, entorno) {
    var resultado = "";
    for (var k in entorno.subrutinas) {
      if ("externa" in entorno.subrutinas[k].modificadores)
        resultado += "var "+zl.javascript.nombre(entorno.subrutinas[k].nombre, entorno) + ";";
    }
    resultado += "(function(){\"use strict\";";
    for (var k in entorno.globales) {
      resultado += zl.javascript.dato(entorno.globales[k], entorno);
    }
    return resultado;
  }

  // Generar el final
  // TODO: Hacerlo a partir del entorno
  zl.javascript.final = function(compilado, entorno) {
    var resultado = "})();";
    return resultado;
  }

  zl.javascript.generar = function(compilado, entorno) {
    return zl.javascript.compilarCodigo(compilado, entorno);
  }

  zl.javascript.compilarCodigo = function(compilado, entorno) {
    return zl.javascript.programa(compilado, entorno);
  }

  zl.javascript.programa = function(compilado, entorno) {
    return zl.javascript.cabecera(compilado, entorno) +
      zl.javascript.subrutinas(compilado.subrutinas, entorno) +
      zl.javascript.final(compilado, entorno);
  }

  zl.javascript.subrutina = function(compilado, entorno) {
    //TODO: tratar los modificadores y los datos correctamente
    entorno.cambiarSubrutina(compilado.nombre);
    var resultado = "";
    if (!entorno.subrutinaActual.modificadores.externa)
      resultado += "var ";

    resultado += zl.javascript.nombre(compilado.nombre, entorno) + "=function(arg, done){" +
      zl.javascript.datos(compilado.datos, entorno) +
      "async.waterfall([function(c){c(null,arg);}," +
      "function(arg,done){var $zlr = {};" +
      zl.javascript.sentencias(compilado.sentencias, entorno) +
      "done(null, $zlr);}],done);"

    var coma = "";
    for (var k in entorno.subrutinaActual.datos) {
      var dato = entorno.subrutinaActual.datos[k];
      if (dato.modificador == dato.M_SALIDA || dato.modificador == dato.M_ENTRADA_SALIDA) {
        resultado += dato.nombre + ":" + zl.javascript.nombre(dato.nombre) + coma;
      }
      coma = ",";
    }

    resultado += "};";
    return resultado;
  }

  zl.javascript.datos = function(compilado, entorno) {
    //TODO: tratar los modificadores y los datos correctamente
    var resultado = "";
    for (var k in entorno.subrutinaActual.datos) {
      var dato = entorno.subrutinaActual.datos[k];
      // Si es global, ignorar:
      if (dato.modificador != dato.M_GLOBAL)
        resultado += zl.javascript.dato(dato, entorno);
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
      resultado = zl.javascript.nombre(compilado.variable, entorno);
      if (compilado.acceso)
        resultado += zl.javascript.listaAcceso(compilado.acceso);
      resultado += "=" +
        zl.javascript.expresion(compilado.valor);
    } else if (compilado.tipo == "llamada") {
      resultado = "$zlr = " +
        zl.javascript.llamadaEntrada(compilado.entrada, entorno) +
        ";done(null,$zlr);}," +
        zl.javascript.nombre(compilado.nombre, entorno) +
        ",function(arg,done) {var $zlr;" +
        zl.javascript.llamadaSalida(compilado.salida, entorno);
    } else if (compilado.tipo == "mientras") {
      var tempcallback = "$zlt_" + entorno.pedirNombreTemporal();
      resultado = "done(null,$zlr);}, function(arg,done){var $zlr;" +
        "function "+tempcallback+"(arg){"+
        "if ("+ zl.javascript.expresion(compilado.condicion, entorno) +"){" +
        "async.waterfall([function(c){c(null,arg);},function(arg,done){"+
        zl.javascript.sentencias(compilado.sentencias, entorno)+
        ";done(null,$zlr);}],"+tempcallback+");}"+
        "else {done(null, arg);}"+
        "}"+tempcallback+"(arg,done);},function(arg,done){var $zlr;";
    } else if (compilado.tipo == "repetir") {
      var tempvar = "$zlt_" + entorno.pedirNombreTemporal();
      var tempcallback = "$zlt_" + entorno.pedirNombreTemporal();
      resultado = "done(null,$zlr);}, function(arg,done){var $zlr;" +
        "var "+tempvar+"="+zl.javascript.expresion(compilado.veces,entorno)+";"+
        "function "+tempcallback+"(arg){"+
        "if ("+ tempvar +"--){" +
        "async.waterfall([function(c){c(null,arg);},function(arg,done){"+
        zl.javascript.sentencias(compilado.sentencias, entorno)+
        ";done(null,$zlr);}],"+tempcallback+");}"+
        "else {done(null, arg);}"+
        "}"+tempcallback+"(arg,done);},function(arg,done){var $zlr;";
    } else if (compilado.tipo == "sicondicional") {
      var siguiente = compilado.siguiente;

      resultado = "done(null,$zlr);}, function(arg, done){var $zlr;"+
        "if(" + zl.javascript.expresion(compilado.condicion) + "){" +
        "async.waterfall([function(c){c(null,arg);},function(arg,done){"+
          zl.javascript.sentencias(compilado.sentencias) +
          "}],done);"+
        "}";
      while (siguiente) {
        if (siguiente.condicion)
          resultado += "else if(" + zl.javascript.expresion(siguiente.condicion) + "){" +
          "async.waterfall([function(c){c(null,arg);},function(arg,done){"+
            zl.javascript.sentencias(siguiente.sentencias) +
            "}],done);"+
          "}";
        else
          resultado += "else{" +
          "async.waterfall([function(c){c(null,arg);},function(arg,done){"+
          zl.javascript.sentencias(siguiente.sentencias) +
          "}],done);"+
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
        resultado += "," + compilado[i].izq + ":" + zl.javascript.expresion(compilado[i].der, entorno);
      }
    }
    return resultado + "}";
  }

  zl.javascript.llamadaSalida = function(compilado, entorno) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += ";" + zl.javascript.nombre(compilado[i].der) + "=arg." + compilado[i].izq;
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

      return izq + " " + operador + " " + der;
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
    } else if (compilado.tipo == "acceso") {
      return zl.javascript.nombre(compilado.nombre) + zl.javascript.listaAcceso(compilado.acceso);
    } else if (compilado.tipo == "nombre") {
      return zl.javascript.nombre(compilado.valor);
    } else if (compilado.tipo == "expresion") {
      return "(" + zl.javascript.expresion(compilado.valor, entorno) + ")";
    }
  }

  zl.javascript.listaAcceso = function(compilado, entorno) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += "[" + zl.javascript.expresion(compilado[i]) + "]";
    }
    return resultado;
  }

  zl.javascript.dato = function(dato, entorno) {
    var resultado = "var " + zl.javascript.nombre(dato.nombre);
    if (dato.modificador == dato.M_ENTRADA || dato.modificador == dato.M_ENTRADA_SALIDA)
      resultado += "=arg." + dato.nombre;
    if ((dato.modificador == dato.M_GLOBAL || dato.modificador == dato.M_SALIDA || dato.modificador == dato.M_LOCAL) && dato.tipo == "relacion") {
      resultado += "={}";
    }
    return resultado + ";";
  }
})();
