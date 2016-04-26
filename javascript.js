var modulo = function(zl) {
  "use strict";

  zl.javascript = zl.javascript || {};
  // Función auxiliar
  // Genera nombres temporales para que no se repitan
  var temporal = 0;

  function pedirNombreTemporal() {
    return temporal++;
  }

  zl.javascript.constructor = function(compilado, simbolo) {
    var resultado = "this." + simbolo.nombre + "=function " + simbolo.nombre + "($in){\"use strict\";";
    var integraciones = simbolo.arrayDeIntegraciones();
    for (var i = 0; i < integraciones.length; i++) {
      var nombre = integraciones[i].configuracion.nombremodulo;
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
      "this.$configuracion = " + JSON.stringify(simbolo.configuracion) + ";" +
      "$in.$writeJson(this, $in." + simbolo.nombre + "Prototipo);" +
      "return this;};";
    return resultado;
  }

  // Generar el final
  // TODO: Hacerlo a partir del simbolo
  zl.javascript.objeto = function(compilado, simbolo) {
    var resultado = "var $exterior = this;this." + simbolo.nombre + "Prototipo = {" +
      zl.javascript.subrutinas(compilado.subrutinas, simbolo) +
      "};";
    return resultado;
  }

  zl.javascript.modulo = function(compilado, simbolo) {
    temporal = 0;
    return zl.javascript.objeto(compilado, simbolo) +
      zl.javascript.constructor(compilado, simbolo);
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

    if (simbolo.modificadores.asincrona && !simbolo.modificadores.primitiva) {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + ": function($entrada, done){var $self = this;var $salida={};var $res={};var $local={};" +
        zl.javascript.datos(compilado.datos, simbolo.declaraciones) +
        "$exterior.async.waterfall([function(c){c(null,null);}," +
        "function(arg,done){$res={};" +
        sentencias +
        "done(null, $salida);}],done);";
    } else {
      resultado += zl.javascript.nombre(compilado.nombre, simbolo) + ": function($entrada, done){var $self = this;var $res={};var $salida={};var $local={};" +
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
        resultado += zl.javascript.dato(dato, simbolo)+";";
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
      var lvalor = zl.javascript.lvalorAsignacion(compilado.variable, simbolo).replace("$prefijo$",zl.javascript.datoprefijo(dato, simbolo));
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
      resultado = "done(null,$res);}, function(arg, done) {done(null, $local, $self.$miembros, $entrada, $salida," +
        ~~((compilado.begin + compilado.end) / 2) +
        ");}, $exterior.$impersonar($exterior.$pausar,$exterior), function(arg,done){";
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
    for (var i = 0; i < compilado.accesos.length ; i++) {
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
      return ";done(null," + zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");}," +
        "$exterior.$impersonar(" + nombre + ", $self)" +
        ",function(arg,done) {$res=arg;" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
    else
      return "$res=" + nombre + "(" +
        zl.javascript.llamadaEntrada(compilado.entrada, simbolo) + ");" +
        zl.javascript.llamadaSalida(compilado.salida, simbolo);
  }

  zl.javascript.mientras = function(compilado, simbolo) {
    var tempcallback = "$zlt_" + pedirNombreTemporal();
    if (compilado.asincrono) {
      return "done(null,$res);}, function(arg,done){" +
        "function " + tempcallback + "(arg){" +
        "if (" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
        "$exterior.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        ";done(null,$res);}]," + tempcallback + ");}" +
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
      resultado = "done(null,$res);}, function(arg, done){" +
        "if(" + zl.javascript.expresion(compilado.condicion, simbolo) + "){" +
        "$exterior.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        "done(null, arg);}],done);" +
        "}";
      while (siguiente) {
        if (siguiente.condicion)
          resultado += "else if(" + zl.javascript.expresion(siguiente.condicion, simbolo) + "){" +
          "$exterior.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
          zl.javascript.sentencias(siguiente.sentencias, simbolo) +
          "done(null,arg);}],done);" +
          "}";
        else {
          resultado += "else{" +
            "$exterior.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
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
      return "done(null,$res);}, function(arg,done){" +
        "var " + tempvar + "=" + zl.javascript.expresion(compilado.veces, simbolo) + ";" +
        "function " + tempcallback + "(arg){" +
        "if (" + tempvar + "-- >= 1){" +
        "$exterior.async.waterfall([function(c){c(null,arg);},function(arg,done){" +
        zl.javascript.sentencias(compilado.sentencias, simbolo) +
        ";done(null,$res);}]," + tempcallback + ");}" +
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
      lista.$miembros = {v: Array.prototype.slice.call(compilado.valor)};
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
