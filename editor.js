/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */
(function() {
  "use strict";
CodeMirror.defineSimpleMode("zl", {
  // The start state contains the rules that are intially used
  start: [
    // The regex matches the token, the token property contains the type
    {
      regex: /"(?:[^\\]|\\.)*?"/,
      token: "string"
    },
    // You can match multiple tokens at once. Note that the captured
    // groups must span the whole string in this case
    {
      regex: /(subrutina)(.*\s)([a-zA-Z]+)/i,
      token: ["keyword", null, "variable-2"]
    },
    // Rules are matched in the order in which they appear, so there is
    // no ambiguity between this one and the one above
    {
      regex: /(?:o|y|no|mientras|repetir|pausar|algoritmo)/i,
      token: "keyword"
    }, {
      regex: /verdadero|falso/i,
      token: "atom"
    }, {
      regex: /((?:[0-1]+(?:\|2))|(?:[0-9A-Fa-f]+(?:\|16))|(?:[0-9]+(?:\|10)?))/i,
      token: "number"
    }, {
      regex: /\/\/.*/,
      token: "comment"
    },
    // A next property will cause the mode to move to a different state
    {
      regex: /\/\*/,
      token: "comment",
      next: "comment"
    }, {
      regex: /(?:[-+\/*=<>!]|<-)+/,
      token: "operator"
    },
    // indent and dedent properties guide autoindentation
    {
      regex: /([\[]|hacer|veces|datos)/i,
      indent: true,
      token: "keyword"
    }, {
      regex: /([\]]|fin|si)/i,
      dedent: true,
      token: "keyword"
    }, {
      regex: /[a-z$][\w$]*/i,
      token: "variable"
    },
    // You can embed other modes with the mode property. This rule
    // causes all code between << and >> to be highlighted with the XML
    // mode.
    {
      regex: /<</,
      token: "meta",
      mode: {
        spec: "xml",
        end: />>/
      }
    }
  ],
  // The multi-line comment state.
  comment: [{
    regex: /.*?\*\//,
    token: "comment",
    next: "start"
  }, {
    regex: /.*/,
    token: "comment"
  }],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
});})();
