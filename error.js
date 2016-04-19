var modulo = function(zl) {
  "use strict";

  var espaciosPorTabulacion = "  ";

  zl.error = zl.error || {};

  function Error() {
    this.representacion = "";
    this.flags = {
      html: (typeof require !== "function")
    };
    this.indentacion = 0;
    this._lineas = [];
    this.codigo = "";

    Object.defineProperty(this, "lineasDeError", {
      get: function() {
        return this._lineas;
      },
      set: function(v) {
        if (Object.prototype.toString.call(v) === '[object Array]') {
          this._lineas = v;
        } else {
          this._lineas.push(v);
        }
      }
    });

    return this;
  }

  Error.prototype.texto = function(t) {
    var tab = espaciosPorTabulacion;
    var self = this;
    t.replace(/\n/g, function() {
      return self._nlinea();
    });
    if (this.flags.html) {
      tab = tab.replace(/ /g, "&nbsp;");
    }
    t.replace(/\t/g, tab);
    this.representacion += t;
    return this;
  }

  Error.prototype._nlinea = function() {
    var resultado = "";
    if (this.flags.html) {
      resultado += "<br>";
    } else {
      for (var i = 0; i < this.indentacion; i++)
        resultado += "\t";
      resultado += "\n";
    }
    return resultado;
  }

  Error.prototype.nuevaLinea = function() {
    this.representacion += this._nlinea();
    return this;
  }

  Error.prototype.subrutina = function(sub) {
    var html = this.flags.html;
    if (typeof sub === "string") {
      this.representacion += (html ? "<span class='subrutina'>" : "") +
        sub +
        (html ? "</span>" : "");
    } else if (typeof sub === "object") {
      this.representacion += (html ? "<span class='subrutina'>" : "") +
        sub.nombre +
        (html ? "</span>" : "");
    }
    return this;
  }

  Error.prototype.dato = function(dato) {
    var html = this.flags.html;
    if (typeof dato === "string") {
      this.representacion += (html ? "<span class='dato'>" : "") +
        dato +
        (html ? "</span>" : "");
    } else if (typeof dato === "object") {
      this.representacion += (html ? "<span class='dato'>" : "") +
        dato.nombre +
        (html ? "</span>" : "");
    }
    return this;
  }

  function recursivoTipoInstancia(dato) {
    var resultado;
    if (dato.tipo) {
      resultado = dato.tipo.nombre;
      if (dato.genericos.length)
      resultado += "(";
      var coma = "";
      for (var i = 0; i < dato.genericos.length; i++) {
        resultado += coma +  recursivoTipoInstancia(dato.genericos[i]);
        coma = ",";
      }
      if (dato.genericos.length)
      resultado += ")";
    }
    else
      resultado = ""+dato;
    return resultado;
  }

  Error.prototype.tipo = function(tipo) {
    var html = this.flags.html;
    if (typeof tipo === "string") {
      this.representacion += (html ? "<span class='tipo'>" : "") +
        tipo +
        (html ? "</span>" : "");
    } else if (typeof tipo === "object") {
      this.representacion += (html ? "<span class='tipo'>" : "") +
        recursivoTipoInstancia(tipo) +
        (html ? "</span>" : "");
    }
    return this;
  }

  Error.prototype.resaltarLinea = function(posicion) {
    // TODO: resaltar la línea correctamente en la opción no html
    if (this.flags.html)
      this.representacion += "<span class='linea' onclick='saltarAlCodigo($linea{" + (posicion + 1) + "},0);'>$linea{" + (posicion + 1) + "}</span>";
    else
      this.representacion += "Posicion: $linea{" + (posicion + 1) + "}\n";
    return this;
  }

  Error.prototype.indentar = function() {
    this.indentacion += 1;
    if (this.flags.html) {
      this.representacion += "<span class='indentacion error'>";
    }
    return this;
  }

  Error.prototype.desindentar = function() {
    this.indentacion -= 1;
    if (this.flags.html) {
      this.representacion += "</span>";
    }
    return this;
  }

  Error.prototype.vincularCodigo = function(codigo) {
    this.codigo = codigo;
    this.lineasDeError = [];
  }

  Error.prototype.toString = function() {
    var self = this;
    if (this.indentacion != 0) {
      throw "La indentacion no es correcta. Se ha terminado de construir el error con " + this.indentacion + " indentaciones.";
    }
    if (this.flags.html) {
      var r = this.representacion.replace(/\$linea\{(\d*)\}/ig, function(match, p1) {
        // Contar lineas hasta la posición:
        var linea = (self.codigo.substring(0, parseInt(p1)).split("\n").length);
        self.lineasDeError = linea;
        return "" + linea;
      });
      return "<div class='error'>" + r + "</div>";
    } else {
      var r = this.representacion.replace(/\$linea\{(\d*)\}/ig, function(match, p1) {
        // Contar lineas hasta la posición:
        var linea = (self.codigo.substring(0, parseInt(p1)).split("\n").length);
        self.lineasDeError = linea;
        return "" + linea;
      });
      return r;
    }
  }

  zl.error.newError = function(constructor, informacion) {
    var err = new Error();
    constructor.call(err, informacion);
    return err;
  }

  zl.error.esError = function(err) {
    return err && err.constructor && err.constructor.name === "Error";
  }

  // distintos errores:
  zl.error.E_SIMBOLO = function(informacion) {
    this.enumeracion = 1;
    this.identificador = "E_SIMBOLO";
    this
      .resaltarLinea(informacion.begin)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_PALABRA_RESERVADA = function(informacion) {
    this.enumeracion = 2;
    this.identificador = "E_PALABRA_RESERVADA";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_NOMBRE_SUBRUTINA_YA_USADO = function(informacion) {
    this.enumeracion = 3;
    this.identificador = "E_NOMBRE_SUBRUTINA_YA_USADO";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_NOMBRE_DATO_YA_USADO = function(informacion) {
    this.enumeracion = 4;
    this.identificador = "E_NOMBRE_DATO_YA_USADO";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_MODIFICADOR_REPETIDO = function(informacion) {
    this.enumeracion = 5;
    this.identificador = "E_MODIFICADOR_REPETIDO";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_USO_INDEBIDO_MODIFICADOR_GLOBAL = function(informacion) {
    this.enumeracion = 6;
    this.identificador = "E_USO_INDEBIDO_MODIFICADOR_GLOBAL";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_GLOBALES_INCOMPATIBLES = function(informacion) {
    this.enumeracion = 7;
    this.identificador = "E_GLOBALES_INCOMPATIBLES";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_LLAMADA_NOMBRE_NO_ENCONTRADO = function(informacion) {
    this.enumeracion = 8;
    this.identificador = "E_LLAMADA_NOMBRE_NO_ENCONTRADO";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_LLAMADA_DATO_INEXISTENTE = function(informacion) {
    this.enumeracion = 9;
    this.identificador = "E_LLAMADA_DATO_INEXISTENTE";
    this
      .resaltarLinea(informacion.posicion[0])
      .texto("Error: la subrutina ")
      .subrutina(informacion.subrutina)
      .texto(" no tiene ningún dato de entrada ")
      .dato(informacion.dato.izq)
      .nuevaLinea()
      .texto("Los datos de la subrutina son: ")
      .nuevaLinea()
      .indentar();
    for (var k in informacion.subrutina.declaraciones) {
      this
        .dato(informacion.subrutina.declaraciones[k])
        .texto(" es ")
        .tipo(informacion.subrutina.declaraciones[k].tipoInstancia)
        .nuevaLinea();
    }
    this.desindentar();
  }
  zl.error.E_LLAMADA_DATO_INCOMPATIBLE = function(informacion) {
    this.enumeracion = 10;
    this.identificador = "E_LLAMADA_DATO_INCOMPATIBLE";
    this
      .resaltarLinea(informacion.posicion[0])
      .texto("En la llamada a ")
      .subrutina(informacion.dato.padre)
      .texto(" el dato ")
      .dato(informacion.dato)
      .nuevaLinea()
      .texto(" debería ser de tipo ")
      .tipo(informacion.esperado)
      .nuevaLinea()
      .texto(" pero el valor dado es de tipo ")
      .tipo(informacion.obtenido)
  }
  zl.error.E_LLAMADA_DATOS_INCOMPLETOS = function(informacion) {
    this.enumeracion = 11;
    this.identificador = "E_LLAMADA_DATOS_INCOMPLETOS";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_NOMBRE_NO_DEFINIDO = function(informacion) {
    this.enumeracion = 12;
    this.identificador = "E_NOMBRE_NO_DEFINIDO";
    console.log(informacion);
    this
      .resaltarLinea(informacion.posicion[0])
      .texto("Error: el dato con nombre ")
      .dato(informacion.nombre)
      .texto(" no existe")
      .nuevaLinea()
      .texto("La lista de los datos actualmente declarados son: ")
      .nuevaLinea()
      .indentar();
    for (var k in informacion.declaraciones) {
      this
        .dato(informacion.declaraciones[k])
        .texto(" es ")
        .tipo(informacion.declaraciones[k].tipo)
        .nuevaLinea();
    }
    this.desindentar();

  }
  zl.error.E_OPERACION_TIPO_INCOMPATIBLE_BINARIO = function(informacion) {
    this.enumeracion = 13;
    this.identificador = "E_OPERACION_TIPO_INCOMPATIBLE_BINARIO";
    console.log(informacion);
    this
      .resaltarLinea(informacion.posicion[0])
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_OPERACION_NO_DEFINIDA = function(informacion) {
    console.log(informacion);
    this.enumeracion = 14;
    this.identificador = "E_OPERACION_NO_DEFINIDA";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_CONDICION_NO_BOOLEANA = function(informacion) {
    this.enumeracion = 15;
    this.identificador = "E_CONDICION_NO_BOOLEANA";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_VECES_NO_NUMERICO = function(informacion) {
    this.enumeracion = 16;
    this.identificador = "E_VECES_NO_NUMERICO";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_ASIGNACION_INCOMPATIBLE = function(informacion) {
    this.enumeracion = 17;
    this.identificador = "E_ASIGNACION_INCOMPATIBLE";
    this
      .resaltarLinea(informacion.posicion[0])
      .texto("Error: a la izquierda de la flecha está el dato ")
      .nuevaLinea()
      .dato(informacion.arbol.variable)
      .texto(" que es de tipo ")
      .tipo(informacion.esperado)
      .nuevaLinea()
      .texto(" pero la parte derecha de la flecha es una expresión de tipo ")
      .nuevaLinea()
      .tipo(informacion.obtenido);
  }
  zl.error.E_TIPO_NO_EXISTE = function(informacion) {
    this.enumeracion = 18;
    this.identificador = "E_TIPO_NO_EXISTE";
    this
      .resaltarLinea(informacion.posicion[0])
      .texto("El tipo ")
      .tipo(informacion.tipo)
      .texto(" no existe");
  }
  zl.error.E_FLECHA_INCORRECTA = function(informacion) {
    this.enumeracion = 19;
    this.identificador = "E_FLECHA_INCORRECTA";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_ACCESO_A_DATO_LOCAL = function(informacion) {
    this.enumeracion = 20;
    this.identificador = "E_ACCESO_A_DATO_LOCAL";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_LECTURA_ILEGAL = function(informacion) {
    this.enumeracion = 21;
    this.identificador = "E_LECTURA_ILEGAL";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_ESCRITURA_ILEGAL = function(informacion) {
    this.enumeracion = 22;
    this.identificador = "E_ESCRITURA_ILEGAL";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_INDICE_NO_LISTA_NO_RELACION = function(informacion) {
    this.enumeracion = 23;
    this.identificador = "E_INDICE_NO_LISTA_NO_RELACION";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_CONVERSOR_NO_EXISTE = function(informacion) {
    this.enumeracion = 24;
    this.identificador = "E_CONVERSOR_NO_EXISTE";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_EJECUCION_INDICE_DESCONTROLADO = function(informacion) {
    this.enumeracion = 500;
    this.identificador = "E_EJECUCION_INDICE_DESCONTROLADO";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }
  zl.error.E_EJECUCION_CONVERSION_INVALIDA = function(informacion) {
    this.enumeracion = 501;
    this.identificador = "E_EJECUCION_CONVERSION_INVALIDA";
    this
      .resaltarLinea(1, 1)
      .texto("Error: " + this.identificador)
      .indentar()
      .texto("identacion")
      .indentar()
      .texto("identacion")
      .desindentar()
      .texto("desindentar")
      .desindentar();
  }

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
