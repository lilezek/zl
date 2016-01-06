var modulo = function(zl) {
  "use strict";

  zl.sintaxis = zl.sintaxis || {};

  var palabrasReservadas = {
    "no": true,
    "y": true,
    "o": true,
    "hacer": true,
    "si": true,
    "fin": true,
    "verdadero": true,
    "falso": true,
    "imposible": true,
    //"nada": true,
    "veces": true,
    "repetir": true,
    "mientras": true,
    "subrutina": true,
    "externa": true,
    "es": true,
    "rapida": true,
    "entrada": true,
    "salida": true,
    "de": true,
    "datos": true,
    "algoritmo": true,
    "global": true
  };

  // Usando el analizador que he construido, genero los símbolos del lenguaje

  var a = zl.sintaxis.zlAnalizador = zl.analizador.newAnalizador();
  a.simbolo("<-");
  a.simbolo(".", /^\./);
  a.simbolo("no");
  a.simbolo("y");
  a.simbolo("o");
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
  a.simbolo("->");
  a.simbolo("%");

  a.simbolo("hacer");
  a.simbolo("si");
  a.simbolo("veces");
  a.simbolo("fin");
  a.simbolo(":repetir", /^repetir/i);
  a.simbolo(":mientras", /^mientras/i);
  a.simbolo(":subrutina", /^subrutina/i);
  a.simbolo("externa");
  a.simbolo("es");
  a.simbolo("de");
  a.simbolo("datos");
  a.simbolo("algoritmo");
  a.simbolo("relacion", /^(relacion|relación)/i);
  a.simbolo("lista");
  a.simbolo("a");
  a.simbolo("..");
  a.simbolo(";");

  // Los distintos tokens:

  a.token("verdadero", /^verdadero/i, 0);
  a.token("falso", /^falso/i, 1);
  a.token("subModificador", /^(es|rapida|rápida|externa|constante|funcion|asíncrona|asincrona)/i, 2);
  a.token("decModificador", /^((?:de\s+entrada)|(?:de\s+salida)|global)/i, 3);
  a.token("entero", /^((?:[0-1]+(?:\|2))|(?:[0-9A-Fa-f]+(?:\|16))|(?:[0-9]+(?:\|10)?))/i, 4);
  a.token("decimal", /^(\d+\.\d+)/i, 5);
  a.token("texto", /^\"([^"\\]|\\.|\\\n)*\"/i, 6);
  a.token("letra", /^\'([^'\\]|\\.|\\\n)*\'/i, 7);
  a.token("nombreSimple", /^([A-Za-záéíóúÁÉÍÓÚñÑ][A-Za-záéíóúÁÉÍÓÚñÑ0-9]*)/, 8);


  // Y Las reglas:
  a.regla("configuracion", function() {
    // TODO: Stub
    return this;
  });

  a.regla("numero", function() {
    this.intentar([
      ["decimal"],
      ["entero"]
    ]);
    var intento = this.resultado(0);
    this.registrarResultado(this.resultado(0, intento, 0));
    return this;
  });

  a.regla("modulo", function() {
    this.acumular("subrutina").avanzarObligatorioVarios();
    this.registrarResultado({
      subrutinas: this.resultado(0)
    });
    return this;
  });

  a.regla("nombre", function() {
    this.avanzar("nombreSimple")
      .acumular(".")
      .acumular("nombreSimple")
      .avanzarVarios();
    var resultado = this.arbol(0).resultado;
    for (var i = 0; i < this.arbol(1).length; i++) {
      resultado += this.resultado(1, i, 0); // "."
      resultado += this.resultado(1, i, 1); // "nombreSimple"
    }
    this.registrarResultado(resultado);
    // Comprobar que el resultado no es una palabra reservada
    if (resultado.toLowerCase() in palabrasReservadas) {
      // Retroceder el nombre si está reservado
      this.retroceder(2);
      throw zl.error.newError(zl.error.E_PALABRA_RESERVADA, this.arbol());
    }
    return this;
  });

  a.regla("declaracion", function() {
    this.nombre()
      .avanzar("es")
      .intentar([
        ["relacion", "de", "nombre", "a", "nombre"],
        ["lista", "de", "nombre"],
        ["nombre"]
      ])
      .acumular("decModificador")
      .avanzarVarios();
    var intento = this.resultado(2);
    if (intento == 2) {
      this.registrarResultado({
        nombre: this.resultado(0),
        tipo: this.resultado(2, intento, 0),
        modificadores: this.resultado(3)
      });
    } else if (intento == 1) {
      this.registrarResultado({
        nombre: this.resultado(0),
        tipo: "lista",
        subtipo: this.resultado(2, intento, 2),
        modificadores: this.resultado(3)
      });
    } else if (intento == 0) {
      this.registrarResultado({
        nombre: this.resultado(0),
        tipo: "relacion",
        clave: this.resultado(2, intento, 2),
        valor: this.resultado(2, intento, 4),
        modificadores: this.resultado(3)
      });
    }
    return this;
  });

  a.regla("subrutina", function() {
    // Cabecera
    this.avanzar(":subrutina")
      .acumular("subModificador").avanzarVarios()
      .avanzar("nombreSimple")
      // Datos
      .avanzar("datos")
      .acumular("declaracion").avanzarObligatorioVarios()
      // Algoritmo
      .avanzar("algoritmo")
      .acumular("sentencia").avanzarObligatorioVarios()
      // Fin
      .avanzar("fin");
    this.registrarResultado({
      nombre: this.resultado(2),
      modificadores: this.resultado(1),
      datos: this.resultado(4),
      sentencias: this.resultado(6)
    });
    return this;
  });

  a.regla("sentencia", function() {
    this.intentar([
      ["asignacion"],
      ["llamada"],
      ["repetir"],
      ["sicondicional"],
      ["mientras"]
    ]);
    var x = this.resultado(0);
    var r = this.resultado(0, x, 0);
    r.tipo = this.arbol(0, x, 0).tipo;
    this.registrarResultado(r);
    return this;
  })

  a.regla("asignacion", function() {
    this.intentar([
        ["nombre", "(", "listaAcceso", ")"],
        ["nombre"]
      ])
      .avanzar("<-")
      .expresion();
    var intento = this.resultado(0);
    this.registrarResultado({
      variable: this.resultado(0, intento, 0),
      acceso: (intento ? null : this.resultado(0, intento, 2)),
      valor: this.resultado(2)
    });
    return this;
  });

  a.regla("llamada", function() {
    this.nombre()
      .avanzar("[")
      .acumular("llamadaAsignacion").avanzarVarios()
      .avanzar("]")
    var entrada = [];
    var salida = [];
    for (var i = 0; i < this.resultado(2).length; i++) {
      if (this.resultado(2)[i].tipo == "entrada") {
        entrada.push(this.resultado(2)[i]);
      } else {
        salida.push(this.resultado(2)[i]);
      }
    }
    this.registrarResultado({
      nombre: this.resultado(0),
      entrada: entrada,
      salida: salida,
    });
  });

  a.regla("repetir", function() {
    this.avanzar(":repetir")
      .expresion()
      .avanzar("veces")
      .acumular("sentencia").avanzarObligatorioVarios()
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
      .acumular("sentencia").avanzarObligatorioVarios()
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
    var intento = this.resultado(1);
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
        .acumular("sentencia").avanzarObligatorioVarios();
      this.intentar([
        ["fin"],
        ["sinocondicional"],
        ["sino"]
      ]);
      var intento = this.resultado(4);
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
    var intento = this.resultado(5);
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
            ["no"],
            ["y"],
            ["o"],
            ["<"],
            [">"],
            ["<="],
            [">="],
            ["="],
            ["<>"],
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
        var intento = this.resultado(1);
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

  a.regla("evaluacion", function() {
    this.intentar([
      ["numero"],
      ["texto"],
      ["letra"],
      ["verdadero"],
      ["falso"],
      ["nombre", "(", "listaAcceso", ")"],
      ["nombre"],
      ["(", "expresion", ")"]
    ]);
    var intento = this.resultado(0);
    if (intento == 7)
      this.registrarResultado({
        valor: this.resultado(0, intento, 1),
        tipo: this.arbol(0, intento, 1).tipo
      });
    else if (intento == 5) {
      this.registrarResultado({
        nombre: this.resultado(0, intento, 0),
        acceso: this.resultado(0, intento, 2),
        tipo: "acceso"
      });
    } else
      this.registrarResultado({
        valor: this.resultado(0, intento, 0),
        tipo: this.arbol(0, intento, 0).tipo
      });
    return this;
  });

  a.regla("listaAcceso", function() {
    this.acceso()
      .acumular(";")
      .acumular("acceso").avanzarVarios();
    var resultado = [this.resultado(0)];
    for (var i = 0; i < this.resultado(1).length; i++) {
      resultado.push(this.resultado(1)[i][1]);
    }
    this.registrarResultado(resultado);
    return this;
  });

  a.regla("acceso", function() {
    this.intentar([
      ["rango"],
      ["expresion"]
    ]);
    var intento = this.resultado(0);
    this.registrarResultado({
      valor: this.resultado(0, intento, 0),
      tipo: (intento ? "expresion" : "rango")
    });
    return this;
  });

  a.regla("rango", function() {
    this.avanzar("entero")
      .avanzar("..")
      .avanzar("entero");
    this.registrarResultado({
      minimo: this.resultado(0),
      maximo: this.resultado(2)
    })
    return this;
  });
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
