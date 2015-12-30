/*
  Siguiendo la sugerencia de laguna sobre el analizador descendente recursivo
  por prioridad de operadores:

  http://javascript.crockford.com/tdop/tdop.html
*/

var zl = zl || {};
zl.analizador = zl.analizador || {};

(function() {
  "use strict";

  function Analizador() {
    this.simbolos = {};
    this.tokens = {
      length: 0
    };
    this.reglas = {};
    this.analizando = "";
    return this;
  }

  Analizador.prototype.empezar = function(texto) {
    return new Analisis(this, texto);
  }

  Analizador.prototype.simbolo = function(id, regex, prioridad) {
    var s = this.simbolos[id];
    prioridad = prioridad || 0;
    if (s) {
      if (prioridad >= s.prioridad) {
        s.prioridad = prioridad;
      }
    } else {
      s = {
        izq: function() {
          throw "Sin implementar"
        },
        der: function() {
          throw "Sin implementar"
        },
        id: id,
        regex: regex || new RegExp("^" + id, "i"),
        prioridad: prioridad
      }
      this.simbolos[id] = s;
    }
    return s;
  };

  Analizador.prototype.token = function(id, regex, prioridad) {
    this.tokens[id] = this.tokens[prioridad] = {
      id: id,
      regex: regex,
      prioridad: prioridad
    };
    this.tokens.length = Math.max(this.tokens.length, prioridad + 1);
  }

  Analizador.prototype.regla = function(nombre, regla) {
    if (typeof regla === "function")
      this.reglas[nombre] = regla;
  }

  function Analisis(analizador, texto) {
    this.analizador = analizador || null;
    this.texto = texto || "";
    this.posicion = 0;
    this.acumulado = [];
    this.pilaAcumulados = [];
    this.nodoActual = new Nodo({});
    for (var k in this.analizador.reglas) {
      this[k] = async.apply(function(k, t) {
        var ass = t.pilaAcumulados.length;
        t.pilaAcumulados.push(t.acumulado);
        t.acumulado = [];
        t.nuevoNodo({
          tipo: k,
          begin: t.posicion,
          end: t.posicion,
          resultado: "$error$"
        });
        try {
          var x = t.analizador.reglas[k].apply(t, []);
        } catch (e) {
          if (!zl.error.esError(e))
            throw e;
          t.acumulado = t.pilaAcumulados.pop();
          throw t.propagarError(e);
        }
        t.nodoActual.end = t.posicion;
        t.nodoPadre();
        t.acumulado = t.pilaAcumulados.pop();
        if (ass != t.pilaAcumulados.length)
          throw JSON.stringify({
            mensaje: "Aserto inválido: el número de push y pop son distintos.",
            regla: k
          });
        return x;
      }, k, this);
    }
    return this;
  }

  Analisis.prototype.propagarError = function(error) {
    if (this.arbol().length)
      this.arbol().end = this.arbol(this.arbol().length - 1).end;
    this.nodoPadre();
    error.traza = this.arbol();
    return error;
  }

  Analisis.prototype.registrarResultado = function(resultado) {
    this.nodoActual.resultado = resultado;
    if (typeof resultado === "object") {
      resultado.begin = this.nodoActual.begin;
      resultado.end = this.nodoActual.end;
    }
  };

  Analisis.prototype.resultado = function() {
    return this.arbol.apply(this, arguments).resultado;
  }

  // Avanzar el iterador saltando espacios y comentarios
  Analisis.prototype.saltar = function() {
    while (/\s/.test(this.texto.substr(this.posicion, 1)))
      this.posicion++;
    if (this.texto.substr(this.posicion, 2) == "//") {
      while (this.texto.substr(this.posicion, 1) != "\n")
        this.posicion++;
      this.saltar()
    }
    return this;
  }

  Analisis.prototype.nuevoNodo = function(nodo) {
    var n = this.nodoActual.push(new Nodo(nodo));
    n.padre = this.nodoActual;
    this.nodoActual = n;
    return this;
  }

  Analisis.prototype.nodoPadre = function() {
    var n = this.nodoActual;
    this.nodoActual = n.padre;
    this.nodoActual.end = n.end;
    // Nunca se volverá a un nodo hijo: se comprime la memoria usada.
    delete n.padre;
    return this;
  }

  Analisis.prototype.acumular = function(id) {
    this.acumulado.push(id);
    return this;
  }

  Analisis.prototype.retroceder = function(cantidad) {
    var a = this.arbol();
    while (cantidad--) {
      a.pop();
      a.end = this.posicion = (a.length ? a[a.length - 1].end : a.begin);
    }
  }

  Analisis.prototype.avanzarUno = function() {
    var id = this.acumulado.shift();
    var regex = this.analizador.simbolos[id] || this.analizador.tokens[id];
    if (!regex) {
      return this[id].apply(this, []);
    }
    regex = regex.regex;

    this.nuevoNodo({
      begin: this.posicion,
      end: this.posicion,
      tipo: id,
      resultado: "$error$"
    });

    this.saltar();
    var ocurrencia = this.texto.substring(this.posicion).match(regex);
    if (ocurrencia) {
      this.arbol().resultado = ocurrencia[0];
      this.arbol().end = (this.posicion += ocurrencia[0].length);
    } else {
      throw this.propagarError(zl.error.newError(zl.error.E_SIMBOLO, this.arbol()));
    }
    this.nodoPadre();
    return this;
  }

  Analisis.prototype.avanzarTodos = function() {
    var pos = this.posicion;
    var primerid = this.acumulado[0].id;
    this.nuevoNodo({
      begin: this.posicion,
      end: this.posicion,
      tipo: "(secuencia)",
      resultado: "$error$"
    });
    while (this.acumulado.length) {
      try {
        var x = Math.random();
        this.avanzarUno();
      } catch (e) {
        if (!zl.error.esError(e)) {
          throw e;
        }
        this.posicion = pos;
        throw this.propagarError(e);
      }
    }
    // Generar el resultado array
    this.arbol().resultadoArray();
    this.nodoPadre();
    return this;
  }

  Analisis.prototype.avanzarVarios = function() {
    var acum = this.acumulado.slice();
    var pos = this.posicion;
    this.nuevoNodo({
      begin: this.posicion,
      end: this.posicion,
      tipo: "(array)",
      resultado: "$error$"
    });
    while (true) {
      try {
        if (this.acumulado.length > 1)
          this.avanzarTodos();
        else
          this.avanzarUno();
        pos = this.posicion;
        this.acumulado = acum.slice();
      } catch (e) {
        if (!zl.error.esError(e))
          throw e;
        if (e.traza.end > pos) {
          throw this.propagarError(e);
        }
        // No propagar error alguno.
        delete this.arbol().error;
        // Elimiar el último nodo añadido porque siempre es un intento fallido.
        this.arbol().pop();
        // Generar el resultado array
        this.arbol().resultadoArray();
        this.nodoPadre();
        return this;
      }
    }
  }

  Analisis.prototype.avanzarObligatorioVarios = function() {
    var acum = this.acumulado.slice();
    var pos = this.posicion;
    var alMenosUno = false;
    this.nuevoNodo({
      begin: this.posicion,
      end: this.posicion,
      tipo: "(array)",
      resultado: "$error$"
    });
    while (true) {
      try {
        if (this.acumulado.length > 1)
          this.avanzarTodos();
        else
          this.avanzarUno();
        pos = this.posicion;
        this.acumulado = acum.slice();
        alMenosUno = true;
      } catch (e) {
        if (!zl.error.esError(e))
          throw e;
        if (e.traza.end > pos || !alMenosUno) {
          throw this.propagarError(e);
        }
        // No propagar error alguno.
        delete this.arbol().error;
        // Elimiar el último nodo añadido porque siempre es un intento fallido
        this.arbol().pop();
        // Generar el resultado array
        this.arbol().resultadoArray();
        this.nodoPadre();
        return this;
      }
    }
  }

  Analisis.prototype.avanzar = function(id) {
    if (id) {
      this.acumulado = [id];
    } else {
      return this.intentar(
        Object.keys(this.analizador.tokens).filter(function(e) {
          return isNaN(Number(e))
        }),
        this.avanzar
      );
    }
    this.avanzarUno();
    return this;
  }

  Analisis.prototype.arbol = function() {
    var a = this.nodoActual;
    for (var i = 0; i < arguments.length; i++) {
      a = a[arguments[i]];
    }
    return a;
  }

  Analisis.prototype.intentar = function(intentos) {
    var longitud = 0;
    var mayorerror = 0;
    this.nuevoNodo({
      begin: this.posicion,
      end: this.posicion,
      tipo: "(intento)",
      resultado: "$error$"
    });
    for (var i = 0; i < intentos.length; i++) {
      try {
        this.acumulado = intentos[i];
        this.avanzarTodos();
        this.registrarResultado(i);
        this.nodoPadre();
        return this;
      } catch (e) {
        if (!zl.error.esError(e))
          throw e;
        if (longitud == e.traza.end)
          mayorerror = Math.max(e.tipo, mayorerror);
        else if (longitud < e.traza.end)
          mayorerror = e.tipo;
        longitud = Math.max(e.traza.end, longitud);
      }
    }
    // Filtrar errores que no sean lo suficientemente largos:
    for (var i = 0; i < this.nodoActual.length; i++) {
      if (this.nodoActual[i].end < longitud)
        this.nodoActual.remove(i--);
    }
    throw this.propagarError(zl.error.newError(mayorerror, this.arbol()));
  }

  function Nodo(a) {
    a = a || {};
    for (var k in a) {
      this[k] = a[k];
    }

    this.push = function(element) {
      return this[this.length++] = element;
    }

    this.pop = function() {
      var x = this[--this.length];
      delete this[this.length];
      return x;
    }

    this.remove = function(indice) {
      //delete this[indice];
      for (var i = indice; i < this.length - 1; i++) {
        this[i] = this[i + 1]
      }
      delete this[this.length - 1];
      this.length--;
    }

    this.resultadoArray = function() {
      this.resultado = [];
      for (var i = 0; i < this.length; i++)
        this.resultado.push(this[i].resultado);
    }

    this.length = 0;
    this.begin = this.begin || 0;
    this.end = this.end || 0;
    return this;
  }

  zl.analizador.newAnalizador = function() {
    return new Analizador();
  }
})();
