var indentUnit = "  ";

function applyHint(cm, data, completion) {
  var str = completion.repl;

  // TODO: Hacer reemplazamientos inteligentes
  str = str.replace("%condicion%", "verdadero")
    .replace("%indent%", indentUnit)
    .replace("%numero%", "3")
    .replace("%codigo%", "// Código aquí")
    .replace("%string%", "\"\"")
    .replace("%nombre%", "Nombre")
    .replace(/%dato&([a-z]+)%/,"dato$1")

  // TODO: Identar el bloque entero correctamente

  cm.replaceRange(str, completion.from || data.from,
    completion.to || data.to, "complete");
}

var keywords = [
  "no",
  "y",
  "o",
  "hacer", {
    displayText: "Si ... hacer ...",
    text: "si",
    repl: "Si %condicion% hacer\n%indent%%codigo%\nFin",
    hint: applyHint
  },
  "Fin",
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
  "es",
  "rapida",
  "entrada",
  "salida",
  "de",
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
  },
  {
    displayText: "leerNumero ...",
    text: "leernumero",
    repl: "leerNumero [ mensaje -> %dato&numero% ]",
    hint: applyHint
  },
  {
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
    // Find the token at the cursor
  var cur = editor.getCursor(),
    token = getToken(editor, cur);
  console.log(token);
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
    if (!context) var context = [];
    context.push(tprop);
  }
  return {
    list: getCompletions(token, context, keywords, options),
    from: Pos(cur.line, token.start),
    to: Pos(cur.line, token.end)
  };
});

function getCompletions(token, context, keywords, options) {
  var start = token.string;
  var options = keywords.filter(function(key) {
    var text = (typeof key === "string" ? key : key.text);
    return text.toLowerCase().indexOf(start.toLowerCase()) === 0;
  });
  return options;
}


function arrayContains(arr, item) {
  if (!Array.prototype.indexOf) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === item) {
        return true;
      }
    }
    return false;
  }
  return arr.indexOf(item) != -1;
}


function forEach(arr, f) {
  for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
}

var Pos = CodeMirror.Pos;
