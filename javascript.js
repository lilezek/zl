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
    var resultado = "\"use strict\";";
    resultado += "function " + simbolo.configuracion.nombremodulo + "Modulo($in){\"use strict\";var $global=this.$miembros={};";
    for (var k in simbolo.globales) {
      resultado += zl.javascript.dato(simbolo.globales[k], simbolo);
    }
    resultado += "this.$configuracion = " + JSON.stringify(simbolo.configuracion) + ";";
    return resultado;
  }

  // Generar el final
  // TODO: Hacerlo a partir del simbolo
  zl.javascript.final = function(compilado, simbolo) {
    var resultado = "return this;};";
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
    if (simbolo.modificadores.interna)
      resultado += "var ";
    else
      resultado += "this.";

    var sentencias = "";
    if (simbolo.modificadores.primitiva) {
      sentencias = simbolo.segmentoPrimitivo;
    } else {
      sentencias = zl.javascript.sentencias(compilado.sentencias, simbolo);
    }

    if (simbolo.modificadores.asincrona && !simbolo.modificadores.primitiva) {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + "=function($entrada, done){var $self = this; var $salida={};var $local={};" +
        zl.javascript.datos(compilado.datos, simbolo.declaraciones) +
        "$in.async.waterfall([function(c){c(null,null);}," +
        "function(arg,done){$salida={};" +
        sentencias +
        "done(null, $salida);}],done);";
    } else {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + "=function($entrada, done){var $self = this; var $salida={};var $local={};" +
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
      var dato = simbolo.declaraciones[compilado.variable.toLowerCase()];
      resultado = zl.javascript.datoprefijo(dato, simbolo)
      resultado += zl.javascript.nombre(compilado.variable, simbolo);
      if (compilado.acceso)
        resultado += ".set(" + zl.javascript.expresion(compilado.valor, simbolo) + zl.javascript.listaAccesoAsignacion(compilado.acceso, simbolo.declaraciones[resultado]) + ")";
      else
        resultado += "=" + zl.javascript.expresion(compilado.valor, simbolo);
    } else if (compilado.tipo == "llamada") {
      resultado = zl.javascript.llamada(compilado, simbolo);
    } else if (compilado.tipo == "mientras") {
      resultado = zl.javascript.mientras(compilado, simbolo);
    } else if (compilado.tipo == "repetir") {
      resultado = zl.javascript.repetir(compilado, simbolo);
    } else if (compilado.tipo == "sicondicional") {
      resultado = zl.javascript.sicondicional(compilado, simbolo);
    } else if (compilado.tipo == "pausar") {
      resultado = "done(null,$salida);}, function(arg, done) {done(null, $local, $self.$miembros, $entrada, $salida," +
        ((compilado.begin + compilado.end) / 2) +
        ");}, $in.$impersonar($in.$pausar,$in), function(arg,done){";
    }
    return resultado + ";";
  }

  zl.javascript.llamada = function(compilado, simbolo) {
    var nombre = zl.javascript.nombre(compilado.nombre, simbolo);
    var sub = simbolo.padre.subrutinaPorNombre(nombre);
    // La subrutina puede encontrarse en otro módulo
    if (nombre.indexOf('.') > -1) {
      var r = nombre.split('.');
      var dato = simbolo.declaraciones[r[0]];
      sub = dato.tipo.modulo.subrutinaPorNombre(r[1]);
      nombre = zl.javascript.datoprefijo(dato, simbolo) + nombre;
    }
    else if (!sub.modificadores.interna)
      nombre = "$self." + nombre;
    if (compilado.asincrono)
      return ";done(null," + zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");}," +
        "$in.$impersonar(" + nombre + ", $self)" +
        ",function(arg,done) {$salida=arg;" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
    else
      return "$salida=" + nombre + "(" +
        zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
  }

  zl.javascript.mientras = function(compilado, simbolo) {
    var tempcallback = "$zlt_" + pedirNombreTemporal();
    if (compilado.asincrono) {
      return "done(null,$salida);}, function(arg,done){" +
        "function " + tempcallback + "(arg){" +
        "if (" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
        "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        ";done(null,$salida);}]," + tempcallback + ");}" +
        "else {done(null, arg);}" +
        "}" + tempcallback + "(arg,done);},function(arg,done){";
    } else {
      return "while(" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        "}";
    }
  }

  zl.javascript.sicondicional = function(compilado, simbolo) {
    var siguiente = compilado.siguiente;
    var resultado = "";
    if (compilado.asincrono) {
      var tieneElse = false;
      resultado = "done(null,$salida);}, function(arg, done){" +
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
        else {
          resultado += "else{" +
            "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
            zl.javascript.sentencias(siguiente.sentencias, simbolo) +
            "done(null,arg);}],done);" +
            "}";
          tieneElse = true;
        }
        siguiente = siguiente.siguiente;
      }
      if (!tieneElse) {
        resultado += "else {" +
          "done(null, arg);" +
          "}";
      }
      resultado += "}, function(arg, done){";
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
      return "done(null,$salida);}, function(arg,done){" +
        "var " + tempvar + "=" + zl.javascript.expresion(compilado.veces, simbolo) + ";" +
        "function " + tempcallback + "(arg){" +
        "if (" + tempvar + "-- >= 1){" +
        "$in.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        ";done(null,$salida);}]," + tempcallback + ");}" +
        "else {done(null, arg);}" +
        "}" + tempcallback + "(arg,done);},function(arg,done){";
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
      var dato = simbolo.declaraciones[compilado[i].der];
      resultado += zl.javascript.datoprefijo(dato, simbolo);
      resultado += zl.javascript.nombre(dato.nombre, simbolo) + "=$salida." + compilado[i].izq;
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
      var izq = zl.javascript.expresion(compilado.izq, simbolo);
      var der = zl.javascript.expresion(compilado.der, simbolo);
      var tipoizq = compilado.izq.tipofinal;
      var tipoder = compilado.der.tipofinal;
      var alias = tipoizq.opbinario[compilado.op][tipoder.nombre].alias;
      // TODO: poner el módulo antes del alias correctamente.
      if (alias.length > 0) {
        return "$self." + alias + "({izq:" + izq + ",der:" + der + "})"
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
    } else if (compilado.tipo == "conversion") {
      var subrutina = compilado.subrutinaConversora;
      // TODO: No usar $in. siempre. Comprobar de dónde viene la subrutina.
      return "this." + subrutina.nombre + "({" +
        subrutina.conversion.datoEntrada.nombre + ":" + zl.javascript.evaluacion({
          tipo: "nombre",
          valor: compilado.nombre,
        }, simbolo) +
        "})." + subrutina.conversion.datoSalida.nombre;
    } else if (compilado.tipo == "acceso") {
      var dato = simbolo.declaraciones[compilado.nombre.toLowerCase()];
      var r = zl.javascript.datoprefijo(dato, simbolo);
      r += zl.javascript.nombre(compilado.nombre, simbolo);
      return r + zl.javascript.listaAcceso(compilado.acceso, simbolo.declaraciones[r]);
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
    var resultado = ".get(";
    for (var i = 0; i < compilado.length; i++) {
      var expresion = zl.javascript.expresion(compilado[i], simbolo);
      // Quitar los paréntesis de la expresión:
      expresion = expresion.substring(1, expresion.length - 1);
      resultado += expresion;
    }
    resultado += ")";
    return resultado;
  }

  zl.javascript.listaAccesoAsignacion = function(compilado, simbolo) {
    var resultado = "";
    for (var i = 0; i < compilado.length; i++) {
      var expresion = zl.javascript.expresion(compilado[i], simbolo);
      // Quitar los paréntesis de la expresión:
      expresion = expresion.substring(1, expresion.length - 1);
      resultado += "," + expresion;
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
      resultado = "this.$miembros.";
    return resultado;
  }

  zl.javascript.dato = function(dato, simbolo) {
    if ((dato.modificadores & dato.M_SALIDA) && (dato.modifiacores & dato.M_ENTRADA))
      return "$salida." + zl.javascript.nombre(dato.nombre) + "=$entrada." + zl.javascript.nombre(dato.nombre);
    if (!(dato.modificadores & dato.M_ENTRADA) && dato.tipo.constr !== "") {
      var resultado = zl.javascript.datoprefijo(dato, simbolo);
      resultado += zl.javascript.nombre(dato.nombre) + "=$in." + dato.tipo.constr + "(";
      // Pasar las dimensiones al constructor si es una lista:
      if (dato.tipo.nombre === "lista") {
        resultado += JSON.stringify(dato.genericidad.dimensiones);
      }
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
