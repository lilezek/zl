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

  // Genera código javascript a partir de código
  // en zl
  zl.Evaluar = function(zlcode, subrutina, carga, locales) {
    zlcode = zlcode.trim();
    if (!zlcode.length)
      return "No hay código seleccionado";
    try {
      // Fase 1, obtener el árbol sintáctico de la expresión:
      var compilado = zl.sintaxis.arbolExpresion(zlcode);

      // Fase 2, parsing semántico
      zl.semantica.testarExpresion(compilado, subrutina);

      // Fase 3, obtener el código javascript:
      var javascript = zl.javascript.expresion(compilado, modulo);
    } catch (e) {
      if (zl.error.esError(e))
        return "El código seleccionado no es una expresión."
      throw e;
    }
    console.log(locales, carga);
    return Function("var $local=this.local;var $in=this.carga;return ("+javascript+");").call({
      local: locales,
      carga: carga
    });
  }
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
