var modulo = function(zl) {
  "use strict";


  zl.sintaxis = zl.sintaxis || {};

  if (typeof require !== "undefined") {
    require("./zlsintaxis")(zl);
  }

  var arbolConfiguracion = function(zlcode, offset) {
    offset = offset || 0;
    var analisis = zl.sintaxis.zlAnalizador.empezar(zlcode);
    analisis.moverCursor(offset);
    return analisis.configuraciones().resultado(0);
  }

  var arbolCodigo = function(zlcode, offset) {
    offset = offset || 0;
    var analisis = zl.sintaxis.zlAnalizador.empezar(zlcode);
    analisis.moverCursor(offset);
    analisis.modulo();
    return analisis.resultado(0);
  }

  var arbolExpresion = function(zlcode) {
    var analisis = zl.sintaxis.zlAnalizador.empezar(zlcode);
    analisis.expresion();
    return analisis.resultado(0);
  }

  zl.sintaxis.arbolConfiguracion = arbolConfiguracion;
  zl.sintaxis.arbolCodigo = arbolCodigo;
  zl.sintaxis.arbolExpresion = arbolExpresion;

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
