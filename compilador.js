var modulo = function(zl, async) {
  "use strict";

  var cargarModulo;
  // NodeJS:
  if (typeof require !== "undefined") {
    require("./utils")(zl);
    require("./error")(zl);
    require("./entorno")(zl);
    require("./analizador")(zl, async);
    require("./sintaxis")(zl);
    require("./semantica")(zl);
    require("./javascript")(zl);
  } else {
    // Web:
    cargarModulo = function(camino, done) {
      $.ajax(camino, {
        dataType: "text",
        type: "get",
        success: function(data) {
          zl.Compilar(data, done);
        },
        error: function(a, b, error) {
          done(error);
        }
      });
    }
  }

  var cacheDeModulos = {};

  // Genera código javascript a partir de código
  // en zl
  zl.Compilar = function(zlcode, done) {
    var compilado;
    var configuraciones = {};
    var integraciones = {};
    var importes = [];
    try {
      // Fase 1, obtener el árbol sintáctico de la configuración:
      compilado = zl.sintaxis.arbolConfiguracion(zlcode);
      // Fase 2, modificar el comportamiento según la configuración:

      // Array de configuraciones
      for (var i = 0; i < compilado.length; i++) {
        var c = compilado[i];
        // Configuración genérica:
        if (c.tipo === "configurar") {
          configuraciones[c.nombre] = c.valor;
        }
        if (c.tipo == "integrar") {
          var camino = c.camino;
          camino = camino.substring(1, camino.length - 1);
          importes.push(camino);
        }
      }
    } catch (e) {
      if (!zl.error.esError(e) || e.traza.end > 0)
        done(e);
    }

    // Fase 3, obtener el árbol sintáctico del resto del código:
    compilado = zl.sintaxis.arbolCodigo(zlcode, (compilado ? compilado.end : 0));

    // Fase 4, generar la tabla de símbolos

    // Construir este módulo
    var mod = zl.entorno.newModulo();
    zl.writeJson(mod, configuraciones);
    mod.rellenarDesdeArbol(compilado);

    // Antes de avanzar a la siguiente fase, cargar todos los
    // módulos importados.

    var javascript = "";

    async.eachSeries(importes, function(camino, callback) {
        // Si ya se cargó el módulo
        if (camino in cacheDeModulos) {
          mod.integrar(cacheDeModulos[camino].tabla);
          javascript += cacheDeModulos[camino].javascript;
          callback(null);
          // Sino, obtener el código y compilar
        } else {
          cargarModulo(camino, function(err, resultado) {
            // TODO: convertir este error en un error ZL
            if (err) {
              done(err);
            }
            cacheDeModulos[camino] = resultado;
            mod.integrar(resultado.tabla);
            javascript += cacheDeModulos[camino].javascript;
            callback(null);
          });
        }
      },
      function() {
        try {
          // Fase 5, comprobaciones semánticas (tipos compatibles, uso de nombres que
          // están registrados, etc...).
          zl.semantica.testarModulo(compilado, mod);

          // Fase 6, optimización opcional del código generado por el árbol
          // TODO: sin hacer

          // Fase 7, generación del código de salida
          var inicio = mod.subrutinaPorNombre("inicio");
          var fotograma = mod.subrutinaPorNombre("fotograma");
          done(null, {
            javascript: javascript + zl.javascript.modulo(compilado, mod),
            tabla: mod,
            inicioAsincrono: (inicio || false) && (inicio.modificadores.asincrono || false),
            fotogramaAsincrono: (fotograma || false) && (fotograma.modificadores.asincrono || false)
          });
        } catch (e) {
          done(e);
        }
      });
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
    return Function("var $local=this.local;var $global=this.global;" +
      "var $entrada=this.entrada;var $salida=this.salida;" +
      "var $in=this.carga;return (" + javascript + ");").call({
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
  this.zl = modulo(this.zl || {}, async);
}
