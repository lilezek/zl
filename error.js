var modulo = function(zl) {
  "use strict";

  zl.error = zl.error || {};

  function Error(tipo, traza) {
    this.tipo = tipo;
    this.traza = traza;
    return this;
  }

  Error.prototype.hojas = function(nodo) {
    var nodo = nodo || this.traza;
    var res = [];
    if (nodo.length) {
      for (var i = 0; i < nodo.length; i++) {
        var x = Error.prototype.hojas(nodo[i]);
        res = res.concat(x);
      }
      return res;
    } else {
      return [nodo];
    }
  }

  zl.error.saltar = function(texto, posicion) {
    while (/\s/.test(texto.substr(posicion, 1)))
      posicion++;
    if (texto.substr(posicion, 2) == "//") {
      while (texto.substr(posicion, 1) != "\n")
        posicion++;
      zl.error.saltar(texto, posicion);
    }
    return posicion;
  }

  zl.error.posicionCaracter = function(texto, posicion) {
    posicion = zl.error.saltar(texto, posicion);
    var resultado = {
      linea: 1,
      columna: 1
    };
    for (var i = 0; i < posicion; i++) {
      resultado.columna += 1;
      if (texto[i] == "\n") {
        resultado.linea += 1;
        resultado.columna = 0;
      }
    }
    return resultado;
  }

  zl.error.linea = function(codigo, numeroLinea) {
    return codigo.split("\n")[numeroLinea - 1];
  }

  // Devuelve un string con un apuntador al error.
  Error.prototype.apuntador = function(codigo) {
    var hojas = this.hojas();
    var posicion = hojas[hojas.length - 1].end;
    var pos = zl.error.posicionCaracter(codigo, posicion);
    var resultado = pos.linea + "." + zl.error.linea(codigo, pos.linea) + "\n";
    for (var i = 0; i < pos.columna + (pos.linea + "").length + 1; i++)
      resultado += " ";
    return resultado + "^";
  }

  zl.error.obtenerMensaje = function(error, zlcodigo) {
    if (error.tipo == zl.error.E_PALABRA_RESERVADA) {
      var hojas = error.hojas();
      var palabra = hojas[hojas.length - 2].resultado;
      return "En la línea " + zl.error.posicionCaracter(zlcodigo, error.traza.end).linea +
        " se usa como nombre la palabra reservada '" + palabra + "'"
    } else if (error.tipo == zl.error.E_GLOBALES_INCOMPATIBLES) {
      return error.traza[0].nombre + ".\tDato '" + error.traza[0].nombre + "' global con declaraciones incompatibles\n" +
        zl.error.posicionCaracter(zlcodigo, error.traza[1].posicion[0]).linea + ".\t\tPor un lado, en la línea " + zl.error.posicionCaracter(zlcodigo, error.traza[1].posicion[0]).linea + "\n" +
        "\t\tde tipo " + error.traza[1].tipo + "\n\n" +
        zl.error.posicionCaracter(zlcodigo, error.traza[0].posicion[0]).linea + ".\t\ty por otro lado, en la línea " + zl.error.posicionCaracter(zlcodigo, error.traza[0].posicion[0]).linea + "\n" +
        "\t\tde tipo " + error.traza[0].tipo + "\n\n\n" +
        "Sugerencias: \n" +
        "1. Poner, en ambas líneas, el tipo " + error.traza[0].tipo + "\n" +
        "2. O bien, en ambas líneas, el tipo " + error.traza[1].tipo + "\n" +
        "3. No usar el modificador global\n" +
        "4. Cambiar el nombre a uno de los dos datos\n";
    } else if (error.tipo == zl.error.E_LLAMADA_NOMBRE_NO_ENCONTRADO) {
      return "Subrutina con nombre '" + error.traza["arbol"].nombre + "' no encontrada";
    } else if (error.tipo == zl.error.E_LLAMADA_DATO_INCOMPATIBLE) {
      zl.log(error);
      var t = error.traza;
      return zl.error.posicionCaracter(zlcodigo, t.posicion[0]).linea + ".\tEl dato '" + t.dato.nombre + "' ha sido introducido con un valor de tipo '" + t.obtenido.nombre + "'\n" +
        "\t\tpero debería ser de tipo '" + t.esperado.nombre + "'.";
    } else if (error.tipo == zl.error.E_ASIGNACION_INCOMPATIBLE) {
      var t = error.traza;
      return zl.error.posicionCaracter(zlcodigo, t.posicion[0]).linea + ".\tEl dato '" + t.arbol.variable + "' ha sido introducido con un valor de tipo '" + t.obtenido.nombre + "'\n" +
        "\t\tpero debería ser de tipo '" + t.esperado.nombre + "'.";
    } else if (error.tipo == zl.error.E_NOMBRE_NO_DEFINIDO) {
      var t = error.traza;
      var resultado = zl.error.posicionCaracter(zlcodigo, t.posicion[0]).linea + ".\tSe usa el nombre '" + t.nombre + "' pero no está definido.\n\n" +
        "La lista de datos definidos es la siguiente: \n";
      for (var k in t.declaraciones) {
        resultado += zl.error.posicionCaracter(zlcodigo, t.declaraciones[k].posicion[0]).linea + ".\t" + t.declaraciones[k].nombre + " es " + t.declaraciones[k].tipo.nombre + "\n";
      }
      return resultado;
    } else if (error.tipo == zl.error.E_LLAMADA_DATO_INEXISTENTE) {
      var t = error.traza;
      var resultado = zl.error.posicionCaracter(zlcodigo, t.posicion[0]).linea + ".\tSe usa el nombre '" + t.dato.izq + "' pero no está definido en la subrutina '" + t.subrutina.nombre + "'.\n\n" +
        "La lista de entradas y salidas de '" + t.subrutina.nombre + "' es la siguiente: \n";
      for (var k in t.subrutina.declaraciones) {
        resultado += "\t" + t.subrutina.declaraciones[k].nombre + " es " + t.subrutina.declaraciones[k].tipo.nombre;
        if (t.subrutina.declaraciones[k].modificadores & t.subrutina.declaraciones[k].M_ENTRADA)
          resultado += " de Entrada";
        if (t.subrutina.declaraciones[k].modificadores & t.subrutina.declaraciones[k].M_SALIDA)
          resultado += " de Salida";
        resultado += "\n";
      }
      return resultado;
    } else if (error.tipo == zl.error.E_OPERACION_TIPO_INCOMPATIBLE_BINARIO) {
      var t = error.traza;
      return zl.error.posicionCaracter(zlcodigo, t.posicion[0]).linea + ".\tEn la operación \n" +
        "\t\t" + zlcodigo.substring(t.posicion[0], t.posicion[1]) + "\n" +
        "\tel operador '" + t.op + "' no está definido para los tipos '" + t.izq.nombre + "' y '" + t.der.nombre + "'\n" +
        "\ty las dos partes cumplen:\n" +
        "\t\t" + zlcodigo.substring(t.posizq[0], t.posizq[1]) + " es " + t.izq.nombre + "\n" +
        "\t\t" + zlcodigo.substring(t.posder[0], t.posder[1]) + " es " + t.der.nombre + "\n";
    } else if (error.tipo == zl.error.E_CONDICION_NO_BOOLEANA) {
      var t = error.traza;
      var linea = zl.error.posicionCaracter(zlcodigo, t.posicion[0]).linea;
      return linea + ".\tLa condicion\n" +
        "\t" + zlcodigo.substring(t.posicion[0], t.posicion[1]).trim() + "\n" +
        "de\n" +
        "\t" + zl.error.linea(zlcodigo, linea).trim() + "\n" +
        "es de tipo '" + t.tipo.nombre + "', y las condiciones de este tipo\n" +
        "no se pueden evaluar como verdadero o falso.\n\n";
      // TODO: generar ejemplos automáticos con la expresión.
      //"Ejemplos correctos:\n"
      //"10 > 15"
    } else if (error.tipo == zl.error.E_VECES_NO_NUMERICO) {
      var t = error.traza;
      var linea = zl.error.posicionCaracter(zlcodigo, t.posicion[0]).linea;
      return linea + ".\tEn el repetir\n" +
        "\t" + zl.error.linea(zlcodigo, linea).trim() + "\n" +
        "dentro:\n" +
        "\t" + zlcodigo.substring(t.posicion[0], t.posicion[1]).trim() + "\n" +
        "debería ser un número, o una expresión que genere un número,\n"+
        "sin embargo es un/a '" + t.tipo.nombre + "'.";
      // TODO: generar ejemplos automáticos con la expresión.
      //"Ejemplos correctos:\n"
      //"10 > 15"
    }
    if (error.tipo == zl.error.E_SIMBOLO) {
      zl.log(error);
      return "Error genérico:\n\n" +
        error.apuntador(zlcodigo);
    }
    return Object.keys(zl.error).filter(function(key) {
      zl.log(error);
      return zl.error[key] === error.tipo
    })[0];
  }

  // distintos errores:
  zl.error.E_SIMBOLO = 1;
  zl.error.E_PALABRA_RESERVADA = 2;
  zl.error.E_NOMBRE_SUBRUTINA_YA_USADO = 3;
  zl.error.E_NOMBRE_DATO_YA_USADO = 4;
  zl.error.E_MODIFICADOR_REPETIDO = 5;
  zl.error.E_USO_INDEBIDO_MODIFICADOR_GLOBAL = 6;
  zl.error.E_GLOBALES_INCOMPATIBLES = 7;
  zl.error.E_LLAMADA_NOMBRE_NO_ENCONTRADO = 8;
  zl.error.E_LLAMADA_DATO_INEXISTENTE = 9;
  zl.error.E_LLAMADA_DATO_INCOMPATIBLE = 10;
  zl.error.E_LLAMADA_DATOS_INCOMPLETOS = 11;
  zl.error.E_NOMBRE_NO_DEFINIDO = 12;
  zl.error.E_OPERACION_TIPO_INCOMPATIBLE_BINARIO = 13;
  zl.error.E_OPERACION_NO_DEFINIDA = 14;
  zl.error.E_CONDICION_NO_BOOLEANA = 15;
  zl.error.E_VECES_NO_NUMERICO = 16;
  zl.error.E_ASIGNACION_INCOMPATIBLE = 17;
  zl.error.E_TIPO_NO_EXISTE = 18;
  zl.error.E_FLECHA_INCORRECTA = 19;
  zl.error.E_ACCESO_A_DATO_LOCAL = 20;
  zl.error.E_LECTURA_ILEGAL = 21;
  zl.error.E_ESCRITURA_ILEGAL = 22;
  zl.error.E_INDICE_NO_LISTA_NO_RELACION = 23;

  zl.error.newError = function(a, b) {
    return new Error(a, b);
  }

  zl.error.esError = function(err) {
    return err && err.constructor && err.constructor.name === "Error";
  }
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
