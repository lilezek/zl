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
    var compilado;
    try {
      // Fase 1, obtener el árbol sintáctico de la configuración:
      compilado = zl.sintaxis.arbolConfiguracion(zlcode);
      // Fase 2, modificar el comportamiento según la configuración:

        // Array de configuraciones
        for (var i = 0; i < compilado.length; i++) {
          var c = compilado[i];
          // Configuración genérica:
          if (c.tipo === "configurar") {
            zl.configuracion[c.nombre] = c.valor;
          }
        }
    } catch (e) {
      if (!zl.error.esError(e) || e.traza.end > 0)
        throw e;
    }
    // Fase 3, obtener el árbol sintáctico del resto del código:
    compilado = zl.sintaxis.arbolCodigo(zlcode, (compilado ? compilado.end : 0));

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
  zl.Evaluar = function(zlcode, subrutina, carga, entorno) {
    zlcode = zlcode.trim();
    if (!zlcode.length)
      return "No hay código seleccionado";
    try {
      // Fase 1, obtener el árbol sintáctico de la expresión:
      var compilado = zl.sintaxis.arbolExpresion(zlcode);

      console.log(entorno, subrutina);

      // Fase 2, parsing semántico
      zl.semantica.testarExpresion(compilado, subrutina);

      // Fase 3, obtener el código javascript:
      var javascript = zl.javascript.expresion(compilado, subrutina);
    } catch (e) {
      if (zl.error.esError(e))
        return "El código seleccionado no es una expresión."
      throw e;
    }
    return Function("var $local=this.local;var $global=this.global;"+
    "var $entrada=this.entrada;var $salida=this.salida;"+
    "var $in=this.carga;return ("+javascript+");").call({
      local: entorno[0],
      global: entorno[1],
      entrada: entorno[2],
      salida: entorno[3],
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
