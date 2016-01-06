var modulo = function(zl) {
  "use strict";


  zl.sintaxis = zl.sintaxis || {};

  if (typeof require !== "undefined") {
    require("./zlsintaxis")(zl);
  }

  var arbolConfiguracion = function(zlcode) {
    var analisis = zl.sintaxis.zlAnalizador.empezar(zlcode);
    return analisis.configuracion().arbol();
  }

  var arbolCodigo = function(zlcode) {
    var analisis = zl.sintaxis.zlAnalizador.empezar(zlcode);
    analisis.modulo();
    zl.log(analisis.arbol())
    return analisis.resultado(0);
  }

  zl.sintaxis.arbolConfiguracion = arbolConfiguracion;
  zl.sintaxis.arbolCodigo = arbolCodigo;

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
