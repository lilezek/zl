/*
  Siguiendo la sugerencia de laguna sobre el analizador descendente recursivo
  por prioridad de operadores:

  http://javascript.crockford.com/tdop/tdop.html
*/

const analizador = (zl, async) => {
  zl.analizador = zl.analizador || {};

  class Analizador {
    constructor() {
      this.simbolos = {};
      this.tokens = {
        length: 0
      };
      this.reglas = {};
      this.analizando = "";
      return this;
    }

    empezar(texto) {
      return new Analisis(this, texto);
    }

    simbolo(id, regex, prioridad) {
      let s = this.simbolos[id];
      prioridad = prioridad || 0;
      if (s) {
        if (prioridad >= s.prioridad) {
          s.prioridad = prioridad;
        }
      } else {
        s = {
          izq() {
            throw "Sin implementar"
          },
          der() {
            throw "Sin implementar"
          },
          id,
          regex: regex || new RegExp("^" + id, "i"),
          prioridad
        }
        this.simbolos[id] = s;
      }
      return s;
    }

    token(id, regex, prioridad) {
      this.tokens[id] = this.tokens[prioridad] = {
        id,
        regex,
        prioridad
      };
      this.tokens.length = Math.max(this.tokens.length, prioridad + 1);
    }

    regla(nombre, regla) {
      if (typeof regla === "function")
        this.reglas[nombre] = regla;
    }
  }

  class Analisis {
    constructor(analizador, texto) {
      this.analizador = analizador || null;
      this.texto = texto || "";
      this.posicion = 0;
      this.acumulado = [];
      this.pilaAcumulados = [];
      this.nodoActual = new Nodo({});
      for (const k in this.analizador.reglas) {
        this[k] = async.apply((k, t) => {
          const ass = t.pilaAcumulados.length;
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
          if (k === "subrutina")

          if (t.nodoActual.length) {
            t.nodoActual.begin = t.nodoActual[0].begin;
          }
          if (typeof t.nodoActual.resultado === "object") {
            t.nodoActual.resultado.begin = t.nodoActual.begin;
            t.nodoActual.resultado.end = t.nodoActual.end;
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

    moverCursor(posicion) {
      this.posicion = posicion;
    }

    propagarError(error) {
      if (this.arbol().length)
        this.arbol().end = this.arbol(this.arbol().length - 1).end;
      this.nodoPadre();
      error.traza = this.arbol();
      return error;
    }

    registrarResultado(resultado) {
      this.nodoActual.resultado = resultado;
    }

    resultado(...args) {
      return this.arbol(...args).resultado;
    }

    // Avanzar el iterador saltando espacios y comentarios
    saltar() {
      while (/\s/.test(this.texto.substr(this.posicion, 1)))
        this.posicion++;
      if (this.texto.substr(this.posicion, 2) == "//") {
        while (this.texto.substr(this.posicion, 1) != "\n" && this.posicion < this.texto.length)
          this.posicion++;
        this.posicion++;
        this.saltar();
      }
      if (this.texto.substr(this.posicion, 2) == "/*") {
        while (this.texto.substr(this.posicion, 2) != "*/" && this.posicion < this.texto.length)
          this.posicion++;
        this.posicion+=2;
        this.saltar();
      }
      return this;
    }

    nuevoNodo(nodo) {
      const n = this.nodoActual.push(new Nodo(nodo));
      n.padre = this.nodoActual;
      this.nodoActual = n;
      return this;
    }

    nodoPadre() {
      const n = this.nodoActual;
      this.nodoActual = n.padre;
      this.nodoActual.end = n.end;
      // Nunca se volverá a un nodo hijo: se comprime la memoria usada.
      delete n.padre;
      return this;
    }

    acumular(id) {
      this.acumulado.push(id);
      return this;
    }

    retroceder(cantidad) {
      const a = this.arbol();
      while (cantidad--) {
        a.pop();
        a.end = this.posicion = (a.length ? a[a.length - 1].end : a.begin);
      }
    }

    avanzarUno() {
      if (this.acumulado.length == 0) {
        throw "No se puede avanzar uno porque hay 0 acumulados";
      }
      const id = this.acumulado.shift();
      if ( Object.prototype.toString.call( id ) === '[object Array]') {
        return this.intentar(id);
      }
      let regex = this.analizador.simbolos[id] || this.analizador.tokens[id];
      if (!regex) {
        if (typeof this[id] === "undefined") {
          throw "Id: '" + id + "' sin definir";
        }
        return this[id](...[]);
      }
      regex = regex.regex;

      this.nuevoNodo({
        begin: this.posicion,
        end: this.posicion,
        tipo: id,
        resultado: "$error$"
      });
      this.saltar();
      const beginReal = this.posicion;
      const ocurrencia = this.texto.substring(this.posicion).match(regex);
      if (ocurrencia) {
        this.arbol().resultado = ocurrencia[0];
        this.arbol().begin = beginReal;
        this.arbol().end = (this.posicion += ocurrencia[0].length);
      } else {
        throw this.propagarError(zl.error.newError(zl.error.E_SIMBOLO, this.arbol()));
      }
      this.nodoPadre();
      return this;
    }

    avanzarTodos() {
      const pos = this.posicion;
      const primerid = this.acumulado[0].id;
      this.nuevoNodo({
        begin: this.posicion,
        end: this.posicion,
        tipo: "(secuencia)",
        resultado: "$error$"
      });
      while (this.acumulado.length) {
        try {
          const x = Math.random();
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

    avanzarVarios() {
      const acum = this.acumulado.slice();
      let pos = this.posicion;
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
          // Liberar las acumulaciones restantes:
          this.acumulado = [];
          return this;
        }
      }
    }

    avanzarObligatorioVarios() {
      const acum = this.acumulado.slice();
      let pos = this.posicion;
      let alMenosUno = false;
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
          // Eliminar el último nodo añadido porque siempre es un intento fallido
          this.arbol().pop();
          // Generar el resultado array
          this.arbol().resultadoArray();
          this.nodoPadre();
          return this;
        }
      }
    }

    avanzar(id) {
      if (id) {
        this.acumulado = [id];
      } else {
        return this.intentar(
          Object.keys(this.analizador.tokens).filter(e => isNaN(Number(e))),
          this.avanzar
        );
      }
      this.avanzarUno();
      return this;
    }

    arbol(...args) {
      let a = this.nodoActual;
      for (let i = 0; i < args.length; i++) {
        a = a[args[i]];
      }
      return a;
    }

    intentar(intentos) {
      let longitud = 0;
      let mayorerror = 0;
      let iderror = "E_SIMBOLO";
      this.nuevoNodo({
        begin: this.posicion,
        end: this.posicion,
        tipo: "(intento)",
        resultado: "$error$"
      });
      for (var i = 0; i < intentos.length; i++) {
        try {
          this.acumulado = intentos[i].slice();
          this.avanzarTodos();
          this.registrarResultado(i);
          this.nodoPadre();
          return this;
        } catch (e) {
          if (!zl.error.esError(e))
            throw e;
          if (longitud == e.traza.end && e.tipo > mayorerror) {
            iderror = e.identificador;
            mayorerror = e.tipo;
          }
          else if (longitud < e.traza.end) {
            iderror = e.identificador;
            mayorerror = e.tipo;
          }
          longitud = Math.max(e.traza.end, longitud);
        }
      }
      // Filtrar errores que no sean lo suficientemente largos:
      for (var i = 0; i < this.nodoActual.length; i++) {
        if (this.nodoActual[i].end < longitud)
          this.nodoActual.remove(i--);
      }
      throw this.propagarError(zl.error.newError(zl.error[iderror], this.arbol()));
    }

    intento(intentos) {
      return this.acumular(intentos);
    }
  }

  function Nodo(a) {
    a = a || {};
    for (const k in a) {
      this[k] = a[k];
    }

    this.push = function(element) {
      return this[this.length++] = element;
    }

    this.pop = function() {
      const x = this[--this.length];
      delete this[this.length];
      return x;
    }

    this.remove = function(indice) {
      //delete this[indice];
      for (let i = indice; i < this.length - 1; i++) {
        this[i] = this[i + 1]
      }
      delete this[this.length - 1];
      this.length--;
    }

    this.resultadoArray = function() {
      this.resultado = [];
      for (let i = 0; i < this.length; i++)
        this.resultado.push(this[i].resultado);
    }

    this.length = 0;
    this.begin = this.begin || 0;
    this.end = this.end || 0;
    return this;
  }

  zl.analizador.newAnalizador = () => new Analizador()
  return zl;
};

if (typeof module !== "undefined")
  module.exports = analizador;
else {
  this.zl = analizador(this.zl || {}, async);
}
