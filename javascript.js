var zl = zl || {};
zl.javascript = zl.javascript || {};

(function() {
  "use strict";

  // Función auxiliar
  // Genera nombres temporales para que no se repitan
  var temporal = 0;

  function pedirNombreTemporal() {
    return temporal++;
  }

  // Generar la cabecera
  // TODO: Hacerlo a partir del simbolo
  zl.javascript.cabecera = function(compilado, simbolo) {
    var resultado = "";
    for (var k in simbolo.subrutinas) {
      if ("externa" in simbolo.subrutinas[k].modificadores)
        resultado += "var " + zl.javascript.nombre(simbolo.subrutinas[k].nombre, simbolo) + ";";
    }
    resultado += "(function(){\"use strict\";";
    for (var k in simbolo.globales) {
      resultado += zl.javascript.dato(simbolo.globales[k], simbolo);
    }
    return resultado;
  }

  // Generar el final
  // TODO: Hacerlo a partir del simbolo
  zl.javascript.final = function(compilado, simbolo) {
    var resultado = "})();";
    return resultado;
  }

  zl.javascript.modulo = function(compilado, simbolo) {
    temporal = 0;
    return zl.javascript.cabecera(compilado, simbolo) +
      zl.javascript.subrutinas(compilado.subrutinas, simbolo) +
      zl.javascript.final(compilado, simbolo);
  }

  zl.javascript.subrutinas = function(compilado, simbolo) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += zl.javascript.subrutina(compilado[i], simbolo.subrutinaPorNombre(compilado[i].nombre));
    }
    return resultado;
  }

  zl.javascript.subrutina = function(compilado, simbolo) {
    //TODO: tratar los modificadores y los datos correctamente
    var resultado = "";
    if (!simbolo.modificadores.externa)
      resultado += "var ";

    resultado += zl.javascript.nombre(compilado.nombre, simbolo) + "=function(arg, done){var $zlr = arg;" +
      zl.javascript.datos(compilado.datos, simbolo.declaraciones) +
      "async.waterfall([function(c){c(null,arg);}," +
      "function(arg,done){$zlr = {};" +
      zl.javascript.sentencias(compilado.sentencias, simbolo) +
      "done(null, $zlr);}],done);"

    var coma = "";
    for (var k in simbolo.datos) {
      var dato = simbolo.datos[k];
      if (dato.modificadores & dato.M_SALIDA) {
        resultado += dato.nombre + ":" + zl.javascript.nombre(dato.nombre) + coma;
      }
      coma = ",";
    }

    resultado += "};";
    return resultado;
  }

  zl.javascript.datos = function(compilado, simbolo) {
    //TODO: tratar los modificadores y los datos correctamente
    var resultado = "";
    for (var k in simbolo) {
      var dato = simbolo[k];
      // Si es global, ignorar:
      if (dato.modificadores != dato.M_GLOBAL)
        resultado += zl.javascript.dato(dato, simbolo);
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
      resultado = zl.javascript.nombre(compilado.variable, simbolo);
      if (compilado.acceso)
        resultado += zl.javascript.listaAcceso(compilado.acceso);
      resultado += "=" +
        zl.javascript.expresion(compilado.valor);
    } else if (compilado.tipo == "llamada") {
      resultado = zl.javascript.llamada(compilado, simbolo);
    } else if (compilado.tipo == "mientras") {
      resultado = zl.javascript.mientras(compilado, simbolo);
    } else if (compilado.tipo == "repetir") {
      resultado = zl.javascript.repetir(compilado, simbolo);
    } else if (compilado.tipo == "sicondicional") {
      resultado = zl.javascript.sicondicional(compilado, simbolo);
    }
    return resultado + ";";
  }

  zl.javascript.llamada = function(compilado, simbolo) {
    if (compilado.asincrono)
      return ";done(null," + zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");}," +
        zl.javascript.nombre(compilado.nombre, simbolo) +
        ",function(arg,done) {$zlr = arg;" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
    else
      return "$zlr = " + zl.javascript.nombre(compilado.nombre, simbolo) + "(" +
        zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
  }

  zl.javascript.mientras = function(compilado, simbolo) {
    var tempcallback = "$zlt_" + pedirNombreTemporal();
    if (compilado.asincrono) {
      return "done(null,$zlr);}, function(arg,done){$zlr = arg;" +
        "function " + tempcallback + "(arg){" +
        "if (" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
        "async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        ";done(null,$zlr);}]," + tempcallback + ");}" +
        "else {done(null, arg);}" +
        "}" + tempcallback + "(arg,done);},function(arg,done){$zlr = arg;";
    } else {
      //TODO: El mientras síncrono.
    }
  }

  zl.javascript.sicondicional = function(compilado, simbolo) {
    var siguiente = compilado.siguiente;
    var resultado = "";
    if (compilado.asincrono) {
      resultado = "done(null,$zlr);}, function(arg, done){$zlr = arg;" +
        "if(" + zl.javascript.expresion(compilado.condicion) + "){" +
        "async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias) +
        "done(null, arg);}],done);" +
        "}";
      while (siguiente) {
        if (siguiente.condicion)
          resultado += "else if(" + zl.javascript.expresion(siguiente.condicion) + "){" +
          "async.waterfall([function(c){c(null,arg);},function(arg,done){" +
          zl.javascript.sentencias(siguiente.sentencias) +
          "done(null,arg);}],done);" +
          "}";
        else
          resultado += "else{" +
          "async.waterfall([function(c){c(null,arg);},function(arg,done){" +
          zl.javascript.sentencias(siguiente.sentencias) +
          "done(null,arg);}],done);" +
          "}";
        siguiente = siguiente.siguiente;
      }
      resultado += "}, function(arg, done){$zlr = arg;";
    } else {
      resultado = "if(" + zl.javascript.expresion(compilado.condicion) + "){" +
        zl.javascript.sentencias(compilado.sentencias) +
        "}";
      while (siguiente) {
        if (siguiente.condicion)
          resultado += "else if(" + zl.javascript.expresion(siguiente.condicion) + "){" +
          zl.javascript.sentencias(siguiente.sentencias) +
          "}";
        else
          resultado += "else{" +
          zl.javascript.sentencias(siguiente.sentencias) +
          "}";
        siguiente = siguiente.siguiente;
      }
    }
    return resultado;
  }

  zl.javascript.repetir = function(compilado, simbolo) {
    var tempvar = "$zlt_" + pedirNombreTemporal();
    if (compilado.asincrono) {
      var tempcallback = "$zlt_" + pedirNombreTemporal();
      return "done(null,$zlr);}, function(arg,done){$zlr = arg;" +
        "var " + tempvar + "=" + zl.javascript.expresion(compilado.veces, simbolo) + ";" +
        "function " + tempcallback + "(arg){" +
        "if (" + tempvar + "-- > 1){" +
        "async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        ";done(null,$zlr);}]," + tempcallback + ");}" +
        "else {done(null, arg);}" +
        "}" + tempcallback + "(arg,done);},function(arg,done){$zlr = arg;";
    } else
      return "var " + tempvar + "=" + zl.javascript.expresion(compilado.veces, simbolo) + ";" +
        "while(" + tempvar + "-- > 1){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        "}";
  }

  zl.javascript.llamadaEntrada = function(compilado, simbolo) {
    var resultado = "{";
    if (compilado.length > 0) {
      resultado += compilado[0].izq + ":" + zl.javascript.expresion(compilado[0].der, simbolo);
      for (var i = 1; i < compilado.length; i++) {
        resultado += "," + compilado[i].izq + ":" + zl.javascript.expresion(compilado[i].der, simbolo);
      }
    }
    return resultado + "}";
  }

  zl.javascript.llamadaSalida = function(compilado, simbolo) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += ";" + zl.javascript.nombre(compilado[i].der) + "=$zlr." + compilado[i].izq;
    }
    return resultado;
  }

  zl.javascript.nombre = function(compilado, simbolo) {
    return "$zl_" + compilado.toLowerCase();
  }

  zl.javascript.expresion = function(compilado, simbolo) {
    // Operaciones con dos operadores:
    var operador = zl.javascript.operador(compilado.op, simbolo);
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

  zl.javascript.operador = function(compilado, simbolo) {
    if (compilado == "=")
      return "==";
    if (compilado == "o")
      return "||";
    if (compilado == "y")
      return "&&";
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
    } else if (compilado.tipo == "acceso") {
      return zl.javascript.nombre(compilado.nombre) + zl.javascript.listaAcceso(compilado.acceso);
    } else if (compilado.tipo == "nombre") {
      return zl.javascript.nombre(compilado.valor);
    } else if (compilado.tipo == "expresion") {
      return "(" + zl.javascript.expresion(compilado.valor, simbolo) + ")";
    }
  }

  zl.javascript.listaAcceso = function(compilado, simbolo) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      resultado += "[" + zl.javascript.expresion(compilado[i]) + "]";
    }
    return resultado;
  }

  zl.javascript.dato = function(dato, simbolo) {
    var resultado = "var " + zl.javascript.nombre(dato.nombre);
    if (dato.modificadores & dato.M_ENTRADA)
      resultado += "=$zlr." + dato.nombre;
    if (!(dato.modificadores & dato.M_ENTRADA) && dato.tipo == "relacion") {
      resultado += "={}";
    }
    return resultado + ";";
  }
})();
