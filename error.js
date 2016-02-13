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
      posicion = zl.error.saltar(texto, posicion);
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
    var resultado = zl.error.linea(codigo, pos.linea).replace(/ /g, "&nbsp;").replace(/\n/g, "<br>") + "<br>";
    for (var i = 0; i < pos.columna; i++)
      resultado += "&nbsp;";
    return resultado + "^";
  }

  zl.error.obtenerMensaje = function(error, zlcodigo) {
    if (error.tipo == zl.error.E_PALABRA_RESERVADA) {
      var hojas = error.hojas();
      var palabra = hojas[hojas.length - 2].resultado;
      if (palabra === "$error$")
        console.log(error);
      return "En la línea " + zl.error.posicionCaracter(zlcodigo, error.traza.end).linea +
        " se usa como nombre la palabra reservada '" + palabra + "'"
    } else if (error.tipo == zl.error.E_GLOBALES_INCOMPATIBLES) {

    } else if (error.tipo == zl.error.E_LLAMADA_NOMBRE_NO_ENCONTRADO) {

    } else if (error.tipo == zl.error.E_LLAMADA_DATO_INCOMPATIBLE) {
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
        "debería ser un número, o una expresión que genere un número,\n" +
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

  function TarjetaError(error, zlcodigo) {
    console.log(error);
    this.lineas = [];
    if (error.tipo == zl.error.E_SIMBOLO) {
      var hojas = error.hojas();
      this.posicion = hojas[hojas.length - 1].end;
      var tmp = zl.error.posicionCaracter(zlcodigo, this.posicion);
      this.lineas.push(this.linea = tmp.linea);
      this.columna = tmp.columna;

      this.mensajeError = "Error genérico.<br>" +
        this.htmlLinea(this.linea, this.columna) +
        this.htmlCodigo(error.apuntador(zlcodigo));
      if (this.linea > 0) {
        this.mensajeError += "<br>" +
          "Nota, es posible que el error esté en la línea anterior:<br>" +
          this.htmlLinea(this.linea - 1, 999) +
          this.htmlCodigo(zl.error.linea(zlcodigo, this.linea - 1));
      }
    } else {
      // TODO: Unificar la información que se pasa por los errores:
      this.posicion = zl.error.saltar(zlcodigo, (error.traza.arbol ? error.traza.arbol.begin : null) ||
        (error.traza.posicion ? error.traza.posicion[0] : null) ||
        (error.traza[0] && error.traza[0].posicion ? error.traza[0].posicion[0] : null)
      );
      var tmp = zl.error.posicionCaracter(zlcodigo, this.posicion);
      this.lineas.push(this.linea = tmp.linea);
      this.columna = tmp.columna;
      this.mensajeError = "Error: en la línea <br>" +
        this.htmlLinea(this.linea, this.columna) + this.htmlCodigo(zl.error.linea(zlcodigo, this.linea)) + "<br>";
      if (error.tipo === zl.error.E_PALABRA_RESERVADA) {

      } else if (error.tipo === zl.error.E_NOMBRE_SUBRUTINA_YA_USADO) {

      } else if (error.tipo === zl.error.E_NOMBRE_DATO_YA_USADO) {

      } else if (error.tipo === zl.error.E_MODIFICADOR_REPETIDO) {

      } else if (error.tipo === zl.error.E_USO_INDEBIDO_MODIFICADOR_GLOBAL) {

      } else if (error.tipo === zl.error.E_GLOBALES_INCOMPATIBLES) {
        var tmp2 = zl.error.posicionCaracter(zlcodigo, error.traza[1].posicion[0]);
        this.lineas = this.lineas.concat([tmp.linea, tmp2.linea]);
        console.log(this.lineas);
        this.mensajeError += "y en la línea <br>" +
          this.htmlLinea(tmp2.linea, tmp2.columna) + this.htmlCodigo(zl.error.linea(zlcodigo, tmp2.linea)) + "<br>" +
          "Las dos líneas definen el dato con tipos que no son compatibles:<br>" +
          "el tipo " + this.htmlTipo(error.traza[0].tipo) + " es incompatible con el tipo " + this.htmlTipo(error.traza[1].tipo);
      } else if (error.tipo === zl.error.E_LLAMADA_NOMBRE_NO_ENCONTRADO) {
        this.mensajeError += "Subrutina con nombre '" + this.htmlSubrutina(error.traza["arbol"].nombre) +
          "' no encontrada.<br>" +
          // TODO: Encontrar similitudes por algún algoritmo como la distancia de
          // Levensthein
          "La lista de subrutinas definidas es:<br>";
        for (var i = 0; i < error.traza.tabla.length; i++) {
          this.mensajeError += this.htmlSubrutina(error.traza.tabla[i]) + "<br>";
        }
      } else if (error.tipo === zl.error.E_LLAMADA_DATO_INEXISTENTE) {
        var t = error.traza;
        this.mensajeError += "Se usa el nombre " + this.htmlDato(t.dato.izq) + " pero no está definido en la subrutina " + this.htmlSubrutina(t.subrutina.nombre) + "<br>" +
          "La lista de entradas y salidas de " + this.htmlSubrutina(t.subrutina.nombre) + " es:<br>";
        for (var k in t.subrutina.declaraciones) {
          this.mensajeError += this.htmlDato(t.subrutina.declaraciones[k].nombre) + " es " + this.htmlTipo(t.subrutina.declaraciones[k].tipo);
          if (t.subrutina.declaraciones[k].modificadores & t.subrutina.declaraciones[k].M_ENTRADA)
            this.mensajeError += " de Entrada";
          if (t.subrutina.declaraciones[k].modificadores & t.subrutina.declaraciones[k].M_SALIDA)
            this.mensajeError += " de Salida";
          this.mensajeError += "<br>";
        }
      } else if (error.tipo === zl.error.E_LLAMADA_DATO_INCOMPATIBLE) {
        var t = error.traza;
        console.log(t);
        this.mensajeError += "El dato "+this.htmlDato(t.dato.nombre) + " ha sido introducido con un valor de tipo "+
          this.htmlTipo(t.obtenido) + "<br>" +
          "pero debería ser de tipo "+ this.htmlTipo(t.esperado);
      } else if (error.tipo === zl.error.E_LLAMADA_DATOS_INCOMPLETOS) {

      } else if (error.tipo === zl.error.E_NOMBRE_NO_DEFINIDO) {

      } else if (error.tipo === zl.error.E_OPERACION_TIPO_INCOMPATIBLE_BINARIO) {
        var t = error.traza;
        this.mensajeError += "En la operación<br>" + this.htmlCodigo(zlcodigo.substring(t.posicion[0], t.posicion[1]))+"<br>"+
          "el operador " + this.htmlCodigo(t.op) + " no está definido para los tipos " +
          this.htmlTipo(t.izq) + " y " + this.htmlTipo(t.der) + "<br>" +
          "y las dos partes cumplen:<br>" +
          this.htmlCodigo(zlcodigo.substring(t.posizq[0], t.posizq[1])) + " es " + this.htmlTipo(t.izq)+ "<br>" +
          this.htmlCodigo(zlcodigo.substring(t.posder[0], t.posder[1])) + " es " + this.htmlTipo(t.der)+ "<br>";
      } else if (error.tipo === zl.error.E_OPERACION_NO_DEFINIDA) {

      } else if (error.tipo === zl.error.E_CONDICION_NO_BOOLEANA) {

      } else if (error.tipo === zl.error.E_VECES_NO_NUMERICO) {

      } else if (error.tipo === zl.error.E_ASIGNACION_INCOMPATIBLE) {
        // TODO: Que esta división no sea necesaria
        // TODO: Incluir la declaración del dato
        var partes = zlcodigo.substring(this.posicion, error.traza.posicion[1]).split("<-");
        this.mensajeError += "La expresión "+this.htmlCodigo(partes[1])+"<br>"+
          "genera un valor de tipo <span class='tipo'>" + error.traza.obtenido.nombre + "</span><br>" +
          "pero el dato <span class='dato'>" + error.traza.arbol.variable +
          "</span> es de tipo <span class='tipo'>" + error.traza.esperado.nombre + "</span>";
      } else if (error.tipo === zl.error.E_TIPO_NO_EXISTE) {

      } else if (error.tipo === zl.error.E_FLECHA_INCORRECTA) {
        this.mensajeError += "La flecha "+this.htmlCodigo(error.traza.obtenido)+
          " debería ser la flecha "+this.htmlCodigo(error.traza.esperado);
      } else if (error.tipo === zl.error.E_ACCESO_A_DATO_LOCAL) {

      } else if (error.tipo === zl.error.E_LECTURA_ILEGAL) {

      } else if (error.tipo === zl.error.E_ESCRITURA_ILEGAL) {

      } else if (error.tipo === zl.error.E_INDICE_NO_LISTA_NO_RELACION) {

      } else if (error.tipo === zl.error.E_EJECUCION_INDICE_DESCONTROLADO) {

      }
    }
    return this;
  }

  TarjetaError.prototype.getHtml = function() {
    var html = "<div class='error'>";
    html += this.mensajeError;
    html += "</div>"
    return html;
  }

  TarjetaError.prototype.htmlCodigo = function(codigo) {
    return "<span class='codigo'>" + codigo.trim() + "</span>";
  }

  TarjetaError.prototype.htmlTipo = function(tipo) {
    return "<span class='tipo'>" + tipo.nombre + "</span>";
  }

  // TODO: Recibir el dato y no el nombre
  TarjetaError.prototype.htmlDato = function(nombre) {
    return "<span class='dato'>" + nombre + "</span>";
  }

  // TODO: Recibir la subrutina y no el nombre
  TarjetaError.prototype.htmlSubrutina = function(nombre) {
    return "<span class='subrutina'>" + nombre + "</span>";
  }

  TarjetaError.prototype.htmlLinea = function(linea, columna) {
    return "<span class='linea' onclick='return saltarAlCodigo(" + (linea - 1) + "," + (columna) + ");'>" + linea + "</span>";
  }

  TarjetaError.prototype.lineasDeError = function() {
    return this.lineas;
  }

  zl.error.obtenerMensajeHtml = function(error, zlcodigo) {
    return new TarjetaError(error, zlcodigo);
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
  zl.error.E_EJECUCION_INDICE_DESCONTROLADO = 24;

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
