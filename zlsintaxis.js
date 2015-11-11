var zl = zl || {};
zl.sintaxis = zl.sintaxis || {};

(function() {
  "use strict";

  // Sintaxis de zl
  var zls = {};

  // Sintaxis de configuración de zl
  var zlc = {};

  zl.sintaxis.cargar = function() {
    // Palabras reservadas:
    var palabrasReservadas = {
      "no": true,
      "y": true,
      "o": true,
      "si": true,
      "hacer": true,
      "fin": true
    };

    // Conjunto de las reglas:
    var reglas = {};

    // Símbolos (terminales):
    var $ = {};
    var nombreSimple = zl.analizador.newSimbolo(/^([A-Za-záéíóúÁÉÍÓÚñÑ][A-Za-záéíóúÁÉÍÓÚñÑ0-9]*)/, "nombreSimple");
    $["<-"] = zl.analizador.newSimbolo(/^(<-)/i, "<-");
    $["."] = zl.analizador.newSimbolo(/^(\.)/i, ".");
    $["-"] = zl.analizador.newSimbolo(/^(-)/i, "-");
    $["+"] = zl.analizador.newSimbolo(/^(\+)/i, "+");
    $["no"] = zl.analizador.newSimbolo(/^(no)/i, "no");
    $["y"] = zl.analizador.newSimbolo(/^(y)/i, "y");
    $["o"] = zl.analizador.newSimbolo(/^(o)/i, "o");
    $["<"] = zl.analizador.newSimbolo(/^(<)/i, "<");
    $[">"] = zl.analizador.newSimbolo(/^(>)/i, ">");
    $["<="] = zl.analizador.newSimbolo(/^(<=)/i, "<=");
    $[">="] = zl.analizador.newSimbolo(/^(>=)/i, ">=");
    $["="] = zl.analizador.newSimbolo(/^(=)/i, "=");
    $["<>"] = zl.analizador.newSimbolo(/^(<>)/i, "<>");
    $["+"] = zl.analizador.newSimbolo(/^(\+)/i, "+");
    $["-"] = zl.analizador.newSimbolo(/^(-)/i, "-");
    $["*"] = zl.analizador.newSimbolo(/^(\*)/i, "*");
    $["/"] = zl.analizador.newSimbolo(/^(\/)/i, "/");
    $[")"] = zl.analizador.newSimbolo(/^(\))/i, ")");
    $["("] = zl.analizador.newSimbolo(/^(\()/i, "(");
    $["hacer"] = zl.analizador.newSimbolo(/^(hacer)/i, "hacer");
    $["si"] = zl.analizador.newSimbolo(/^(si)/i, "si");
    $["fin"] = zl.analizador.newSimbolo(/^(fin)/i, "fin");
    $["verdadero"] = zl.analizador.newSimbolo(/^(verdadero)/i, "verdadero");
    $["falso"] = zl.analizador.newSimbolo(/^(falso)/i, "falso");
    $["imposible"] = zl.analizador.newSimbolo(/^(?!x)x/i, "imposible");
    $["nada"] = zl.analizador.newSimbolo(/^/i, "nada");
    var espacio = zl.analizador.newSimbolo(/^([ \n\t]+)/i, "espacio");
    var comentario = zl.analizador.newSimbolo(/^(\/\/.*)/i, "comentario");
    var numero = zl.analizador.newSimbolo(/^((?:[0-1]+(?:\|2))|(?:[0-9A-Fa-f]+(?:\|16))|(?:[0-9]+(?:\|10)?))/i, "numero");
    var texto = zl.analizador.newSimbolo(/^\"([^"\\]|\\.|\\\n)*\"/i, "texto");
    var letra = zl.analizador.newSimbolo(/^\'([^"\\]|\\.|\\\n)*\'/i, "letra");

    // Reglas básicas
    reglas["_"] = zl.analizador.newExpresion([
      [espacio, "_"],
      [comentario, "_"],
      [espacio],
      [comentario]
    ], "espacios o comentarios")

    reglas[" "] = zl.analizador.newExpresion([
      ["_"],
      [$["nada"]]
    ], "espacios opcionales");

    // Reglas encontradas en el BNF:
    reglas["nombre"] = zl.analizador.newExpresion([
      [nombreSimple, $["."], "nombre"],
      [nombreSimple]
    ], "nombre");

    reglas["sentencia"] = zl.analizador.newExpresion([
      ["asignacion"],
      [$["imposible"]], // TODO
      [$["imposible"]], // TODO
      ["sicondicional"]
    ], "sentencia")

    reglas["sentencia+"] = zl.analizador.newExpresion([
      ["sentencia", " ", "sentencia+"],
      ["sentencia"]
    ], "lista de sentencias");

    reglas["asignacion"] = zl.analizador.newExpresion([
      ["nombre", " ", $["<-"], " ", "expresion"]
    ], "asignacion");

    reglas["sicondicional"] = zl.analizador.newExpresion([
      [$["si"], "_", "expresion", "_", $["hacer"], "_", "sentencia+", "_", $["fin"]],
      [$["si"], "_", "expresion", "_", $["hacer"], "_", "sentencia+", "_", "sinocondicional"],
      [$["si"], "_", "expresion", "_", $["hacer"], "_", "sentencia+", "_", "sino"]
    ], "si condicional");

    reglas["sinocondicional"] = zl.analizador.newExpresion([
      [$["o"], "_", $["si"], "_", "expresion", "_", $["hacer"], "_", "sentencia+", "_", $["fin"]],
      [$["o"], "_", $["si"], "_", "expresion", "_", $["hacer"], "_", "sentencia+", "_", "sinocondicional"],
      [$["o"], "_", $["si"], "_", "expresion", "_", $["hacer"], "_", "sentencia+", "_", "sino"]
    ], "si no condicional");

    reglas["sino"] = zl.analizador.newExpresion([
      [$["si"], "_", $["no"], "_", $["hacer"], "_", "sentencia+", "_", $["fin"]]
    ], "si no");


    reglas["expresion"] = zl.analizador.newExpresion([
      ["expresionTercera", " ", "operadorBinarioCuarto", " ", "expresion"],
      ["expresionTercera"]
    ], "expresion")

    reglas["expresionTercera"] = zl.analizador.newExpresion([
      ["expresionSegunda", " ", "operadorBinarioTercero", " ", "expresionTercera"],
      ["expresionSegunda"]
    ], "expresionTercera")

    reglas["expresionSegunda"] = zl.analizador.newExpresion([
      ["expresionPrimera", " ", "operadorBinarioSegundo", " ", "expresionSegunda"],
      ["expresionPrimera"]
    ], "expresionSegunda")

    reglas["expresionPrimera"] = zl.analizador.newExpresion([
      ["evaluacion", " ", "operadorBinarioPrimero", " ", "expresionPrimera"],
      ["evaluacion"],
      ["operadorUnario", " ", "expresion"]
    ], "expresionPrimera")

    reglas["evaluacion"] = zl.analizador.newExpresion([
      [numero],
      [texto],
      [letra],
      [$["verdadero"]],
      [$["falso"]],
      ["nombre"],
      [$["("], " ", "expresion", " ", $[")"]]
    ], "evaluacion")

    reglas["operadorUnario"] = zl.analizador.newExpresion([
      [$["-"]],
      [$["+"]],
      [$["no"]]
    ], "operadorUnario")

    reglas["operadorBinarioCuarto"] = zl.analizador.newExpresion([
      [$["y"]],
      [$["o"]]
    ], "operadorBinarioCuarto")

    reglas["operadorBinarioTercero"] = zl.analizador.newExpresion([
      [$["<"]],
      [$[">"]],
      [$["<="]],
      [$[">="]],
      [$["="]],
      [$["<>"]]
    ], "operadorBinarioTercero")

    reglas["operadorBinarioSegundo"] = zl.analizador.newExpresion([
      [$["+"]],
      [$["-"]]
    ], "operadorBinarioSegundo")

    reglas["operadorBinarioPrimero"] = zl.analizador.newExpresion([
      [$["*"]],
      [$["/"]]
    ], "operadorBinarioPrimero")

    // Comportamiento de las reglas:
    reglas["nombre"].error = function(datos, opcion, posicion) {
      var nombre = datos[0];
      if (opcion == 0) {
        nombre = datos[0] + datos[1] + datos[2];
      }
      if (nombre in palabrasReservadas) {
        return zl.error.E_PALABRA_RESERVADA;
      }
    }

    reglas["nombre"].postproceso = function(datos, opcion) {
      var nombre = datos[0];
      if (opcion == 0) {
        nombre = datos[0] + datos[1] + datos[2];
      }
      return nombre;
    }

    reglas["sentencia+"].postproceso = function(datos, opcion) {
      if (opcion == 0)
        return [datos[0]].concat(datos[2]);
      else
        return [datos[0]];
    }

    reglas["sentencia"].postproceso = function(datos, opcion) {
      var s = datos[0];
      if (opcion == 0) {
        s.tipo = "asignacion";
      } else if (opcion == 1) {

      } else if (opcion == 2) {

      } else if (opcion == 3) {

      } else if (opcion == 4) {
        s.tipo = "sicondicional";
      }
      return s;
    }

    reglas["asignacion"].postproceso = function(datos) {
      return {
        variable: datos[0],
        valor: datos[4]
      }
    }

    reglas["sicondicional"].postproceso = function(datos, opcion) {
      var d = {};
      d.condicion = datos[2];
      d.sentencias = datos[6];
      if (opcion == 1 || opcion == 2) {
        d.siguiente = datos[8];
      }
      return d;
    }

    reglas["sinocondicional"].postproceso = function(datos, opcion) {
      var d = {};
      d.condicion = datos[4];
      d.sentencias = datos[8];
      if (opcion == 1 || opcion == 2) {
        d.siguiente = datos[10];
      }
      return d;
    }

    reglas["sino"].postproceso = function(datos, opcion) {
      var d = {};
      d.sentencias = datos[6];
      return d;
    }

    reglas["expresion"].postproceso = reglas["expresionPrimera"].postproceso = reglas["expresionSegunda"].postproceso = reglas["expresionTercera"].postproceso = function(datos, opcion) {

      var izq;
      var der;
      var op;
      if (opcion == 0) {
        izq = datos[0];
        der = datos[4];
        op = datos[2];
      } else if (this.nombre == "expresionPrimera" && opcion == 2) {
        der = datos[2];
        op = datos[0];
      }
      // Hack, intercambiar el orden de reducción si las reglas son del mismo nivel
      if (izq && der && der.nivel == this.nombre && der.izq) {
        var _der = der.der;
        var _op = der.op;
        var _izq = {};
        _izq.der = der.izq;
        _izq.op = op;
        _izq.izq = izq;
        op = _op;
        der = _der;
        izq = _izq;
      }
      if (izq && op && der)
        return {
          izq: izq,
          der: der,
          op: op,
          nivel: this.nombre
        };
      else if (der && op)
        return {
          der: der,
          op: op,
          nivel: this.nombre
        };
      else
        return datos[0];
    }

    reglas["evaluacion"].postproceso = function(datos, opcion) {
      if (opcion == 0) {
        var partes = datos[0].split("|");
        var num = parseInt(partes[0],partes[1]);
        return num;
      }
      else if (opcion < 6)
        return datos[0];
      return {
        der: datos[2],
        op: "()"
      };
    }

    reglas["operadorUnario"].postproceso =
      reglas["operadorBinarioCuarto"].postproceso =
      reglas["operadorBinarioTercero"].postproceso =
      reglas["operadorBinarioSegundo"].postproceso =
      reglas["operadorBinarioPrimero"].postproceso = function(datos, opcion) {
        return datos[0];
      }



    // Preparar las reglas:
    zl.analizador.prepararReglas(reglas);

    // Cargar la sintaxis
    zl.sintaxis.sintaxisConfiguracion = zlc;
    zl.sintaxis.reglasCodigo = reglas;
  }
})();
