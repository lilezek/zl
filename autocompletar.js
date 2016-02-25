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
      if (subrutina.declaraciones[k].tipo.nombre === tipo) {
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

    // TODO: Hacer reemplazamientos inteligentes
    var str = completion.repl;
    var contexto = zl.autocompletar.contexto();
    str = str.replace(/%condicion%/g, "verdadero")
      .replace(/%indent%/g, indentUnit)
      .replace(/%([a-z0-9ñ]+)&numero%/g, function(match, p1) {
        return emparejarDatoPorTipo(contexto.subrutina, "numero", p1, "3");
      })
      .replace(/%([a-z0-9ñ]+)&booleano%/g, function(match, p1) {
        return emparejarDatoPorTipo(contexto.subrutina, "booleano", p1, "verdadero");
      })
      .replace(/%codigo%/g, "// Código aquí")
      .replace(/%([a-z0-9ñ]+)&texto%/g, function(match, p1) {
        return emparejarDatoPorTipo(contexto.subrutina, "texto", p1, "\"\"");
      })
      .replace(/%nombre%/g, "Nombre")
      .replace(/%dato&([a-z0-9ñ]+)&([a-z0-9ñ]+)%/ig, function(match, p1, p2) {
        return emparejarDatoPorTipo(contexto.subrutina, p2, p1, p1);
      })
      .replace(/\n/g, "\n" + lineaIndent);


    cm.replaceRange(str, completion.from || data.from,
      completion.to || data.to, "complete");
  }

  var contextos = {
    modulo: {
      $: [],
      configuracion: {
        $: ["configuracion"]
      },
      subrutinas: {
        $: [{
          displayText: "Subrutina ... ",
          text: "subrutina",
          repl: "Subrutina %nombre%\nDatos\n\nAlgoritmo\n\nFin",
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
                repl: "Mientras %condicion% hacer\n%indent%%codigo%\nFin",
                hint: applyHint
              }, {
                displayText: "Repetir ... veces ...",
                text: "repetir",
                repl: "Repetir %dato&veces&numero% veces\n%indent%%codigo%\nFin",
                hint: applyHint
              },{
                displayText: "si ... hacer ...",
                text: "si",
                repl: "Si %condicion% hacer\n%indent%%codigo%\nFin",
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
    var getToken = function(e, cur) {
      return e.getTokenAt(cur);
    }
    var contexto = zl.autocompletar.contexto();
    // Find the token at the cursor
    var cur = editor.getCursor(),
      token = getToken(editor, cur);
    if (/\b(?:string|comment)\b/.test(token.type)) return;
    token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
      token = {
        start: cur.ch,
        end: cur.ch,
        string: "",
        state: token.state,
        type: token.string == "." ? "property" : null
      };
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    var tprop = token;
    // If it is a property, find out what it is a property of.
    while (tprop.type == "property") {
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      if (tprop.string != ".") return;
      tprop = getToken(editor, Pos(cur.line, tprop.start));
      // TODO: mejorar el contexto.
      if (!context) var context = [];
      context.push(tprop.string);
    }
    return {
      list: getCompletions(token, context, contexto, options),
      from: Pos(cur.line, token.start),
      to: Pos(cur.line, token.end)
    };
  });

  function generarHintSubrutinas(mapa) {
    var resultado = [];
    for (var k in mapa) {
      var sub = mapa[k];
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
            hint.repl += "%" + decl.nombre+"&";
            hint.repl += decl.tipo.nombre + "%\n%indent%";
            hint.repl += " -> ";
            hint.repl += "%dato&";
            hint.repl += decl.tipo.nombre + "%";
          } else if (decl.modificadores & decl.M_ENTRADA) {
            hint.repl += " <- ";
            hint.repl += "%" + decl.nombre+"&";
            hint.repl += decl.tipo.nombre + "%";
          } else if (decl.modificadores & decl.M_SALIDA) {
            hint.repl += " -> ";
            hint.repl += "%dato&";
            hint.repl += decl.nombre+"&";
            hint.repl += decl.tipo.nombre + "%";
          }
        }
      }
      if (!/[\n\[]/.test(hint.repl[hint.repl.length-1]))
        hint.repl += "\n";
      hint.repl += "]";
      resultado.push(hint);
    }
    return resultado;
  }

  function getCompletions(token, context, contexto, options) {
    // TODO: Se puede optimizar esto muchísimo.
    var start = token.string;
    var sub = contexto.subrutina;
    var tipos = [],
      datos = [],
      subrutinas = [],
      keywords = contexto.$.$;
    if (contexto.tipo === "datos") {
      tipos = Object.keys(ultimaTabla.tipos).concat(
        (ultimaTabla.moduloInterno ? Object.keys(ultimaTabla.moduloInterno.tipos) : [])
      );
    } else if (contexto.tipo === "algoritmo") {
      datos = Object.keys(sub ? sub.declaraciones : {});
      subrutinas = generarHintSubrutinas(ultimaTabla.subrutinas).concat(
        (ultimaTabla.moduloInterno ? generarHintSubrutinas(ultimaTabla.moduloInterno.subrutinas) : [])
      );
    }
    // TODO: Escoger qué arrays concatenar según el contexto.
    var options = subrutinas.concat(datos).concat(tipos).concat(keywords).filter(function(key) {
      var t = (typeof key === "string" ? key : key.text);
      return t.length >= start.length && new Levenshtein(t.substring(0,start.length), start) < start.length;
    }).sort(function(a,b) {
      var l = start.length;
      var tb = (typeof b === "string" ? b : b.text).substring(0,l);
      var ta = (typeof a === "string" ? a : a.text).substring(0,l);
      return (new Levenshtein(ta, start) - new Levenshtein(tb, start));
    });
    return options;
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
      } else if (cur >= sub.posicionDatos[0] && cur <= sub.posicionDatos[1]) {
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
    // TODO: Comprobar configuración.
    return {
      tipo: "subrutinas",
      $: c["subrutinas"]
    };
  }

  return zl;
}

if (typeof module !== "undefined") {
  // TODO: ¿Añadir soporte para NodeJS?
  console.error("Sin soporte para NodeJS");
  module.exports = null;
} else {
  this.zl = modulo(this.zl || {});
}
