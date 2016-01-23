var modulo = function(zl) {
  "use strict";

  zl.javascript = zl.javascript || {};
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
    resultado += "(function(){\"use strict\";var $in=this;";
    for (var k in simbolo.globales) {
      resultado += zl.javascript.dato(simbolo.globales[k], simbolo);
    }
    return resultado;
  }

  // Generar el final
  // TODO: Hacerlo a partir del simbolo
  zl.javascript.final = function(compilado, simbolo) {
    var resultado = "}).call(this);";
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
    else
      resultado += "this.";

    if (simbolo.modificadores.asincrono) {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + "=function(arg, done){var $zlr=arg;" +
        zl.javascript.datos(compilado.datos, simbolo.declaraciones) +
        "$in.async.waterfall([function(c){c(null,arg);}," +
        "function(arg,done){$zlr = {};" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        "done(null, $zlr);}],done);";
    } else {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + "=function(arg, done){var $zlr=arg;" +
        zl.javascript.datos(compilado.datos, simbolo.declaraciones) +
        zl.javascript.sentencias(compilado.sentencias, simbolo);
    }
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
        resultado += zl.javascript.listaAcceso(compilado.acceso, simbolo.declaraciones[resultado]);
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
    var nombre = zl.javascript.nombre(compilado.nombre, simbolo);
    var sub = simbolo.padre.subrutinaPorNombre(nombre);
    // TODO: Generar correctamente los nombres importados
    if ("externa" in sub.modificadores)
      nombre = "$in." + nombre;
    if (compilado.asincrono)
      return ";done(null," + zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");}," +
        nombre +
        ",function(arg,done) {$zlr = arg;" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
    else
      return "$zlr = " + nombre + "(" +
        zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
  }

  zl.javascript.mientras = function(compilado, simbolo) {
    var tempcallback = "$zlt_" + pedirNombreTemporal();
    if (compilado.asincrono) {
      return "done(null,$zlr);}, function(arg,done){$zlr = arg;" +
        "function " + tempcallback + "(arg){" +
        "if (" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
        "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
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
        "if(" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
        "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        "done(null, arg);}],done);" +
        "}";
      while (siguiente) {
        if (siguiente.condicion)
          resultado += "else if(" + zl.javascript.expresion(siguiente.condicion, simbolo) + "){" +
          "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
          zl.javascript.sentencias(siguiente.sentencias, simbolo) +
          "done(null,arg);}],done);" +
          "}";
        else
          resultado += "else{" +
          "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
          zl.javascript.sentencias(siguiente.sentencias, simbolo) +
          "done(null,arg);}],done);" +
          "}";
        siguiente = siguiente.siguiente;
      }
      resultado += "}, function(arg, done){$zlr = arg;";
    } else {
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
        "if (" + tempvar + "-- >= 1){" +
        "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        ";done(null,$zlr);}]," + tempcallback + ");}" +
        "else {done(null, arg);}" +
        "}" + tempcallback + "(arg,done);},function(arg,done){$zlr = arg;";
    } else
      return "var " + tempvar + "=" + zl.javascript.expresion(compilado.veces, simbolo) + ";" +
        "while(" + tempvar + "-- >= 1){" +
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
    return compilado.toLowerCase();
  }

  zl.javascript.expresion = function(compilado, simbolo) {
    // Operaciones con dos operadores:
    // TODO: Comprobar si la operación no es simple, sino que tiene
    // un alias en javascript.
    var operador = zl.javascript.operador(compilado.op, simbolo);
    if (compilado.izq && compilado.der) {
      var izq = zl.javascript.expresion(compilado.izq);
      var der = zl.javascript.expresion(compilado.der);
      var tipoizq = compilado.izq.tipofinal;
      var tipoder = compilado.der.tipofinal;
      var alias = tipoizq.opbinario[compilado.op][tipoder.nombre].alias;
      // TODO: poner el módulo antes del alias correctamente.
      if (alias.length > 0) {
        return "$in." + alias + "({izq:" + izq + ",der:" + der + "})"
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
    } else if (compilado.tipo == "acceso") {
      var r = zl.javascript.nombre(compilado.nombre);
      return r + zl.javascript.listaAcceso(compilado.acceso, simbolo.declaraciones[r]);
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
    if (!(dato.modificadores & dato.M_ENTRADA) && dato.tipo.constr !== "") {
      resultado += "=$in." + dato.tipo.constr + "()";
    }
    return resultado + ";";
  }
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
