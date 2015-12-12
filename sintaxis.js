var zl = zl || {};
zl.sintaxis = zl.sintaxis || {};

(function(){
  "use strict";

  var arbolConfiguracion = function(zlcode) {
    // TODO: stub
    return {end: 0};
  }

  var arbolCodigo = function(zlcode) {
    var reglas = zl.sintaxis.reglasCodigo;
    zl.analizador.limpiarCache(reglas);
    var reglaPrincipal = reglas["modulo"];
    var arbol = reglaPrincipal.reducir(zlcode);
    if (!arbol.error) {
      return arbol.resultado;
    }
    return arbol;
  }

  zl.sintaxis.arbolConfiguracion = arbolConfiguracion;
  zl.sintaxis.arbolCodigo = arbolCodigo;
})();
