var zl = zl || {};

(function() {
  //  "use strict";

  // Genera código javascript a partir de código
  // en zl
  zl.Compilar = function(zlcode) {
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

    // Fase 4, registrar nombres (de variables, de subrutinas, de objetos...)
    var entorno = zl.entorno.newEntorno();
    entorno.registrarNombres(compilado);

    // Fase 5, comprobaciones semánticas (tipos compatibles, uso de nombres que
    // están registrados, etc...).
    zl.semantica.testar(compilado, entorno);

    // Fase 6, optimización opcional del código generado por el árbol
    // TODO: sin hacer

    // Fase 7, generación del código de salida
    return {
      javascript: zl.javascript.generar(compilado, entorno)
    };
  }
})();
