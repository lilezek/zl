const zlsintaxis = zl => {
  zl.sintaxis = zl.sintaxis || {};

  const palabrasReservadas = {
    "no": true,
    "y": true,
    "o": true,
    "si": true,
    "fin": true,
    "verdadero": true,
    "falso": true,
    "veces": true,
    "repetir": true,
    "mientras": true,
    "subrutina": true,
    "interna": true,
    "primitiva": true,
    "es": true,
    "entrada": true,
    "salida": true,
    "de": true,
    "datos": true,
    "algoritmo": true,
    "global": true,
    "pausar": true,
    "integrar": true,
    "importar": true,
    "asincrona": true
  };

  // Usando el analizador que he construido, genero los símbolos del lenguaje

  const a = zl.sintaxis.zlAnalizador = zl.analizador.newAnalizador();
  a.simbolo("<-");
  a.simbolo(".", /^\./);
  a.simbolo("no", /^no(?![a-záéíóúñ0-9])/i);
  a.simbolo("y", /^y(?![a-záéíóúñ0-9])/i);
  a.simbolo("o", /^o(?![a-záéíóúñ0-9])/i);
  a.simbolo("<");
  a.simbolo(">");
  a.simbolo("<=");
  a.simbolo(">=");
  a.simbolo("=");
  a.simbolo("<>");
  a.simbolo("+", /^\+/);
  a.simbolo("-");
  a.simbolo("*", /^\*/);
  a.simbolo("/", /^\//);
  a.simbolo(")", /^\)/);
  a.simbolo("(", /^\(/);
  a.simbolo("[", /^\[/);
  a.simbolo("]", /^\]/);
  a.simbolo("{", /^\{/);
  a.simbolo("}", /^\}/);
  a.simbolo("->");
  a.simbolo("%");

  a.simbolo("hacer");
  a.simbolo("si");
  a.simbolo("veces");
  a.simbolo("fin");
  a.simbolo(":repetir", /^repetir/i);
  a.simbolo(":mientras", /^mientras/i);
  a.simbolo(":subrutina", /^subrutina/i);
  a.simbolo("es");
  a.simbolo("de");
  a.simbolo("datos");
  a.simbolo("algoritmo");
  a.simbolo("relacion", /^(relacion|relación)/i);
  a.simbolo("lista");
  a.simbolo("a");
  a.simbolo("..");
  a.simbolo(",");
  a.simbolo("pausar");
  a.simbolo(":configuracion", /^configuracion/i);
  a.simbolo("importar");
  a.simbolo("integrar");
  a.simbolo("como");

  // Los distintos tokens:

  a.token("verdadero", /^verdadero/i, 0);
  a.token("falso", /^falso/i, 1);
  a.token("subModificador", /^(interna|primitiva|conversora|asincrona|operadorsuma|operadorresta|operadorproducto|operadoraccesolectura|operadoraccesoescritura)/i, 2);
  a.token("decModificador", /^((?:de\s+entrada)|(?:de\s+salida)|global)/i, 3);
  a.token("entero", /^((?:[0-1]+(?:\|2))|(?:[0-9A-Fa-f]+(?:\|16))|(?:[0-9]+(?:\|10)?))/i, 4);
  a.token("decimal", /^(\d+\.\d+)/i, 5);
  a.token("texto", /^\"([^"\\]|\\.|\\\n)*\"/i, 6);
  a.token("letra", /^\'([^'\\]|\\.|\\\n)*\'/i, 7);
  a.token("nombreSimple", /^([a-záéíóúñ][a-záéíóúñ0-9]*)/i, 8);


  // Y Las reglas:
  a.regla("configuraciones", function() {
    this.avanzar(":configuracion")
      .acumular("configuracion").avanzarVarios()
      .avanzar("fin");
    this.registrarResultado(this.resultado(1));
    return this;
  });

  a.regla("configuracion", function() {
    this.intentar([
      ["importar", "texto"],
      ["integrar", "texto"],
      ["nombre", "<-", "texto"],
      ["nombre", "<-", "numero"]
    ]);
    const intento = this.resultado(0);
    if (intento == 0) {
      this.registrarResultado({
        tipo: "importar",
        camino: this.resultado(0, intento, 1)
      });
    } else if (intento == 1) {
      this.registrarResultado({
        tipo: "integrar",
        camino: this.resultado(0, intento, 1)
      });
    } else if (intento === 3) {
      this.registrarResultado({
        tipo: "configurar",
        nombre: this.resultado(0, intento, 0),
        valor: this.resultado(0, intento, 2),
        tipoValor: "number"
      });
    } else if (intento === 2) {
      let valor = this.resultado(0, intento, 2);
      valor = valor.substring(1, valor.length - 1);
      this.registrarResultado({
        tipo: "configurar",
        nombre: this.resultado(0, intento, 0),
        valor,
        tipoValor: "string"
      });
    }
    return this;
  });

  a.regla("numero", function() {
    this.intentar([
      ["decimal"],
      ["entero"]
    ]);
    const intento = this.resultado(0);
    this.registrarResultado(this.resultado(0, intento, 0));
    return this;
  });

  a.regla("modulo", function() {
    this.acumular("subrutina").avanzarVarios();
    this.registrarResultado({
      subrutinas: this.resultado(0)
    });
    return this;
  });

  a.regla("nombre", function() {
    this.avanzar("nombreSimple");
    let resultado;
    this.registrarResultado(resultado = this.resultado(0));
    // Comprobar que el resultado no es una palabra reservada
    if (resultado.toLowerCase() in palabrasReservadas) {
      // Retroceder el nombre si está reservado
      this.retroceder(1);
      throw zl.error.newError(zl.error.E_PALABRA_RESERVADA, this.arbol());
    }
    return this;
  });

  a.regla("declaracion", function() {
    this.nombre()
      .avanzar("es")
      .tipo()
      .acumular("decModificador").avanzarVarios()


    this.registrarResultado({
      nombre: this.resultado(0),
      tipoInstancia: this.resultado(2),
      modificadores: this.resultado(3)
    });
    return this;
  });

  a.regla("tipo", function() {
    this.nombre()
      .acumular("(").acumular("genericidad").acumular(")").avanzarVarios()
    let genericos = new Array();
    for (let i = 0; i < this.resultado(1).length; i++) {
      genericos = genericos.concat(this.resultado(1, i, 1));
    }
    this.registrarResultado({
      tipo: this.resultado(0),
      genericos
    })
    return this;
  });

  a.regla("genericidad", function() {
    const resultado = [];
    this.intentar([
      ["tipo"],
      ["numero"]
    ]);
    var intento = this.resultado(0);
    resultado.push(this.resultado(0, intento, 0));
    this.acumular(",")
      .intento([
        ["tipo"],
        ["numero"]
      ]).avanzarVarios();
    for (let i = 0; i < this.resultado(1).length; i++) {
      var intento = this.resultado(1, i, 1);
      resultado.push(this.resultado(1, i, 1, intento, 0));
    }
    this.registrarResultado(resultado);
    return this;
  });

  a.regla("subrutina", function() {
    // Cabecera
    this.avanzar(":subrutina")
      .acumular("subModificador").avanzarVarios()
      .avanzar("nombreSimple")
      // Datos
      .avanzar("datos")
      .acumular("declaracion").avanzarVarios()
      // Algoritmo
      .avanzar("algoritmo")
      .acumular("sentencia").avanzarVarios()
      // Fin
      .avanzar("fin");
    const sub = {
      nombre: this.resultado(2),
      modificadores: this.resultado(1),
      datos: this.resultado(4) || [],
      sentencias: this.resultado(6) || [],
      secciones: {
        cabecera: [this.arbol(0).begin, this.arbol(2).end],
        datos: [this.arbol(3).begin, this.arbol(4).end],
        algoritmo: [this.arbol(5).begin, this.arbol(7).begin]
      }
    };
    // Buscar primitiva:
    for (let i = 0; i < sub.modificadores.length; i++) {
      if (sub.modificadores[i].toLowerCase() === "primitiva") {
        sub.segmentoPrimitivo = this.texto.substring(sub.secciones.algoritmo[0] + 10, sub.secciones.algoritmo[1]).trim();
      }
    }
    this.registrarResultado(sub);
    return this;
  });

  a.regla("sentencia", function() {
    this.intentar([
      ["asignacion"],
      ["llamada"],
      ["repetir"],
      ["sicondicional"],
      ["mientras"],
      ["pausar"]
    ]);
    const x = this.resultado(0);
    let r = this.resultado(0, x, 0);
    if (x == 5)
      r = {
        tipo: "pausar"
      };
    else
      r.tipo = this.arbol(0, x, 0).tipo;
    this.registrarResultado(r);
    return this;
  })

  a.regla("asignacion", function() {
    this.intentar([
        ["lvalor"],
        ["nombre"]
      ])
      .avanzar("<-")
      .expresion();
    const intento = this.resultado(0);
    this.registrarResultado({
      variable: this.resultado(0, intento, 0),
      valor: this.resultado(2)
    });
    return this;
  });

  a.regla("llamada", function() {
    let contexto = null;
    try {
      this.lvalor().avanzar(".");
      contexto = this.resultado(0);
    } catch (e) {
      if (!zl.error.esError(e))
        throw e;
      this.retroceder(this.arbol().length);
    }
    const indice = this.arbol().length;
    this
      .nombre()
      .avanzar("[")
      .acumular("llamadaAsignacion").avanzarVarios()
      .avanzar("]")

    const entrada = [];
    const salida = [];
    for (let i = 0; i < this.resultado(indice+2).length; i++) {
      if (this.resultado(indice+2)[i].tipo == "entrada") {
        entrada.push(this.resultado(indice+2)[i]);
      } else {
        salida.push(this.resultado(indice+2)[i]);
      }
    }
    this.registrarResultado({
      contexto,
      nombre: this.resultado(indice),
      entrada,
      salida,
    });
  });

  a.regla("repetir", function() {
    this.avanzar(":repetir")
      .expresion()
      .avanzar("veces")
      .acumular("sentencia").avanzarVarios()
      .avanzar("fin")
    this.registrarResultado({
      veces: this.resultado(1),
      sentencias: this.resultado(3)
    });
    return this;
  });

  a.regla("mientras", function() {
    this.avanzar(":mientras")
      .expresion()
      .avanzar("hacer")
      .acumular("sentencia").avanzarVarios()
      .avanzar("fin")
    this.registrarResultado({
      condicion: this.resultado(1),
      sentencias: this.resultado(3)
    });
    return this;
  });

  a.regla("llamadaAsignacion", function() {
    // Entrada
    this.avanzar("nombreSimple")
      .intentar([
        ["<-", "expresion"],
        ["->", "nombre", "(", "listaAcceso", ")"],
        ["->", "nombre"]
      ]);
    const intento = this.resultado(1);
    this.registrarResultado({
      tipo: (intento ? "salida" : "entrada"),
      izq: this.resultado(0),
      der: this.resultado(1, intento, 1)
    });
    return this;
  });

  a.regla("sicondicional", function() {
    // Romper la ambiguedad LL(3) entre
    // si no x hacer
    // si no hacer
    try {
      this.avanzar("si")
        .avanzar("no")
        .avanzar("hacer")
    } catch (e) {
      if (!zl.error.esError(e))
        throw e;
      // Si no se puede hacer el si no hacer, intentar la reducción de verdad
      this.retroceder(this.arbol().length);
      this.avanzar("si")
        .expresion()
        .avanzar("hacer")
        .acumular("sentencia").avanzarVarios();
      this.intentar([
        ["fin"],
        ["sinocondicional"],
        ["sino"]
      ]);
      const intento = this.resultado(4);
      if (intento == 0) {
        this.registrarResultado({
          condicion: this.resultado(1),
          sentencias: this.resultado(3)
        });
      } else {
        this.registrarResultado({
          condicion: this.resultado(1),
          sentencias: this.resultado(3),
          siguiente: this.resultado(4, intento, 0)
        });
      }
      return this;
    }
    // Si no se llama al catch, es porque se pudo hacer un si no hacer.
    // En el caso de si no hacer, retroceder 3 y lanzar error:
    this.retroceder(3);
    throw zl.error.newError(zl.error.E_SIMBOLO, this.arbol());
  });

  a.regla("sinocondicional", function() {
    this.avanzar("o")
      .avanzar("si")
      .expresion()
      .avanzar("hacer")
      .acumular("sentencia").avanzarObligatorioVarios()
      .intentar([
        ["fin"],
        ["sinocondicional"],
        ["sino"]
      ])
    const intento = this.resultado(5);
    if (intento == 0) {
      this.registrarResultado({
        condicion: this.resultado(2),
        sentencias: this.resultado(4)
      });
    } else {
      this.registrarResultado({
        condicion: this.resultado(2),
        sentencias: this.resultado(4),
        siguiente: this.resultado(5, intento, 0)
      });
    }
    return this;
  });

  a.regla("sino", function() {
    this.avanzar("si")
      .avanzar("no")
      .avanzar("hacer")
      .acumular("sentencia").avanzarObligatorioVarios()
      .avanzar("fin")
    this.registrarResultado({
      sentencias: this.resultado(3)
    });
    return this;
  });

  a.regla("expresion", function() {
    this.evaluacion();
    // Antes de intentar la expresión, se intenta encontrar el "o si"
    try {
      this.avanzar("o")
        .avanzar("si");
    } catch (e) {
      this.retroceder(this.arbol().length - 1);
      try {
        this.intentar([
            //["no"],
            ["y"],
            ["o"],
            ["<="],
            [">="],
            ["<>"],
            ["<"],
            [">"],
            ["="],
            ["+"],
            ["-"],
            ["*"],
            ["/"],
            ["%"]
          ])
          .expresion();
      } catch (e) {
        if (this.arbol().length > 2)
          throw e;
        this.retroceder(1);
      }
      if (this.arbol().length == 1)
        this.registrarResultado(this.resultado(0));
      else {
        const intento = this.resultado(1);
        this.registrarResultado({
          izq: this.resultado(0),
          der: this.resultado(2),
          op: this.resultado(1, intento, 0)
        });
      }
      return this;
    }
    // Caso de que se encuentra "o si":
    this.retroceder(2);
    this.registrarResultado(this.resultado(0));
    return this;
  });

  a.regla("expresionUnaria", function() {
    this.intentar([
      ["-"],
      ["+"],
      ["no"]
    ]).evaluacion();
    const intento = this.resultado(0);
    this.registrarResultado({
      der: this.resultado(1),
      op: this.resultado(0, intento, 0)
    });
    return this;
  })

  a.regla("evaluacion", function() {
    this.intentar([
      ["numero"],
      ["texto"],
      ["letra"],
      ["verdadero"],
      ["falso"],
      ["listaConstructor"],
      ["nombre"],
      ["expresionUnaria"],
      ["(", "expresion", ")"]
    ]);
    var intento = this.resultado(0);
    let evalResultado = null;
    if (intento == 8)
      evalResultado = {
        valor: this.resultado(0, intento, 1),
        tipo: this.arbol(0, intento, 1).tipo
      };
    else if (intento == 7)
      evalResultado = {
        valor: this.resultado(0, intento, 0),
        tipo: "expresion"
      };
    else if (intento == 5) {
      evalResultado = {
        valor: this.resultado(0, intento, 0),
        length: this.resultado(0, intento, 0).length,
        tipo: "lista"
      };
    } else
      evalResultado = {
        valor: this.resultado(0, intento, 0),
        tipo: this.arbol(0, intento, 0).tipo
      };
    this.intento([
      ["como", "tipo"],
      ["(", "listaAcceso", ")"]
    ]).avanzarVarios();
    for (let i = 0; i < this.resultado(1).length; i++) {
      var intento = this.resultado(1, i);
      if (intento === 0) {
        evalResultado = {
          evaluacion: evalResultado,
          tipoObjetivo: this.resultado(1, i, intento, 1),
          tipo: "conversion"
        }
      } else if (intento === 1) {
        const arr = this.resultado(1,i,intento,1);
        for (let j = 0; j < arr.length; j++) {
          evalResultado = {
            izq: evalResultado,
            der: arr[j],
            op: "()"
          }
        }
      }
    }

    this.registrarResultado(evalResultado);
    return this;
  });

  a.regla("lvalor", function() {
    this.nombre()
      .acumular("(")
      .acumular("listaAcceso")
      .acumular(")").avanzarVarios();
    let accesos = [];
    for (let i = 0; i < this.resultado(1).length; i++) {
      accesos = accesos.concat(this.resultado(1,i,1));
    }
    this.registrarResultado({
      dato: this.resultado(0),
      accesos
    });
    return this;
  });

  a.regla("listaValores", function() {
    this.expresion()
      .acumular(",").acumular("expresion").avanzarVarios();
    const res = [this.resultado(0)];
    for (let i = 0; i < this.resultado(1).length; i++) {
      res.push(this.resultado(1)[i][1]);
    }
    this.registrarResultado(res);
    return this;
  });

  a.regla("listaConstructor", function() {
    this.avanzar("{")
      .listaValores()
      .avanzar("}");
    this.registrarResultado(this.resultado(1));
    return this;
  });

  a.regla("listaAcceso", function() {
    this.expresion()
      .acumular(",").acumular("expresion").avanzarVarios();
    const resultado = [this.resultado(0)];
    for (let i = 0; i < this.resultado(1).length; i++) {
      resultado.push(this.resultado(1, i, 1));
    }
    this.registrarResultado(resultado);
    return this;
  });

  return zl;
};

if (typeof module !== "undefined")
  module.exports = zlsintaxis;
else {
  this.zl = zlsintaxis(this.zl || {});
}
