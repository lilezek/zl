var modulo = function(zl) {
  "use strict";
  zl.semantica = zl.semantica || {};

  zl.semantica.testarModulo = function(arbol, modulo) {
    var programa = modulo.padre;
    // Comprobar todas las llamadas son válidas
    for (var i = 0; i < arbol.subrutinas.length; i++) {
      testarSubrutina(arbol.subrutinas[i], modulo.subrutinaPorNombre(arbol.subrutinas[i].nombre.toLowerCase()));
    }
  }

  function testarSubrutina(arbol, sub) {
    // TODO: comprobar partes de la cabecera
    var asincrono = testarSentencias(arbol.sentencias, sub);
    // TODO: Convertir en asincronas las subrutinas que usan esta.
    if (asincrono)
      sub.modificadores.asincrona = true;
  }

  function testarLValor(arbol, sub) {
    var varizq = sub.declaraciones[arbol.dato];
    if (!varizq) {
      throw zl.error.newError(zl.error.E_NOMBRE_NO_DEFINIDO, {
        posicion: [arbol.begin, arbol.end],
        nombre: arbol.dato,
        declaraciones: sub.declaraciones
      });
    }
    if (varizq.modificadores === varizq.M_ENTRADA) {
      throw zl.error.newError(zl.error.E_ESCRITURA_ILEGAL, {
        declaracion: varizq,
        posicion: [arbol.begin, arbol.end]
      });
    }
    var tipoActual = varizq.tipoInstancia;
    var modulo = sub.padre;
    for (var i = 0; i < arbol.accesos.length; i++) {
      var acceso = arbol.accesos[i];
      var tipoacc = testarExpresion(acceso, sub);
      var operacion = modulo.operadorBinario("()", tipoActual, tipoacc);
      if (!operacion)
        throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
          posicion: [arbol.begin, arbol.end],
          op: "()",
          izq: tipoActual,
          der: tipoacc,
          posizq: [arbol.dato.begin, acceso.begin - 1],
          posder: [acceso.begin, acceso.end]
        });
      acceso.alias = operacion.alias;
      acceso.localizacion = operacion.localizacion;
      tipoActual = operacion.tipoResultado;
    }
    return tipoActual;
  }

  function testarLValorAsignacion(arbol, sub) {
    var varizq = sub.declaraciones[arbol.dato];
    if (!varizq) {
      throw zl.error.newError(zl.error.E_NOMBRE_NO_DEFINIDO, {
        posicion: [arbol.begin, arbol.end],
        nombre: arbol.dato,
        declaraciones: sub.declaraciones
      });
    }
    if (varizq.modificadores === varizq.M_ENTRADA) {
      throw zl.error.newError(zl.error.E_ESCRITURA_ILEGAL, {
        declaracion: varizq,
        posicion: [arbol.begin, arbol.end]
      });
    }
    var tipoActual = varizq.tipoInstancia;
    var modulo = sub.padre;
    for (var i = 0; i < arbol.accesos.length - 1; i++) {
      var acceso = arbol.accesos[i];
      var tipoacc = testarExpresion(acceso, sub);
      var operacion = modulo.operadorBinario("()", tipoActual, tipoacc);
      if (!operacion)
        throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
          posicion: [arbol.begin, arbol.end],
          op: "()",
          izq: tipoActual,
          der: tipoacc,
          posizq: [arbol.dato.begin, acceso.begin - 1],
          posder: [acceso.begin, acceso.end]
        });
      acceso.alias = operacion.alias;
      acceso.localizacion = operacion.localizacion;
      tipoActual = operacion.tipoResultado;
    }
    if (arbol.accesos.length) {
      var acceso = arbol.accesos[arbol.accesos.length - 1];
      var tipoacc = testarExpresion(acceso, sub);
      var operacion = modulo.operadorBinario("(&)", tipoActual, tipoacc);
      if (!operacion)
        throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
          posicion: [arbol.begin, arbol.end],
          op: "(&)",
          izq: tipoActual,
          der: tipoacc,
          posizq: [arbol.dato.begin, acceso.begin - 1],
          posder: [acceso.begin, acceso.end]
        });
      acceso.alias = operacion.alias;
      acceso.localizacion = operacion.localizacion;
      tipoActual = operacion.tipoResultado;
    }
    return tipoActual;
  }

  function testarSentencias(arbol, sub) {
    // Comprobar si el árbol debe ser asíncrono.
    // Útil si se va a compilar a lenguajes como javascript.
    var asincrono = false;
    for (var k in arbol) {
      var s = arbol[k];
      if (s.tipo == "asignacion") {
        var tipoizq = testarLValorAsignacion(s.variable, sub);
        var tipoder = testarExpresion(s.valor, sub);
        if (!tipoizq.esCompatible(tipoder)) {
          throw zl.error.newError(zl.error.E_ASIGNACION_INCOMPATIBLE, {
            esperado: tipoizq,
            obtenido: tipoder,
            arbol: s,
            posicion: [s.begin, s.end]
          });
        }
      } else if (s.tipo == "llamada") {
        s.asincrono = testarLlamada(s, sub);
        asincrono = asincrono || s.asincrono;
      } else if (s.tipo == "repetir") {
        var tipo = testarExpresion(s.veces, sub);
        if (tipo.tipo.nombre != "numero") {
          throw zl.error.newError(zl.error.E_VECES_NO_NUMERICO, {
            arbol: s,
            posicion: [s.veces.begin, s.veces.end],
            tipo: tipo
          });
        }
        s.asincrono = testarSentencias(s.sentencias, sub);
        asincrono = asincrono || s.asincrono;
      } else if (s.tipo == "mientras") {
        var tipo = testarExpresion(s.condicion, sub);
        if (tipo.tipo.nombre != "booleano") {
          throw zl.error.newError(zl.error.E_CONDICION_NO_BOOLEANA, {
            arbol: s,
            posicion: [s.condicion.begin, s.condicion.end],
            tipo: tipo
          });
        }
        s.asincrono = testarSentencias(s.sentencias, sub);
        asincrono = asincrono || s.asincrono;
      } else if (s.tipo == "sicondicional") {
        while (s) {
          if (s.condicion) {
            var tipo = testarExpresion(s.condicion, sub);
            console.log(tipo.tipo.nombre);
            if (tipo.tipo.nombre != "booleano") {
              throw zl.error.newError(zl.error.E_CONDICION_NO_BOOLEANA, {
                arbol: s,
                posicion: [s.condicion.begin, s.condicion.end],
                tipo: tipo
              });
            }
          }
          s.asincrono = testarSentencias(s.sentencias, sub);
          asincrono = asincrono || s.asincrono;
          s = s.siguiente;
        }
      } else if (s.tipo == "pausar") {
        s.asincrono = true;
        asincrono = true;
      }
    }
    return asincrono;
  }

  function testarLlamada(arbol, sub) {
    var modulo = sub.padre;
    var nombre = arbol.nombre;
    var contexto = arbol.contexto;
    var llamada = null;
    if (contexto) {
      var tipoContexto = testarLValor(contexto, sub);
      llamada = tipoContexto.subrutinaPorNombreInstanciada(nombre);
    } else {
      llamada = modulo.subrutinaPorNombre(nombre);
    }
    if (!llamada)
      throw zl.error.newError(zl.error.E_LLAMADA_NOMBRE_NO_ENCONTRADO, {
        arbol: arbol,
        tabla: (modulo ? modulo.arrayDeSubrutinas() : [])
      });
    for (var k in arbol.entrada) {
      var decl = arbol.entrada[k];
      var tipo = testarExpresion(decl.der, sub);
      var nombre = decl.izq;
      if (nombre.toLowerCase() in llamada.declaraciones) {
        var decl2 = llamada.declaraciones[nombre.toLowerCase()];
        if (!(decl2.modificadores & decl2.M_ENTRADA) && decl2.modificadores & decl2.M_SALIDA) {
          throw zl.error.newError(zl.error.E_FLECHA_INCORRECTA, {
            esperado: "->",
            obtenido: "<-",
            dato: decl2,
            posicion: [decl.begin, decl.end]
          });
        }
        if (decl2.modificadores === decl2.M_LOCAL) {
          throw zl.error.newError(zl.error.E_ACCESO_A_DATO_LOCAL, {
            dato: decl2,
            posicion: [decl.begin, decl.end]
          });
        }
        if (!decl2.tipoInstancia.esCompatible(tipo))
          throw zl.error.newError(zl.error.E_LLAMADA_DATO_INCOMPATIBLE, {
            esperado: decl2.tipoInstancia,
            obtenido: tipo,
            dato: decl2,
            posicion: [decl.begin, decl.end]
          });
      } else {
        throw zl.error.newError(zl.error.E_LLAMADA_DATO_INEXISTENTE, {
          dato: decl,
          subrutina: llamada,
          posicion: [decl.begin, decl.end]
        });
      }
    }

    for (var k in arbol.salida) {
      var decl = arbol.salida[k];
      var der = sub.declaraciones[decl.der];
      var nombre = decl.izq;
      if (!der) {
        throw zl.error.newError(zl.error.E_NOMBRE_NO_DEFINIDO, {
          nombre: decl.der,
          posicion: [decl.begin, decl.end],
          declaraciones: sub.declaraciones
        })
      }
      if (nombre.toLowerCase() in llamada.declaraciones) {
        var decl2 = llamada.declaraciones[nombre.toLowerCase()];
        if (!(decl2.modificadores & decl2.M_SALIDA) && decl2.modificadores & decl2.M_ENTRADA) {
          throw zl.error.newError(zl.error.E_FLECHA_INCORRECTA, {
            esperado: "<-",
            obtenido: "->",
            dato: decl2,
            posicion: [decl.begin, decl.end]
          });
        }
        if (decl2.modificadores === decl2.M_LOCAL) {
          throw zl.error.newError(zl.error.E_ACCESO_A_DATO_LOCAL, {
            dato: decl2,
            posicion: [decl.begin, decl.end]
          });
        }
        if (!decl2.tipoInstancia.esCompatible(der.tipoInstancia))
          throw zl.error.newError(zl.error.E_LLAMADA_DATO_INCOMPATIBLE, {
            esperado: decl2.tipoInstancia,
            obtenido: der.tipoInstancia,
            dato: decl2,
            posicion: [decl.begin, decl.end]
          });
      } else {
        throw zl.error.newError(zl.error.E_LLAMADA_DATO_INEXISTENTE, {
          dato: decl,
          subrutina: llamada,
          posicion: [decl.begin, decl.end]
        });
      }
      if (!der) {
        throw zl.error.newError(zl.error.E_NOMBRE_NO_DEFINIDO, {
          nombre: decl.der,
          posicion: [decl.begin, decl.end],
          declaraciones: sub.declaraciones
        });
      }
      if (der.modificadores === der.M_ENTRADA) {
        throw zl.error.newError(zl.error.E_ESCRITURA_ILEGAL, {
          declaracion: der,
          posicion: [decl.begin, decl.end]
        });
      }
    }
    // Esto es útil para testarSentencia:
    if (llamada.modificadores.asincrona === true) {
      arbol.asincrono = true;
      return true;
    }
    return false;
  }

  // Esta función devuelve el tipo de la expresión, si pasó el test.

  function testarExpresion(arbol, sub) {
    // TODO: hack
    return arbol.tipofinal = _testarExpresion(arbol, sub);
  }

  function _testarExpresion(arbol, sub) {
    var modulo = sub.padre;
    if (arbol.tipo == "numero") {
      return modulo.tipoPorNombre("numero").instanciar([], modulo);
    } else if (arbol.tipo == "texto") {
      return modulo.tipoPorNombre("texto").instanciar([], modulo);
    } else if (arbol.tipo == "letra") {
      return modulo.tipoPorNombre("letra").instanciar([], modulo);
    } else if (arbol.tipo == "expresion") {
      return testarExpresion(arbol.valor, sub);
    } else if (arbol.tipo == "verdadero") {
      return modulo.tipoPorNombre("booleano").instanciar([], modulo);
    } else if (arbol.tipo == "falso") {
      return modulo.tipoPorNombre("booleano").instanciar([], modulo);
    } else if (arbol.tipo == "lista") {
      var subtipoInstancia;
      for (var i = 0; i < arbol.length; i++) {
        var subtipo2 = testarExpresion(arbol.valor[i], sub);
        if (subtipoInstancia && !subtipoInstancia.esIgual(subtipo2)) {
          throw zl.error.newError(zl.error.E_LISTA_TIPOS_DISTINTOS, {
            indices: [i, i - 1],
            tipos: [subtipoInstancia, subtipo2],
            posicion: [arbol.begin, arbol.end]
          });
        }
        subtipoInstancia = subtipo2;
      }
      var tlista = modulo.tipoPorNombre("lista");
      if (!tlista) {
        throw zl.error.newError(zl.error.E_LISTA_NO_ESTA_IMPORTADA, {
          posicion: [arbol.begin, arbol.end]
        });
      }
      return tlista.instanciar([subtipoInstancia], modulo);
    } else if (arbol.tipo == "conversion") {
      var tipo = zl.entorno.newTipoInstancia(modulo);
      tipo.rellenarDesdeArbol(arbol.tipoObjetivo, modulo);
      var datoTipo = testarExpresion(arbol.evaluacion, sub);
      arbol.subrutinaConversora = modulo.conversor(tipo, datoTipo);
      if (!arbol.subrutinaConversora) {
        throw zl.error.newError(zl.error.E_CONVERSOR_NO_EXISTE, {
          posicion: [arbol.begin, arbol.end],
          tipoObjetivo: tipo,
          tipoBase: datoTipo
        });
      }
      return tipo;
    } else if (arbol.tipo == "nombre") {
      var dato = sub.declaraciones[arbol.valor.toLowerCase()];
      // TODO: Añadir más información al error
      if (!dato)
        throw zl.error.newError(zl.error.E_NOMBRE_NO_DEFINIDO, {
          nombre: arbol.valor,
          posicion: [arbol.begin, arbol.end],
          declaraciones: sub.declaraciones
        });
      if (dato.modificadores === dato.M_SALIDA)
        throw zl.error.newError(zl.error.E_LECTURA_ILEGAL, {
          declaracion: dato,
          posicion: [arbol.begin, arbol.end]
        });
      return dato.tipoInstancia;
    }
    // Expresiones complejas
    else if (!arbol.tipo && arbol.op && arbol.der) {
      var tipoder = testarExpresion(arbol.der, sub);
      var op = arbol.op;
      // binarias:
      if (arbol.izq) {
        var tipoizq = testarExpresion(arbol.izq, sub);
        // Comprobaciones de tipos y operaciones:
        var operacion = modulo.operadorBinario(op, tipoizq, tipoder);
        // TODO: mover esto a operadorBinario
        if (!operacion)
          throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
            posicion: [arbol.begin, arbol.end],
            op: op,
            izq: tipoizq,
            der: tipoder,
            posizq: [arbol.izq.begin, arbol.izq.end],
            posder: [arbol.der.begin, arbol.der.end]
          });
        var tipores = operacion.tipoResultado;
        return tipores;
      } else /* Operaciones unarias */ {
        var operacion = modulo.operadorUnario(op, tipoder);
        if (!operacion)
          throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
            posicion: [arbol.begin, arbol.end],
            op: op,
            der: tipoder,
            posder: [arbol.der.begin, arbol.der.end]
          });
        return operacion.tipoResultado;
      }
    }
  }
  zl.semantica.testarExpresion = testarExpresion;

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
