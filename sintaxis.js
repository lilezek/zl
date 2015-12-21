var zl = zl || {};
zl.sintaxis = zl.sintaxis || {};

(function(){
  "use strict";

  var arbolConfiguracion = function(zlcode) {
    var analisis = zl.sintaxis.zlAnalizador.empezar(zlcode);
    return analisis.configuracion().arbol();
  }

  var arbolCodigo = function(zlcode) {
    var analisis = zl.sintaxis.zlAnalizador.empezar(zlcode);
    analisis.modulo();
    console.log(analisis.arbol())
    return analisis.resultado(0);
  }

  zl.sintaxis.arbolConfiguracion = arbolConfiguracion;
  zl.sintaxis.arbolCodigo = arbolCodigo;
})();
