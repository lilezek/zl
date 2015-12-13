var zl = zl || {};
zl.sintaxis = zl.sintaxis || {};

(function() {
  "use strict";

  // Función auxiliar que sobreescribe un objeto con un json
  zl.writeJson = function(obj, json) {
    for (var k in json) {
      obj[k] = json[k];
    }
  }

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
      "hacer": true,
      "si": true,
      "fin": true,
      "verdadero": true,
      "falso": true,
      "imposible": true,
      //"nada": true,
      "veces": true,
      "repetir": true,
      "mientras": true,
      "subrutina": true,
      "externa": true,
      "es": true,
      "rapida": true,
      "entrada": true,
      "salida": true,
      "de": true,
      "datos": true,
      "algoritmo": true,
      "global": true
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
    $["["] = zl.analizador.newSimbolo(/^(\[)/i, "[");
    $["]"] = zl.analizador.newSimbolo(/^(\])/i, "]");
    $["->"] = zl.analizador.newSimbolo(/^(->)/i, "->");
    $["%"] = zl.analizador.newSimbolo(/^(%)/i, "%");

    $["hacer"] = zl.analizador.newSimbolo(/^(hacer)/i, "hacer");
    $["si"] = zl.analizador.newSimbolo(/^(si)/i, "si");
    $["fin"] = zl.analizador.newSimbolo(/^(fin)/i, "fin");
    $["verdadero"] = zl.analizador.newSimbolo(/^(verdadero)/i, "verdadero");
    $["falso"] = zl.analizador.newSimbolo(/^(falso)/i, "falso");
    $["imposible"] = zl.analizador.newSimbolo(/^(?!x)x/i, "imposible");
    $["nada"] = zl.analizador.newSimbolo(/^/i, "nada");
    $["veces"] = zl.analizador.newSimbolo(/^(veces)/i, "veces");
    $["repetir"] = zl.analizador.newSimbolo(/^(repetir)/i, "repetir");
    $["mientras"] = zl.analizador.newSimbolo(/^(mientras)/i, "mientras");
    $["subrutina"] = zl.analizador.newSimbolo(/^(subrutina)/i, "subrutina");
    $["externa"] = zl.analizador.newSimbolo(/^(externa)/i, "externa");
    $["es"] = zl.analizador.newSimbolo(/^(es)/i, "es");
    $["rapida"] = zl.analizador.newSimbolo(/^(rapida|rápida)/i, "rapida");
    $["entrada"] = zl.analizador.newSimbolo(/^(entrada)/i, "entrada");
    $["salida"] = zl.analizador.newSimbolo(/^(salida)/i, "salida");
    $["de"] = zl.analizador.newSimbolo(/^(de)/i, "de");
    $["datos"] = zl.analizador.newSimbolo(/^(datos)/i, "datos");
    $["algoritmo"] = zl.analizador.newSimbolo(/^(algoritmo)/i, "algoritmo");
    $["global"] = zl.analizador.newSimbolo(/^(global)/i, "global");
    $["relacion"] = zl.analizador.newSimbolo(/^(relación|relacion)/i, "relacion");
    $["lista"] = zl.analizador.newSimbolo(/^(lista)/i, "lista");
    $["a"] = zl.analizador.newSimbolo(/^(a)/i, "a");
    $[".."] = zl.analizador.newSimbolo(/^(\.\.)/i, "..");
    $[";"] = zl.analizador.newSimbolo(/^(;)/i, ";");
    var espacio = zl.analizador.newSimbolo(/^([ \n\t]+)/i, "espacio");
    var comentario = zl.analizador.newSimbolo(/^(\/\/.*)/i, "comentario");
    var numero = zl.analizador.newSimbolo(/^((?:[0-1]+(?:\|2))|(?:[0-9A-Fa-f]+(?:\|16))|(?:[0-9]+(?:\|10)?))/i, "numero");
    var texto = zl.analizador.newSimbolo(/^\"([^"\\]|\\.|\\\n)*\"/i, "texto");
    var letra = zl.analizador.newSimbolo(/^\'([^'\\]|\\.|\\\n)*\'/i, "letra");

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

    reglas["modulo"] = zl.analizador.newExpresion([
      [" ","subrutina+", " "]
    ], "modulo");

    reglas["subrutina+"] = zl.analizador.newExpresion([
      ["subrutina", " ", "subrutina+"],
      ["subrutina"]
    ], "subrutina+");

    reglas["subrutina"] = zl.analizador.newExpresion([
      ["subrutinaCabecera", " ", "subrutinaCuerpo"]
    ], "subrutina");

    reglas["subrutinaCabecera"] = zl.analizador.newExpresion([
      [$["subrutina"], "_", "modificador+", "_", "nombre"],
      [$["subrutina"], "_", "nombre"]
    ], "subrutinaCabecera");

    reglas["subrutinaCuerpo"] = zl.analizador.newExpresion([
      ["datos", " ", "algoritmo", " ", $["fin"]]
    ], "subrutinaCuerpo");

    reglas["modificador"] = zl.analizador.newExpresion([
      [$["externa"]],
      [$["es"]],
      [$["rapida"]]
    ], "modificador")

    reglas["modificador+"] = zl.analizador.newExpresion([
      ["modificador", "_", "modificador+"],
      ["modificador"]
    ], "modificador")

    // Reglas encontradas en el BNF:
    reglas["nombre"] = zl.analizador.newExpresion([
      [nombreSimple, $["."], "nombre"],
      [nombreSimple]
    ], "nombre");

    reglas["datos"] = zl.analizador.newExpresion([
      [$["datos"], " ", "declaracion+"]
    ], "datos");

    reglas["algoritmo"] = zl.analizador.newExpresion([
      [$["algoritmo"], " ", "sentencia+"]
    ], "algoritmo");

    reglas["declaracion"] = zl.analizador.newExpresion([
      ["nombre", "_", $["es"], "_", $["relacion"], "_", $["de"], "_", "nombre", "_", $["a"], "_", "nombre", " ", "declaracionModificador*"],
      ["nombre", " ", $["("], " ", "listaDecl", " ", $[")"], "_", $["es"], "_", $["lista"], "_", $["de"], "_", "nombre", " ", "declaracionModificador*"],
      ["nombre", "_", $["es"], "_", "nombre", "_", "declaracionModificador*"]
    ], "declaracion");

    reglas["declaracion+"] = zl.analizador.newExpresion([
      ["declaracion", " ", "declaracion+"],
      ["declaracion"]
    ], "declaracion+");

    reglas["listaDecl"] = zl.analizador.newExpresion([
      ["rango", " ", $[";"], " ", "listaDecl"],
      ["rango"]
    ], "listaDecl")

    reglas["rango"] = zl.analizador.newExpresion([
      [numero, $[".."], numero]
    ], "rango")

    reglas["sentencia"] = zl.analizador.newExpresion([
      ["asignacion"],
      ["ecuacion"],
      ["llamada"],
      ["repetir"],
      ["sicondicional"],
      ["mientras"]
    ], "sentencia")

    reglas["sentencia+"] = zl.analizador.newExpresion([
      ["sentencia", " ", "sentencia+"],
      ["sentencia"]
    ], "lista de sentencias");

    reglas["declaracionModificador"] = zl.analizador.newExpresion([
      [$["de"], " ", $["entrada"]],
      [$["de"], " ", $["salida"]],
      [$["global"]]
    ], "declaracionModificador");

    reglas["declaracionModificador*"] = zl.analizador.newExpresion([
      ["declaracionModificador", " ", "declaracionModificador*"],
      [$["nada"]]
    ], "declaracionModificador*");

    reglas["asignacion"] = zl.analizador.newExpresion([
      ["nombre", " ", $["<-"], " ", "expresion"],
      ["nombre", " ", $["("], " ", "listaAcceso", " ", $[")"], " ", $["<-"], " ", "expresion"]
    ], "asignacion");

    reglas["ecuacion"] = zl.analizador.newExpresion([
      ["expresion", " ", $["="], " ", "expresion"]
    ], "ecuacion");

    reglas["llamada"] = zl.analizador.newExpresion([
      ["nombre", " ", $["->"], " ", "nombre", " ", $["->"], " ", "nombre"],
      ["nombre", " ", $["->"], " ", "nombre"],
      ["nombre", " ", $["["], " ", "llamadaAsignacion*", " ", $["]"]]
    ], "llamada");

    reglas["repetir"] = zl.analizador.newExpresion([
      [$["repetir"], " ", "expresion", " ", $["veces"], " ", "sentencia+", " ", $["fin"]]
    ], "repetir");

    reglas["mientras"] = zl.analizador.newExpresion([
      [$["mientras"], " ", "expresion", " ", $["hacer"], " ", "sentencia+", " ", $["fin"]]
    ], "mientras");

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

    reglas["llamadaAsignacion"] = zl.analizador.newExpresion([
      ["nombre", " ", $["->"], " ", "nombre"],
      ["nombre", " ", $["<-"], " ", "expresion"]
    ], "llamadaAsignacion")

    reglas["llamadaAsignacion*"] = zl.analizador.newExpresion([
      ["llamadaAsignacion", " ", "llamadaAsignacion*"],
      [$["nada"]]
    ], "llamadaAsignacion*")

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
      ["nombre", " ", $["("], "listaAcceso", $[")"]],
      ["nombre"],
      [$["("], " ", "expresion", " ", $[")"]]
    ], "evaluacion")

    reglas["listaAcceso"] = zl.analizador.newExpresion([
      ["rango", " ", $[";"], " ", "listaAcceso"],
      ["expresion", " ", $[";"], " ", "listaAcceso"],
      ["rango"],
      ["expresion"]
    ], "listaAcceso")

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
      [$["<="]],
      [$[">="]],
      [$["<>"]],
      [$["<"]],
      [$[">"]],
      [$["="]]
    ], "operadorBinarioTercero")

    reglas["operadorBinarioSegundo"] = zl.analizador.newExpresion([
      [$["+"]],
      [$["-"]]
    ], "operadorBinarioSegundo")

    reglas["operadorBinarioPrimero"] = zl.analizador.newExpresion([
      [$["*"]],
      [$["/"]],
      [$["%"]]
    ], "operadorBinarioPrimero")

    // Comportamiento de las reglas:
    reglas["nombre"].error = function(datos, opcion, posicion) {
      var nombre = datos[0];
      if (opcion == 0) {
        nombre = datos[0] + datos[1] + datos[2];
      }
      if (nombre.toLowerCase() in palabrasReservadas) {
        return zl.error.E_PALABRA_RESERVADA;
      }
    }

    reglas["modulo"].postproceso = function(datos, opcion) {
      return {
        subrutinas: datos[1]
      };
    }

    reglas["subrutina+"].postproceso = function(datos, opcion) {
      if (opcion == 0)
        return [datos[0]].concat(datos[2]);
      else
        return [datos[0]];
    }

    reglas["subrutina"].postproceso = function(datos, opcion) {
      return {
        modificadores: datos[0].modificadores,
        nombre: datos[0].nombre,
        datos: datos[2][0],
        sentencias: datos[2][2]
      };
    }

    reglas["subrutinaCabecera"].postproceso = function(datos, opcion) {
      if (opcion == 0) {
        return {
          modificadores: datos[2],
          nombre: datos[4]
        }
      } else if (opcion == 1) {
        return {
          modificadores: [],
          nombre: datos[2]
        }
      }
    }

    reglas["modificador"].postproceso = function(datos, opcion) {
      if (opcion == 2)
        return "rapida";
      return datos[0];
    }

    reglas["modificador+"].postproceso = function(datos, opcion) {
      if (opcion == 0)
        return [datos[0]].concat(datos[2]);
      else
        return [datos[0]];
    }

    reglas["nombre"].postproceso = function(datos, opcion) {
      var nombre = datos[0];
      if (opcion == 0) {
        nombre = datos[0] + datos[1] + datos[2];
      }
      return nombre;
    }

    reglas["datos"].postproceso = function(datos, opcion) {
      return datos[2];
    }

    reglas["algoritmo"].postproceso = function(datos, opcion) {
      return datos[2];
    }

    reglas["declaracion"].postproceso = function(datos, opcion) {
      if (opcion == 2) {
        return {
          nombre: datos[0],
          tipo: datos[4],
          modificadores: datos[6]
        }
      } else if (opcion == 1) {
        return {
          nombre: datos[0],
          tipo: "lista",
          dimensiones: datos[4],
          subtipo: datos[14],
          modificadores: datos[16]
        }
      } else if (opcion == 0) {
        return {
          nombre: datos[0],
          tipo: "relacion",
          clave: datos[8],
          valor: datos[12],
          modificadores: datos[14]
        };
      }
    }

    reglas["declaracion+"].postproceso = function(datos, opcion) {
      if (opcion == 0)
        return [datos[0]].concat(datos[2]);
      else
        return [datos[0]];
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
        s.tipo = "ecuacion";
      } else if (opcion == 2) {
        s.tipo = "llamada";
      } else if (opcion == 3) {
        s.tipo = "repetir";
      } else if (opcion == 4) {
        s.tipo = "sicondicional";
      } else if (opcion == 5) {
        s.tipo = "mientras";
      }
      return s;
    }

    reglas["declaracionModificador"].postproceso = function(datos, opcion) {
      return datos[datos.length - 1];
    }

    reglas["declaracionModificador*"].postproceso = function(datos, opcion) {
      if (opcion == 0)
        return [datos[0]].concat(datos[2]);
      else
        return [];
    }

    reglas["asignacion"].postproceso = function(datos, opcion) {
      if (opcion == 0) {
        return {
          variable: datos[0],
          valor: datos[4]
        };
      } else if (opcion == 1) {
        return {
          variable: datos[0],
          acceso: datos[4],
          valor: datos[10]
        };
      }
    }

    reglas["llamada"].postproceso = function(datos, opcion) {
      if (opcion == 2) {
        return {
          nombre: datos[0],
          entrada: datos[4].entrada,
          salida: datos[4].salida
        };
      }
    }

    reglas["repetir"].postproceso = function(datos) {
      return {
        veces: datos[2],
        sentencias: datos[6]
      };
    }

    reglas["mientras"].postproceso = function(datos) {
      return {
        condicion: datos[2],
        sentencias: datos[6]
      };
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

    reglas["llamadaAsignacion*"].postproceso = function(datos, opcion) {
      if (opcion == 0) {
        var resultado = datos[2];
        if (datos[0].tipo == "entrada") {
          resultado.entrada = [datos[0]].concat(resultado.entrada);
        } else {
          resultado.salida = [datos[0]].concat(resultado.salida);
        }
        return resultado;
      }
      return {
        entrada: [],
        salida: []
      }
    }

    reglas["llamadaAsignacion"].postproceso = function(datos, opcion) {
      if (opcion == 0) {
        return {
          tipo: "salida",
          izq: datos[0],
          der: datos[4]
        };
      }
      return {
        tipo: "entrada",
        izq: datos[0],
        der: datos[4]
      };
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
        var num = parseInt(partes[0], partes[1]);
        return {
          tipo: "numero",
          valor: num
        };
      } else if (opcion == 1) {
        return {
          tipo: "texto",
          valor: datos[0]
        }
      } else if (opcion == 2) {
        return {
          tipo: "letra",
          valor: datos[0]
        }
      } else if (opcion == 3) {
        return {
          tipo: "booleano",
          valor: datos[0]
        }
      } else if (opcion == 4) {
        return {
          tipo: "booleano",
          valor: datos[0]
        }
      } else if (opcion == 5) {
        return {
          tipo: "acceso",
          nombre: datos[0],
          acceso: datos[3]
        }
      } else if (opcion == 6) {
        return {
          tipo: "nombre",
          valor: datos[0]
        }
      } else if (opcion == 7) {
        return {
          tipo: "expresion",
          valor: datos[2]
        }
      }
    }

    reglas["listaAcceso"].postproceso = function(datos, opcion) {
      if (opcion == 1) {
        return [datos[0]].concat(datos[4]);
      } else if (opcion == 3) {
        return [datos[0]];
      }
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
