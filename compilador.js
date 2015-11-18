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
    try {
      compilado = zl.sintaxis.arbolCodigo(zlcode);  
    } catch (err) {
      console.log(err);
    }
    

    // En caso de error, terminar:
    if (compilado.error) {
      return {
        error: zl.error.obtenerMensaje(compilado, zlcode)
      };
    }

    // Fase 4, registrar nombres (de variables, de subrutinas, de objetos...)
    var entorno = zl.entorno.newEntorno();
    entorno.registrarNombres(compilado);

    // En caso de error, terminar:
    if (entorno.error) {
      return {
        error: zl.error.obtenerMensaje(entorno.error, zlcode)
      };
    }

    // Fase 5, comprobaciones semánticas (tipos compatibles, uso de nombres que
    // están registrados, etc...).
    zl.semantica.testar(compilado,entorno);

    // En caso de error, terminar:
    if (entorno.error) {
      return {
        error: zl.error.obtenerMensaje(entorno.error, zlcode)
      };
    }

    // Fase 6, optimización opcional del código generado por el árbol
    // TODO: sin hacer

    // Fase 7, generación del código de salida
    return {
      javascript: zl.javascript.generar(compilado,entorno)
    };
  }

  zl.Ejecutar = function(javascript) {
      // Preparar el runtime:
      $("#output").get(0).innerHTML = "";
      var $zl_mostrar = function(arg) {
        $("#output").get(0).innerHTML += arg.mensaje+"\n";
      }
      var $zl_leernumero = function(arg){
        return {mensaje: parseInt(prompt("Introduce un número", "0"))}
      }
      var $zl_leer = function(arg) {
        return {mensaje: $("#input").val()};
      }

      // Después ejecutar:
      eval(javascript);
  }
})();
