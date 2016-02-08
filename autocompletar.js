var modulo = function(zl) {
  "use strict";
  zl.autocompletar = {};
  var indentUnit = "  ";
  var Pos = CodeMirror.Pos;
  var ultimaTabla = null;

  function applyHint(cm, data, completion) {

    var str = completion.repl;
    // TODO: Hacer reemplazamientos inteligentes
    str = str.replace("%condicion%", "verdadero")
      .replace("%indent%", indentUnit)
      .replace("%numero%", "3")
      .replace("%codigo%", "// Código aquí")
      .replace("%string%", "\"\"")
      .replace("%nombre%", "Nombre")
      .replace(/%dato&([a-z]+)%/, "dato$1")

    // TODO: Identar el bloque entero correctamente

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
        $: ["subrutina"],
        subrutina: {
          $: [],
          cabecera: {
            $: ["externa", "es", "rapida"]
          },
          datos: {
            $: [],
            modificadores: {
              $: ["entrada", "salida", "global"]
            },
            tipo: {
              $: []
            }
          },
          algoritmo: {
            $: ["mientras","repetir","pausar"]
          }
        }
      }
    }
  }

  // TODO: Dejar de usar keywords y usar el contexto
  var keywords = [
    "hacer", {
      displayText: "Si ... hacer ...",
      text: "si",
      repl: "Si %condicion% hacer\n%indent%%codigo%\nFin",
      hint: applyHint
    },
    "verdadero",
    "falso",
    "veces", {
      displayText: "Repetir ... veces ...",
      text: "repetir",
      repl: "Repetir %numero% veces\n%indent%%codigo%\nFin",
      hint: applyHint
    }, {
      displayText: "Mientras ... hacer ...",
      text: "mientras",
      repl: "Mientras %condicion% hacer\n%indent%%codigo%\nFin",
      hint: applyHint
    }, {
      displayText: "Subrutina ... ",
      text: "subrutina",
      repl: "Subrutina %nombre%\nDatos\n\nAlgoritmo\n\nFin",
      hint: applyHint
    },
    "externa",
    "rapida",
    "entrada",
    "salida",
    "Datos",
    "Algoritmo",
    "global",
    "pausar",
    // TODO: Hacer que las subrutinas sean automáticas
    {
      displayText: "mostrar ...",
      text: "mostrar",
      repl: "mostrar [ mensaje <- %string% ]",
      hint: applyHint
    }, {
      displayText: "leerNumero ...",
      text: "leernumero",
      repl: "leerNumero [ mensaje -> %dato&numero% ]",
      hint: applyHint
    }, {
      displayText: "mostrarNumero ...",
      text: "mostrarnumero",
      repl: "mostrarNumero [ mensaje <- %numero% ]",
      hint: applyHint
    },
  ];

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
      list: getCompletions(token, context, contexto, keywords, options),
      from: Pos(cur.line, token.start),
      to: Pos(cur.line, token.end)
    };
  });

  function getCompletions(token, context, contexto, keywords, options) {
    var start = token.string;
    var datos = Object.keys(ultimaTabla.subrutinas[contexto.toLowerCase()].declaraciones);
    var tipos = Object.keys(ultimaTabla.tipos).concat(
      (ultimaTabla.moduloInterno ? Object.keys(ultimaTabla.moduloInterno.tipos) : [])
    );
    var subrutinas = Object.keys(ultimaTabla.subrutinas).concat(
      (ultimaTabla.moduloInterno ? Object.keys(ultimaTabla.moduloInterno.subrutinas) : [])
    );
    // TODO: Escoger qué arrays concatenar según el contexto.
    var options = subrutinas.concat(datos).concat(tipos).concat(keywords).filter(function(key) {
      var text = (typeof key === "string" ? key : key.text);
      return text.toLowerCase().indexOf(start.toLowerCase()) === 0;
    });
    return options;
  }

  zl.autocompletar.alimentarTabla = function(tabla) {
    ultimaTabla = tabla;
  }

  zl.autocompletar.contexto = function() {
    var cur = editor.indexFromPos(editor.getCursor());
    var sub = ultimaTabla.subrutinaPorPosicion(cur);
    if (sub) {
      return sub.nombre;
    }
    if (!sub) {
      // TODO: Comprobar configuración.
      return "$modulo$";
    }
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
