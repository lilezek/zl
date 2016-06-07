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
    var fs = require('fs');
    cargarModulo = function(camino, ensamblados, done) {
      fs.readFile(camino, function(err, res) {
        if (err)
          done(err);
        zl.Compilar(res.toString(), ensamblados, done);
      });
    }
  } else {
    // Web:
    cargarModulo = function(camino, ensamblados, done) {
      $.ajax(camino, {
        dataType: "text",
        type: "get",
        success: function(data) {
          zl.Compilar(data, ensamblados, done);
        },
        error: function(a, b, error) {
          done(error);
        }
      });
    }
  }

  var cacheDeCompilacionesPorCamino = {};
  var cacheDeCompilacionesPorNombre = {};

  // Genera código javascript a partir de código
  // en zl
  // Devuelve un objeto con el javascript generado,
  // el módulo (ver entorno.js) y una lista de dependencias.
  // TODO: Cambiar el orden de los atributos
  zl.Compilar = function(zlcode, ensamblados, done) {
    var compilado;
    var configuraciones = {};
    var integraciones = [];
    var importes = [];
    var javascript = "";
    ensamblados = ensamblados || {};
    try {
      // Fase 1, obtener el árbol sintáctico de la configuración:
      compilado = zl.sintaxis.arbolConfiguracion(zlcode);
      // Fase 2, modificar el comportamiento según la configuración:

      // Array de configuraciones
      for (var i = 0; i < compilado.length; i++) {
        var c = compilado[i];
        // Configuración genérica:
        if (c.tipo === "configurar") {
          if (c.tipoValor === "number")
            configuraciones[c.nombre.toLowerCase()] = parseFloat(c.valor);
          else
            configuraciones[c.nombre.toLowerCase()] = c.valor;
        } else if (c.tipo === "integrar") {
          var camino = c.camino;
          camino = camino.substring(1, camino.length - 1);
          integraciones.push(camino);
        } else if (c.tipo === "importar") {
          var camino = c.camino;
          camino = camino.substring(1, camino.length - 1);
          importes.push(camino);
        }
      }

    } catch (e) {
      if (!zl.error.esError(e) || e.traza.end > 0) {
        done(e);
        return;
      }
    }

    // Fase 3, ensamblar cada dependencia
    async.eachSeries(integraciones.concat(importes), function(camino, callback) {
      // ¿Está en caché?
      var compilacion = cacheDeCompilacionesPorCamino[camino];
      if (compilacion) {
        var modulo = compilacion.modulo;
        var js = compilacion.javascript;
        // ¿Está sin ensamblar?
        if (!(modulo.configuracion.nombre in ensamblados)) {
          ensamblados[modulo.configuracion.nombremodulo] = compilacion;
          javascript += js;
        }
        callback(null);
      } else {
        cargarModulo(camino, ensamblados, function(error, compilado) {
          if (error) {
            callback(error);
          } else {
            var modulo = compilado.modulo;
            var js = compilado.javascript;
            // Añadir a caché
            cacheDeCompilacionesPorCamino[camino] = compilado;
            cacheDeCompilacionesPorNombre[modulo.configuracion.nombremodulo] = compilado;
            // Y ensamblar
            ensamblados[modulo.configuracion.nombremodulo] = compilado;
            javascript += js;
            callback(null);
          }
        });
      }
    }, function(error) {
      if (!error) try {
          // Fase 4, obtener el árbol sintáctico de este módulo:
          compilado = zl.sintaxis.arbolCodigo(zlcode, (compilado ? compilado.end : 0));

          // Fase 5, generar la tabla de símbolos
          // Construir este módulo
          var mod = zl.entorno.newModulo();

          // Esta fase debería ser de configuración, pero se ha de hacer después de importar módulos
          if (configuraciones.genericos) {
            var arr = configuraciones.genericos.split(";");
            mod.genericos = new Array(arr.length);
            for (var i = 0; i < arr.length; i++) {
              // TODO: Errores
              // TODO: Comprobar que no se use el Generico aquí
              var tipo = zl.sintaxis.arbolTipo(arr[i]);
              mod.genericos[i] = zl.entorno.newTipoInstancia([]);
              mod.genericos[i].rellenarDesdeArbol(tipo,mod);
            }
          }

          // Fase 6, introducir las integraciones en el módulo
          for (var i = 0; i < integraciones.length; i++)
            mod.integrar(cacheDeCompilacionesPorCamino[integraciones[i]].modulo);

          // Fase 7: introducir los tipos de datos a partir de los importes
          for (var i = 0; i < importes.length; i++)
            mod.registrarTipo(cacheDeCompilacionesPorCamino[importes[i]].modulo.estetipo);

          // Fase 8: rellenar el módulo a partir del árbol sintáctico
          zl.writeJson(mod.configuracion, configuraciones);
          mod.rellenarDesdeArbol(compilado);

          // Fase 9, comprobaciones semánticas (tipos compatibles, uso de nombres que
          // están registrados, etc...).
          zl.semantica.testarModulo(compilado, mod);

          // Fase 10, optimización opcional del código generado por el árbol
          // TODO: sin hacer
        } catch (e) {
          error = e;
        }
        // Fase 11, generación del código de salida
      done(error, error ? null : {
        modulo: mod,
        javascript: javascript + zl.javascript.modulo(compilado, mod)
      });
    });
  }

  // Genera código javascript a partir de código
  // en zl
  zl.Evaluar = function(zlcode, subrutina, carga, entorno) {
    // TODO: Esto está roto
    zlcode = zlcode.trim();
    if (!zlcode.length)
      return "No hay código seleccionado";
    try {
      // Fase 1, obtener el árbol sintáctico de la expresión:
      var compilado = zl.sintaxis.arbolExpresion(zlcode);
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
