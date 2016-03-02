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

  function testarSentencias(arbol, sub) {
    // Comprobar si el árbol debe ser asíncrono.
    // Útil si se va a compilar a lenguajes como javascript.
    var asincrono = false;
    for (var k in arbol) {
      var s = arbol[k];
      if (s.tipo == "asignacion") {
        var varizq = sub.declaraciones[s.variable];
        var tipoder = testarExpresion(s.valor, sub);
        if (!varizq) {
          throw zl.error.newError(zl.error.E_NOMBRE_NO_DEFINIDO, {
            posicion: [s.begin, s.end],
            nombre: s.variable,
            declaraciones: sub.declaraciones
          });
        }
        if (varizq.modificadores === varizq.M_ENTRADA) {
          throw zl.error.newError(zl.error.E_ESCRITURA_ILEGAL, {
            declaracion: varizq,
            posicion: [s.begin, s.end]
          });
        }
        var tipoizq = varizq.tipo;
        if (s.acceso && tipoizq.nombre != "lista" && tipoizq.nombre != "relacion") {
          throw zl.error.newError(zl.error.E_INDICE_NO_LISTA_NO_RELACION, {
            posicion: [s.begin, s.end],
            nombre: s.variable,
            tipo: tipoizq
          });
        }
        // TODO: Comprobar el tipo de la clave
        if (s.acceso && tipoizq.nombre === "lista")
          tipoizq = varizq.genericidad.subtipo;
        else if (s.acceso && tipoizq.nombre === "relacion")
          tipoizq = varizq.genericidad.valor;
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
        if (tipo.nombre != "numero") {
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
        if (tipo.nombre != "booleano") {
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
            if (tipo.nombre != "booleano") {
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
    var n = arbol.nombre;
    // El módulo no siempre es sub.padre,
    // sino que puede ser otro módulo:
    if (n.indexOf('.') > -1) {
      // TODO: comprobar si el tipo es primitivo.
      // TODO: comprobar si el nombre no existe.
      // TODO: comprobar si la subrutina es interna.
      var r = n.split('.');
      n = r[1];
      modulo = sub.declaraciones[r[0].toLowerCase()].tipo.modulo;
    }
    var llamada = modulo.subrutinaPorNombre(n);
    if (!llamada)
      throw zl.error.newError(zl.error.E_LLAMADA_NOMBRE_NO_ENCONTRADO, {
        arbol: arbol,
        tabla: modulo.arrayDeSubrutinas()
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
        if (!decl2.tipo.esCompatible(tipo))
          throw zl.error.newError(zl.error.E_LLAMADA_DATO_INCOMPATIBLE, {
            esperado: decl2.tipo,
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
        if (!decl2.tipo.esCompatible(der.tipo))
          throw zl.error.newError(zl.error.E_LLAMADA_DATO_INCOMPATIBLE, {
            esperado: decl2.tipo,
            obtenido: der.tipo,
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
      return modulo.tipoPorNombre("numero");
    } else if (arbol.tipo == "texto") {
      return modulo.tipoPorNombre("texto");
    } else if (arbol.tipo == "letra") {
      return modulo.tipoPorNombre("letra");
    } else if (arbol.tipo == "expresion") {
      return testarExpresion(arbol.valor, sub);
    } else if (arbol.tipo == "verdadero") {
      return modulo.tipoPorNombre("booleano");
    } else if (arbol.tipo == "falso") {
      return modulo.tipoPorNombre("booleano");
    } else if (arbol.tipo == "conversion") {
      var tipo = modulo.tipoPorNombre(arbol.tipoObjetivo);
      if (!tipo) {
        throw zl.error.newError(zl.error.E_TIPO_NO_EXISTE, {
          posicion: [arbol.begin, arbol.end],
          tipo: arbol.tipoObjetivo
        });
      }
      var datoTipo = testarExpresion({
        tipo: "nombre",
        valor: arbol.nombre,
        begin: arbol.begin,
        end: arbol.end
      }, sub);
      if (!(tipo.nombre in datoTipo.conversiones)) {
        throw zl.error.newError(zl.error.E_CONVERSOR_NO_EXISTE, {
          posicion: [arbol.begin, arbol.end],
          tipoObjetivo: arbol.tipoObjetivo,
          tipoBase: datoTipo.nombre
        });
      }
      arbol.subrutinaConversora = datoTipo.conversiones[tipo.nombre];
      return tipo;
    } else if (arbol.tipo == "acceso") {
      var tipo = testarExpresion({
        tipo: "nombre",
        valor: arbol.nombre,
        begin: arbol.begin,
        end: arbol.end
      }, sub);
      if (tipo.nombre != "lista" && tipo.nombre != "relacion")
        throw zl.error.newError(zl.error.E_INDICE_NO_LISTA_NO_RELACION, {
          posicion: [arbol.begin, arbol.end],
          nombre: arbol.nombre,
          tipo: tipo
        });
      var dato = sub.declaraciones[arbol.nombre.toLowerCase()];
      if (tipo.nombre === "lista")
        return dato.genericidad.subtipo;
      if (tipo.nombre === "relacion")
        return dato.genericidad.valor;
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
      if (dato.tipo)
        return dato.tipo;
    }
    // Expresiones complejas
    else if (!arbol.tipo && arbol.op && arbol.der) {
      var tipoder = testarExpresion(arbol.der, sub);
      var op = arbol.op;
      // binarias:
      if (arbol.izq) {
        var tipoizq = testarExpresion(arbol.izq, sub);
        // Comprobaciones de tipos y operaciones:
        var operacion = tipoizq.opbinario[op];
        if (!operacion)
          throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
            posicion: [arbol.begin, arbol.end],
            op: op,
            izq: tipoizq,
            der: tipoder,
            posizq: [arbol.izq.begin, arbol.izq.end],
            posder: [arbol.der.begin, arbol.der.end]
          });
        var tipores = operacion[tipoder.nombre];
        if (!tipores)
          throw zl.error.newError(zl.error.E_OPERACION_TIPO_INCOMPATIBLE_BINARIO, {
            posicion: [arbol.begin, arbol.end],
            op: op,
            izq: tipoizq,
            der: tipoder,
            posizq: [arbol.izq.begin, arbol.izq.end],
            posder: [arbol.der.begin, arbol.der.end]
          });
        return modulo.tipoPorNombre(tipores.resultado);
      } else /* Operaciones unarias */ {
        var operacion = tipoder.opunario[op];
        if (!operacion)
          throw zl.error.newError(zl.error.E_OPERACION_NO_DEFINIDA, {
            posicion: [arbol.begin, arbol.end],
            op: op,
            der: tipoder,
            posder: [arbol.der.begin, arbol.der.end]
          });
        return modulo.tipoPorNombre(operacion.resultado);
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
