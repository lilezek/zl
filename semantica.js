var zl = zl || {};
zl.semantica = zl.semantica || {};

(function() {
  "use strict";

  zl.semantica.testarModulo = function(arbol, modulo) {
    var programa = modulo.padre;
    // Comprobar todas las llamadas son válidas
    for (var i = 0; i < arbol.subrutinas.length; i++) {
      testarSubrutina(arbol.subrutinas[i], modulo.subrutinaPorNombre(arbol.subrutinas[i].nombre.toLowerCase()));
    }
  }

  function testarSubrutina(arbol, sub) {
    // TODO: acabar esta función
    for (var k in arbol.sentencias) {
      var s = arbol.sentencias[k];
      if (s.tipo == "llamada") {
        testarLlamada(s, sub);
      } else if (s.tipo == "repetir") {
        testarSubrutina(s, sub);
      } else if (s.tipo == "sicondicional") {
        while (s) {
          if (s.condicion) {
            var tipo = testarExpresion(s.condicion, sub);
            console.log(tipo);
            if (tipo.nombre != "booleano") {
              throw zl.error.newError(zl.error.E_CONDICION_NO_BOOLEANA, {});
            }
          }
          testarSubrutina(s, sub);
          s = s.siguiente;
        }
      }
    }
  }

  function testarLlamada(arbol, sub) {
    var programa = sub.padre.padre;
    // TODO: Acabar esta función
    var n = arbol.nombre;
    var llamada = programa.subrutinaPorNombre(n);
    if (!llamada)
      throw zl.error.newError(zl.error.LLAMADA_NOMBRE_NO_ENCONTRADO, {
        arbol: arbol,
        tabla: programa
      });
    for (var k in arbol.entrada) {
      var decl = arbol.entrada[k];
      var tipo = testarExpresion(decl.der, sub);
      var nombre = decl.izq;
      if (nombre.toLowerCase() in llamada.declaraciones) {
        var decl2 = llamada.declaraciones[nombre.toLowerCase()];
        if (!decl2.tipo.esCompatible(tipo))
          throw zl.error.newError(zl.error.E_LLAMADA_DATO_INCOMPATIBLE, {
            esperado: decl2.tipo,
            obtenido: tipo,
            dato: decl2,
            posicion: [decl.$.begin, decl.$.end]
          });
      } else {
        throw zl.error.newError(zl.error.E_LLAMADA_DATO_INEXISTENTE, {
          dato: decl,
          subrutina: llamada,
          posicion: [decl.$.begin, decl.$.end]
        });
      }
    }

    for (var k in arbol.salida) {
      var decl = arbol.salida[k];
      var tipo = testarExpresion({
        tipo: "nombre",
        valor: decl.der,
        $: decl.$
      }, sub);
      var nombre = decl.izq;
      if (nombre.toLowerCase() in llamada.declaraciones) {
        var decl2 = llamada.declaraciones[nombre.toLowerCase()];
        if (!decl2.tipo.esCompatible(tipo))
          throw zl.error.newError(zl.error.E_LLAMADA_DATO_INCOMPATIBLE, {
            esperado: decl2.tipo,
            obtenido: tipo,
            dato: decl2
          });
      } else {
        throw zl.error.newError(zl.error.E_LLAMADA_DATO_INEXISTENTE, {
          dato: decl,
          subrutina: llamada,
          posicion: [decl.$.begin, decl.$.end]
        });
      }
    }
  }

  // Esta función devuelve el tipo de la expresión, si pasó el test.
  function testarExpresion(arbol, sub) {
    var modulo = sub.padre;
    if (arbol.tipo == "numero") {
      return modulo.tipoPorNombre("numero");
    } else if (arbol.tipo == "texto") {
      return modulo.tipoPorNombre("texto");
    } else if (arbol.tipo == "nombre") {
      var dato = sub.declaraciones[arbol.valor.toLowerCase()];
      // TODO: Añadir más información al error
      if (!dato)
        throw zl.error.newError(zl.error.E_NOMBRE_NO_DEFINIDO, {
          nombre: arbol.valor,
          posicion: [arbol.$.begin, arbol.$.end],
          declaraciones: sub.declaraciones
        });
      return dato.tipo;
    }
    // Expresiones complejas
    else if (!arbol.tipo && arbol.nivel) {
      var tipoder = testarExpresion(arbol.der, sub);
      var op = arbol.op;
      // TODO: añadir las unarias
      // binarias:
      if (arbol.izq) {
        var tipoizq = testarExpresion(arbol.izq, sub);
        // Comprobaciones de tipos y operaciones:
        var operacion = tipoizq.opbinario[op];
        if (!operacion)
          throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
            posicion: [arbol.$.begin, arbol.$.end],
            op: op,
            izq: tipoizq,
            der: tipoder,
            posizq: [arbol.izq.$.begin, arbol.izq.$.end],
            posder: [arbol.der.$.begin, arbol.der.$.end]
          });
        var tipores = operacion[tipoder.nombre];
        if (!tipores)
          throw zl.error.newError(zl.error.E_OPERACION_TIPO_INCOMPATIBLE_BINARIO, {
            posicion: [arbol.$.begin, arbol.$.end],
            op: op,
            izq: tipoizq,
            der: tipoder,
            posizq: [arbol.izq.$.begin, arbol.izq.$.end],
            posder: [arbol.der.$.begin, arbol.der.$.end]
          });
        return modulo.tipoPorNombre(tipores);
      }
    }
  }
})();
