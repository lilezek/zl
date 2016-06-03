var modulo = function(zl) {
  "use strict";
  zl.autocompletar = {};
  var indentUnit = "  ";
  var Pos = CodeMirror.Pos;
  var ultimaTabla = zl.entorno.newModulo();

  function emparejarDatoPorTipo(subrutina, tipo, similitud, defecto) {
    // TODO: Comprobar si ya se han escrito o leído antes.
    var mejorPosibilidad = "";
    var distancia = Infinity;
    for (var k in subrutina.declaraciones) {
      if (subrutina.declaraciones[k].tipoInstancia.tipo.nombre === tipo) {
        var d;
        if ((d = (new Levenshtein(similitud, subrutina.declaraciones[k].nombre)).distance) < distancia) {
          distancia = d;
          mejorPosibilidad = subrutina.declaraciones[k].nombre;
        }
      }
    }
    // En caso de no encontrar ninguno válido, inventarse uno
    if (mejorPosibilidad === "")
      return defecto;
    return mejorPosibilidad;
  }

  function applyHint(cm, data, completion) {
    var lineaIndent = "";
    var cur = cm.getCursor();
    var linea = cm.getLine(cur.line);
    var i = 0;
    while (/[ \t]/.test(linea[i])) {
      lineaIndent += linea[i++];
    }

    var str = completion.repl;
    var contexto = zl.autocompletar.contexto();
    var colocarCursor;
    str = str.replace(/%condicion%/g, "verdadero")
      .replace(/%indent%/g, indentUnit)
      .replace(/%([a-z0-9ñáéíóú]+)&numero%/ig, function(match, p1) {
        return emparejarDatoPorTipo(contexto.subrutina, "numero", p1, "3");
      })
      .replace(/%([a-z0-9ñáéíóú]+)&booleano%/ig, function(match, p1) {
        return emparejarDatoPorTipo(contexto.subrutina, "booleano", p1, "verdadero");
      })
      .replace(/%codigo%/g, "// Código aquí")
      .replace(/%([a-z0-9ñáéíóú]+)&texto%/ig, function(match, p1) {
        return emparejarDatoPorTipo(contexto.subrutina, "texto", p1, "\"\"");
      })
      .replace(/%([a-z0-9ñáéíóú]+)&([a-z0-9ñáéíóú]+)%/ig, function(match, p1, p2) {
        return emparejarDatoPorTipo(contexto.subrutina, p2, p1, p2);
      })
      .replace(/%nombre%/g, "Nombre")
      .replace(/%dato&([a-z0-9ñáéíóú]+)&([a-z0-9ñáéíóú]+)%/ig, function(match, p1, p2) {
        return emparejarDatoPorTipo(contexto.subrutina, p2, p1, p1);
      })
      .replace(/\n/g, "\n" + lineaIndent)
      .replace("_", function(match, offset) {
        colocarCursor = offset;
        return "";
      });


    cm.replaceRange(str, completion.from || data.from,
      completion.to || data.to, "complete");
    if (colocarCursor) {
      var x = cm.indexFromPos((completion.from || data.from)) + colocarCursor;
      cm.setCursor(cm.posFromIndex(x));
    }
  }

  var contextos = {
    modulo: {
      $: [],
      configuracion: {
        $: [{
          displayText: "Configuracion ...",
          text: "configuracion",
          repl: "Configuracion\n\nFin",
          hint: applyHint
        }]
      },
      subrutinas: {
        $: [{
          displayText: "Subrutina ... ",
          text: "subrutina",
          repl: "Subrutina _%nombre%\nDatos\n\nAlgoritmo\n\nFin",
          hint: applyHint
        }],
        subrutina: {
          $: [],
          cabecera: {
            $: ["interna"]
          },
          datos: {
            // TODO: Eliminar los modificadores:
            $: ["entrada", "salida", "global"],
            modificadores: {
              $: ["entrada", "salida", "global"]
            },
            tipo: {
              $: []
            }
          },
          algoritmo: {
            $: [{
                displayText: "Mientras ... hacer ...",
                text: "mientras",
                repl: "Mientras _%condicion% hacer\n%indent%%codigo%\nFin",
                hint: applyHint
              }, {
                displayText: "Repetir ... veces ...",
                text: "repetir",
                repl: "Repetir _%dato&veces&numero% veces\n%indent%%codigo%\nFin",
                hint: applyHint
              }, {
                displayText: "si ... hacer ...",
                text: "si",
                repl: "Si _%condicion% hacer\n%indent%%codigo%\nFin",
                hint: applyHint
              },
              "pausar"
            ]
          }
        }
      }
    }
  }

  CodeMirror.registerHelper("hint", "zl", function scriptHint(editor, options) {
    var contexto = zl.autocompletar.contexto();
    // Encontrar el token.
    var cur = editor.getCursor(),
      end = editor.indexFromPos(cur),
      begin = end - 1,
      t = editor.getValue(),
      token = "";

    while (/[a-záéíóúñ0-9\.]/i.test(t[begin])) {
      begin--;
    }
    begin++;
    token = t.substring(begin, end);
    // Comprobar que no tenga más de un punto, ni que esté compuesto
    // solo por números:
    var partes = token.split(".");
    if (partes.length <= 2 && (!partes[0] || isNaN(partes[0])) && (!partes[1] || isNaN(partes[1]))) {
      if (token.length >= options.minimumTokenLength || options.mandatory)
        return {
          list: getCompletions(token, contexto, options),
          from: editor.posFromIndex(begin + (partes.length == 2 ? partes[0].length + 1 : 0)),
          to: editor.posFromIndex(end)
        };
    }
    return {
      list: [],
      from: editor.posFromIndex(begin),
      to: editor.posFromIndex(end)
    };
  });

  function generarHintSubrutina(sub) {
    var hint = {
      displayText: sub.nombre + " ... [ ]",
      text: sub.nombre,
      hint: applyHint,
      repl: sub.nombre + " ["
    }
    for (var h in sub.declaraciones) {
      var decl = sub.declaraciones[h];
      if (!(decl.modificadores & decl.M_GLOBAL) && !(decl.modificadores == decl.M_LOCAL)) {
        hint.repl += "\n%indent%" + decl.nombre;
        if (decl.modificadores & decl.M_ENTRADA && decl.modificadores & decl.M_SALIDA) {
          hint.repl += " <- ";
          hint.repl += "%" + decl.nombre + "&";
          hint.repl += decl.tipoInstancia.tipo.nombre + "%\n%indent%";
          hint.repl += " -> ";
          hint.repl += "%dato&";
          hint.repl += decl.tipoInstancia.tipo.nombre + "%";
        } else if (decl.modificadores & decl.M_ENTRADA) {
          hint.repl += " <- ";
          hint.repl += "%" + decl.nombre + "&";
          hint.repl += decl.tipoInstancia.tipo.nombre + "%";
        } else if (decl.modificadores & decl.M_SALIDA) {
          hint.repl += " -> ";
          hint.repl += "%dato&";
          hint.repl += decl.nombre + "&";
          hint.repl += decl.tipoInstancia.tipo.nombre + "%";
        }
      }
    }
    if (!/[\n\[]/.test(hint.repl[hint.repl.length - 1]))
      hint.repl += "\n";
    hint.repl += "]";
    return hint;
  }

  function getCompletions(start, contexto, options) {
    // TODO: Se puede optimizar esto muchísimo.
    // TODO: Una vez optimizado, hacer Levenshtein con el principio
    // y con la palabra completa, y coger una mezcla de los resultados.
    start = start.toLowerCase();
    var distintasAlternativas = [],
      sub = contexto.subrutina,
      tipos = [],
      datos = Object.keys(sub ? sub.declaraciones : {}),
      subrutinas = ultimaTabla.arrayDeSubrutinas(),
      keywords = contexto.$.$;
    // Nombre compuesto:
    if (sub && start.indexOf(".") > -1) {
      var r = start.split(".");
      var dato = sub.declaraciones[r[0]];
      if (dato && dato.tipoInstancia.tipo.modulo) {
        subrutinas = dato.tipoInstancia.tipo.modulo.arrayDeSubrutinasPropias();
        start = r[1];
        keywords = [];
        datos = [];
      }
    } else {
      distintasAlternativas = distintasAlternativas.concat(keywords);
    }
    if (contexto.tipo === "datos") {
      tipos = ultimaTabla.arrayDeTipos().map(arr => arr.nombre);
      distintasAlternativas = distintasAlternativas.concat(tipos);
    } else if (contexto.tipo === "algoritmo") {
      subrutinas = subrutinas.map(generarHintSubrutina);
      distintasAlternativas = distintasAlternativas.concat(subrutinas);
    }
    return distintasAlternativas.filter(function(key) {
      // Si start es vacío, no filtrar nada:
      if (!start.length)
        return true;
      var t = (typeof key === "string" ? key : key.text);
      return t.length >= start.length && new Levenshtein(t.substring(0, start.length), start) < start.length * 0.8;
    }).sort(function(a, b) {
      var l = start.length;
      var tb = (typeof b === "string" ? b : b.text).substring(0, l);
      var ta = (typeof a === "string" ? a : a.text).substring(0, l);
      return (new Levenshtein(ta, start) - new Levenshtein(tb, start));
    });
  }

  zl.autocompletar.alimentarTabla = function(tabla) {
    ultimaTabla = tabla;
  }

  zl.autocompletar.contexto = function() {
    var cur = editor.indexFromPos(editor.getCursor());
    var sub = ultimaTabla.subrutinaPorPosicion(cur);
    var c = contextos["modulo"];
    if (sub) {
      c = c["subrutinas"]["subrutina"];
      if (cur >= sub.posicionCabecera[0] && cur <= sub.posicionCabecera[1]) {
        return {
          tipo: "cabecera",
          subrutina: sub,
          $: c["cabecera"]
        };
      } else if (cur >= sub.posicionDatos[0] && cur < sub.posicionAlgoritmo[0]) {
        return {
          tipo: "datos",
          subrutina: sub,
          $: c["datos"]
        };
      } else if (cur >= sub.posicionAlgoritmo[0] && cur <= sub.posicionAlgoritmo[1]) {
        return {
          tipo: "algoritmo",
          subrutina: sub,
          $: c["algoritmo"]
        };
      }
      return {
        tipo: "subrutina",
        subrutina: sub,
        $: c
      }
    }
    // Comprobar que no está la palabra configuracion en el texto hasta el cursor:
    var config = !(/configuracion|subrutina/gi.test(editor.getValue().substring(0, cur)));
    if (config) {
      return {
        tipo: "configuracion",
        $: c["configuracion"]
      }
    } else {
      return {
        tipo: "subrutinas",
        $: c["subrutinas"]
      };
    }
  }

  return zl;
}

if (typeof module !== "undefined") {
  module.exports = modulo;
} else {
  this.zl = modulo(this.zl || {});
}
