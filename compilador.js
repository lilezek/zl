var modulo = function(zl) {
  "use strict";

  if (typeof require !== "undefined") {
    require("./utils")(zl);
    require("./error")(zl);
    require("./entorno")(zl);
    require("./analizador")(zl, require("async"));
    require("./sintaxis")(zl);
    require("./semantica")(zl);
    require("./javascript")(zl);
  }

  // Genera código javascript a partir de código
  // en zl
  zl.Compilar = function(zlcode, moduloPadre) {
    zlcode = zlcode.trim();
    var compilado;
    // Fase 1, obtener el árbol sintáctico de la configuración:
    compilado = zl.sintaxis.arbolConfiguracion(zlcode);
    if (compilado.error) {
      // En caso de error, si se pudo procesar algún token,
      // es que hubo error en la configuración.
      if (compilado.end > compilado.begin) {
        return {
          error: zl.error.obtenerMensaje(compilado, zlcode)
        };
      }
    }
    // Fase 2, modificar el comportamiento según la configuración:
    // TODO: está sin hacer.
    zlcode = zlcode.substring(compilado.end).trim();

    // Fase 3, obtener el árbol sintáctico del resto del código:
    compilado = zl.sintaxis.arbolCodigo(zlcode);

    // Fase 4, generar la tabla de símbolos

    // Construir este módulo
    var mod = zl.entorno.newModulo(moduloPadre);
    mod.rellenarDesdeArbol(compilado);

    // Fase 5, comprobaciones semánticas (tipos compatibles, uso de nombres que
    // están registrados, etc...).
    zl.semantica.testarModulo(compilado, mod);

    // Fase 6, optimización opcional del código generado por el árbol
    // TODO: sin hacer

    // Fase 7, generación del código de salida
    var inicio = mod.subrutinaPorNombre("inicio");
    var fotograma = mod.subrutinaPorNombre("fotograma");
    return {
      javascript: zl.javascript.modulo(compilado, mod),
      tabla: mod,
      inicioAsincrono: (inicio || false) && (inicio.modificadores.asincrono || false),
      fotogramaAsincrono: (fotograma || false) && (fotograma.modificadores.asincrono || false)
    };
  }
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
