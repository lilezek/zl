var modulo = function(zl) {
  "use strict";

  zl.entorno = zl.entorno || {};
  var modInterno;

  function Modulo() {
    var that = this;
    this.padre = null;
    this.subrutinas = {};
    this.tipos = {};
    this.globales = {};

    this.configuracion = {
      fps: 10,
      precision: 0,
      nombremodulo: "$principal",
      genericos: []
    };

    this.genericos = [];

    Object.defineProperty(this, "nombre", {
      get: function() {
        return this.configuracion.nombremodulo;
      },
      set: function(value) {
        this.configuracion.nombremodulo = value;
      }
    });

    Object.defineProperty(this, "interno", {
      get: function() {
        return this.nombre === "$internal";
      }
    });

    this.importes = {

    };

    this.integraciones = {};
    if (modInterno)
      this.integraciones.$internal = modInterno;

    // Las operaciones:
    this.operacionesBinarias = {};
    this.operacionesUnarias = {};
    this.conversiones = [];

    // Por defecto: representa el código escrito en el propio editor.
    this.fuente = "/";

    // La serialización para distinguirlo de otro módulo
    this.serial = "";

    // Este Modulo como tipo:
    this.estetipo = new Tipo(this);

    return this;
  }

  Modulo.prototype.registrar = function(r) {
    var x =
      r instanceof Subrutina ? this.registrarSubrutina(r) :
      r instanceof Tipo ? this.registrarTipo(r) :
      r instanceof Modulo ? this.registrarModulo(r) :
      "Solo se pueden registrar subrutinas, tipos o modulos";
    if (x)
      throw x;
  }

  Modulo.prototype.registrarSubrutina = function(sub) {
    this.subrutinas[sub.nombre] = sub;
  }

  Modulo.prototype.registrarTipo = function(tipo) {
    if (tipo.modulo)
      this.importes[tipo.nombre] = tipo.modulo;
    this.tipos[tipo.nombre] = tipo;
  }

  Modulo.prototype.registrarModulo = function(modulo) {
    this.importes[modulo.nombre] = modulo;
  }

  Modulo.prototype.esIgual = function(mod) {
    return (mod instanceof Modulo) && (mod.serial == this.serial);
  }

  Modulo.prototype.esCompatible = function(mod) {
    //TODO: stub
    return (mod instanceof Modulo);
  }

  Modulo.prototype.subrutinaPorNombre = function(nombre) {
    nombre = nombre.toLowerCase();
    for (var k in this.subrutinas) {
      if (this.subrutinas[k].nombre == nombre)
        return this.subrutinas[k];
    }
    for (var k in this.integraciones) {
      var r = this.integraciones[k].subrutinaPorNombre(nombre);
      if (r)
        return r;
    }
    return null;
  }

  Modulo.prototype.conversor = function(tipoObjetivo, tipoFuente) {
    var ops = this.conversiones;
    var opcn = null;
    for (var i = 0; !opcn && i < ops.length; i++) {
      // TODO: Sustituir genéricos
      var der = ops[i].tipoDerecho.especificar(tipoFuente.genericos);
      var res = ops[i].tipoResultado.especificar(tipoObjetivo.genericos);
      if (der.esCompatible(tipoFuente) && res.esCompatible(tipoObjetivo))
        opcn = ops[i];
    }
    if (!opcn) {
      for (var k in this.integraciones) {
        opcn = this.integraciones[k].conversor(tipoObjetivo, tipoFuente);
        if (opcn)
          break;
      }
    }
    if (!opcn) {
      for (var k in this.importes) {
        opcn = this.importes[k].conversor(tipoObjetivo, tipoFuente);
        if (opcn)
          break;
      }
    }

    // Ahora comprobar si la operación tiene genéricos.
    // Si tiene genéricos, especificar usando el tipo izquierdo:
    return opcn;
  }

  Modulo.prototype.registrarConversor = function(tipoObjetivo, tipoFuente, subrutina) {
    var opcn = new Operacion();
    delete opcn.operador;
    delete opcn.tipoIzquierdo;
    opcn.tipoDerecho = tipoFuente;
    opcn.tipoResultado = tipoObjetivo;
    delete opcn.localizacion;
    delete opcn.alias;
    opcn.subrutina = subrutina;
    this.conversiones.push(opcn);
    return opcn;
  }

  Modulo.prototype.subrutinaPorPosicion = function(pos) {
    for (var k in this.subrutinas) {
      if (this.subrutinas[k].padre === this)
        if (this.subrutinas[k].posicionSubrutina[0] <= pos && this.subrutinas[k].posicionSubrutina[1] >= pos)
          return this.subrutinas[k];
    }
    return null;
  }

  Modulo.prototype.tipoPorNombre = function(nombre) {
    nombre = nombre.toLowerCase();
    // Tipo especial EsteTipo:
    if (nombre === "estemodulo") {
      return this.estetipo;
    }
    for (var k in this.tipos) {
      if (this.tipos[k].nombre == nombre)
        return this.tipos[k];
    }
    // Si no está en el módulo el tipo, podría estar en alguna integracion.
    for (var k in this.integraciones) {
      var r = this.integraciones[k].tipoPorNombre(nombre);
      if (r)
        return r;
    }
    return null;
  }

  Modulo.prototype.serializar = function() {
    // Antes de serializar, comprobar si se está en el padre.
    if (this.padre && this.serial in this.padre.modulos)
      delete this.padre.modulos[this.serial];

    // Obtener los seriales de las subrutinas:
    var subs = new Array;
    for (var o in this.subrutinas) {
      subs.push(this.subrutinas[o].serial);
    }

    this.serial = subs.join("#").toLowerCase();

  }

  Modulo.prototype.rellenarDesdeArbol = function(arbol) {
    // Lista de subrutinas
    for (var i = 0; i < arbol.subrutinas.length; i++) {
      var sub = new Subrutina(this);
      sub.rellenarDesdeArbol(arbol.subrutinas[i]);

      // Comprobar que no se repite el nombre
      if (this.subrutinaPorNombre(sub.nombre)) {
        throw zl.error.newError(zl.error.E_NOMBRE_SUBRUTINA_YA_USADO, arbol.subrutinas[i]);
      }
      // Sino, añadirla
      else {
        this.subrutinas[sub.nombre] = sub;
      }
    }

    this.serializar();
  }

  Modulo.prototype.registrarGlobal = function(decl) {
    var nombre = decl.nombre.toLowerCase();
    if (nombre in this.globales) {
      if (!decl.esCompatible(this.globales[nombre]))
        throw zl.error.newError(zl.error.E_GLOBALES_INCOMPATIBLES, [decl, this.globales[nombre]]);
    } else
      this.globales[nombre] = decl;
    return true;
  }

  Modulo.prototype.desplazarPosiciones = function(posicion, cantidad) {
    for (var k in this.subrutinas) {
      // Comprobar que la subrutina pertenece a este módulo o no:
      if (this.subrutinas[k].padre === this)
        this.subrutinas[k].desplazarPosiciones(posicion, cantidad);
    }
  }

  Modulo.prototype.integrar = function(otroModulo) {
    this.integraciones[otroModulo.configuracion.nombremodulo] = otroModulo;
  }

  var ovalues = Object.values || function(o, f) {
    var r = [];
    for (var k in o)
      if (f(k, o[k]))
        r.push(o[k]);
    return r;
  }

  Modulo.prototype.arrayDeIntegraciones = function() {
    return ovalues(this.integraciones, function(k, v) {
      return !v.interno;
    });
  }

  Modulo.prototype.arrayDeSubrutinas = function() {
    var r = [];
    for (var k in this.subrutinas) {
      r.push(this.subrutinas[k]);
    }
    for (var k in this.integraciones) {
      for (var k2 in this.integraciones[k].subrutinas) {
        r.push(this.integraciones[k].subrutinas[k2]);
      }
    }
    return r;
  }

  Modulo.prototype.arrayDeSubrutinasPropias = function() {
    var r = [];
    for (var k in this.subrutinas) {
      r.push(this.subrutinas[k]);
    }
    return r;
  }

  Modulo.prototype.arrayDeTipos = function() {
    var r = [];
    for (var k in this.tipos) {
      r.push(this.tipos[k]);
    }
    for (var k in this.integraciones) {
      for (var k2 in this.integraciones[k].tipos) {
        r.push(this.integraciones[k].tipos[k2]);
      }
    }
    return r;
  }

  Modulo.prototype.registrarOperadorBinario = function(op, tipoInstanciaIzq, tipoInstanciaDer, tipoInstanciaRes, subrutina) {
    var opcn = new Operacion();
    opcn.operador = op;
    opcn.tipoDerecho = tipoInstanciaDer;
    opcn.tipoIzquierdo = tipoInstanciaIzq;
    opcn.tipoResultado = tipoInstanciaRes;
    if (subrutina) {
      opcn.localizacion = subrutina.padre;
      opcn.alias = subrutina.nombre;
    }
    this.operacionesBinarias[op] = this.operacionesBinarias[op] || [];
    this.operacionesBinarias[op].push(opcn);
    return opcn;
  }

  Modulo.prototype.operadorBinario = function(op, tipoInstanciaIzq, tipoInstanciaDer) {
    var ops = this.operacionesBinarias[op] || [];
    var opcn = null;
    for (var i = 0; !opcn && i < ops.length; i++) {
      // TODO: Sustituir genéricos
      var izq = ops[i].tipoIzquierdo.especificar(tipoInstanciaIzq.genericos);
      var der = ops[i].tipoDerecho.especificar(tipoInstanciaIzq.genericos);
      if (izq.esCompatible(tipoInstanciaIzq) && der.esCompatible(tipoInstanciaDer))
        opcn = ops[i];
    }
    if (!opcn) {
      for (var k in this.integraciones) {
        opcn = this.integraciones[k].operadorBinario(op, tipoInstanciaIzq, tipoInstanciaDer);
        if (opcn)
          break;
      }
    }
    if (!opcn) {
      for (var k in this.importes) {
        opcn = this.importes[k].operadorBinario(op, tipoInstanciaIzq, tipoInstanciaDer);
        if (opcn)
          break;
      }
    }
    // Ahora comprobar si la operación tiene genéricos.
    // Si tiene genéricos, especificar usando el tipo izquierdo:
    if (opcn && opcn.localizacion && opcn.localizacion.genericos.length) {
      // TODO: comprobar si esto es suficiente
      opcn = zl.writeJson(new Operacion(), opcn);
      opcn.tipoResultado = opcn.tipoResultado.especificar(tipoInstanciaIzq.genericos);
    }
    return opcn;
  }

  Modulo.prototype.registrarOperadorUnario = function(op, tipo, tipoResultado, subrutina) {
    var opcn = new Operacion();
    opcn.operador = op;
    opcn.tipoDerecho = tipo;
    delete opcn.tipoIzquierdo;
    opcn.tipoResultado = tipoResultado;
    if (subrutina) {
      opcn.localizacion = subrutina.padre;
      opcn.alias = subrutina.nombre;
    }
    this.operacionesUnarias[op] = this.operacionesUnarias[op] || [];
    this.operacionesUnarias[op].push(opcn);
    return opcn;
  }

  Modulo.prototype.operadorUnario = function(op, tipo) {
    var ops = this.operacionesUnarias[op] || [];
    var opcn = null;
    for (var i = 0; !opcn && i < ops.length; i++) {
      // TODO: Sustituir genéricos
      var der = ops[i].tipoDerecho.especificar(tipo.genericos);
      if (der.esCompatible(tipo))
        opcn = ops[i];
    }
    if (!opcn) {
      for (var k in this.integraciones) {
        opcn = this.integraciones[k].operadorUnario(op, tipo);
        if (opcn)
          break;
      }
    }
    if (!opcn) {
      for (var k in this.importes) {
        opcn = this.importes[k].operadorUnario(op, tipo);
        if (opcn)
          break;
      }
    }

    // Ahora comprobar si la operación tiene genéricos.
    // Si tiene genéricos, especificar usando el tipo izquierdo:
    if (opcn && opcn.localizacion && opcn.localizacion.genericos.length) {
      // TODO: comprobar si esto es suficiente
      opcn = zl.writeJson(new Operacion(), opcn);
      opcn.tipoResultado = opcn.tipoResultado.especificar(tipo.genericos);
    }
    return opcn;
  }

  function Subrutina(modulo) {
    // Módulo padre
    this.padre = modulo || null;

    this.nombre = "";
    this.modificadores = {};
    this.declaraciones = {};

    this.posicionSubrutina = [0, 0];
    this.posicionDatos = [0, 0];
    this.posicionAlgoritmo = [0, 0];

    // El contexto es útil cuando se necesita una instancia concreta de subrutina.
    this.$contexto = null;

    Object.defineProperty(this, "contexto", {
      get: function() {
        return this.$contexto;
      },
      set: function(value) {
        this.$contexto = value;
        var declgenericas = this.declaraciones;
        this.declaraciones = {};
        for (var k in declgenericas) {
          this.declaraciones[k] = zl.writeJson(new Declaracion(), declgenericas[k]);
          this.declaraciones[k].tipoInstancia = declgenericas[k].tipoInstancia.especificar(value);
        }
      }
    })


    // La serialización para distinguirlo de otra subrutina
    this.serial = "";

    // La serialización para indicar compatibilidad:
    this.serial2 = "";

    return this;
  }

  Subrutina.prototype.esIgual = function(sub) {
    return (sub instanceof Subrutina) && (sub.serial == this.serial);
  }

  Subrutina.prototype.esCompatible = function(sub) {
    return (sub instanceof Subrutina) && (sub.serial2 == this.serial2);
  }

  Subrutina.prototype.serializar = function() {
    // Obtener los modificadores:
    var mods = new Array;
    for (var o in this.modificadores) {
      mods.push(o);
    }

    // Obtener las declaraciones:
    var decl = new Array;
    for (var o in this.declaraciones) {
      decl.push(this.declaraciones[o].serial);
    }

    // Serialización exacta
    this.serial = (this.nombre + "$" + mods.join("") + "$" + decl.join("")).toLowerCase();

    // Ordenar las declaraciones y los modificadores
    // para evitar que la serialización dependa del orden
    mods.sort();
    decl.sort();

    // Serialización compatible
    this.serial2 = (this.nombre + "$" + mods.join("") + "$" + decl.join("")).toLowerCase();
  }

  Subrutina.prototype.rellenarDesdeArbol = function(arbol) {
    // Posicion de la subrutina:
    this.posicionSubrutina = [arbol.begin, arbol.end];
    this.posicionCabecera = arbol.secciones.cabecera;
    this.posicionDatos = arbol.secciones.datos;
    this.posicionAlgoritmo = arbol.secciones.algoritmo;

    this.nombre = arbol.nombre.toLowerCase();

    // Registrar modificadores
    for (var i = 0; i < arbol.modificadores.length; i++) {
      this.modificadores[arbol.modificadores[i].toLowerCase()] = true;
    }

    // Registrar primitivas:
    if ("primitiva" in this.modificadores) {
      // Extraer del segmento el código:
      this.segmentoPrimitivo = arbol.segmentoPrimitivo.substring(2, arbol.segmentoPrimitivo.length - 2);
    }

    // Registrar datos
    for (var i = 0; i < arbol.datos.length; i++) {
      var decl = new Declaracion(this);
      decl.rellenarDesdeArbol(arbol.datos[i], this.padre);

      if (decl.nombre in this.declaraciones)
        throw zl.error.newError(zl.error.E_NOMBRE_DATO_YA_USADO, arbol.datos[i]);
      else
        this.declaraciones[decl.nombre] = decl;

      // Registrar si es global:
      if (decl.modificadores & decl.M_GLOBAL) {
        this.padre.registrarGlobal(decl);
      }
    }

    // Registrar conversores y operaciones (después de que se registren los datos):
    // Conversores
    if ("conversora" in this.modificadores) {
      // TODO: añadir las comprobaciones oportunas
      // Un dato de entrada
      // Un dato de salida
      // Sin datos globales
      // ¿No asíncrona?
      this.conversion = {};
      this.conversion.datoEntrada = null;
      this.conversion.datoSalida = null;
      for (var k in this.declaraciones) {
        if (this.declaraciones[k].modificadores == Declaracion.prototype.M_ENTRADA)
          this.conversion.datoEntrada = this.declaraciones[k];
        else if (this.declaraciones[k].modificadores == Declaracion.prototype.M_SALIDA)
          this.conversion.datoSalida = this.declaraciones[k];
      }
      if (this.conversion.datoEntrada && this.conversion.datoSalida) {
        this.padre.registrarConversor(this.conversion.datoSalida.tipoInstancia, this.conversion.datoEntrada.tipoInstancia, this);
      }
    }
    // Operaciones
    for (var k in this.modificadores) {
      // Operaciones binarias
      if (k.indexOf("operadoracceso") > -1) {
        // TODO: añadir las comprobaciones oportunas
        // Un dato índice de entrada
        // Un dato de salida o de entrada, depdendiendo de la lectura o la escritura.
        // Posibles datos globales.
        // ¿No asíncrona?
        var operador = ({
            "lectura": "()",
            "escritura": "(&)"
          })[k.substr(14)]
          // TODO: Cambiar los nombres
        var contenedor = this.declaraciones.izquierda.tipoInstancia;
        var indice = this.declaraciones.derecha.tipoInstancia;
        var valor = this.declaraciones.resultado.tipoInstancia;
        var modulo = this.padre;
        var alias = this.nombre;
        modulo.registrarOperadorBinario(operador, contenedor, indice, valor, this);
      } else if (k.indexOf("operador") > -1 && k.indexOf("operadorunario") == -1) {
        // TODO: añadir las comprobaciones oportunas
        // Dos datos de entrada izquierda y derecha
        // Un dato de salida resultado
        // Sin poder escribir datos globales
        // ¿No asíncrona?
        var operador = ({
          "suma": "+",
          "resta": "-",
          "producto": "*",
          "modulo": "%",
          "division": "/",
          "y": "y",
          "o": "o"
        })[k.substr(8)]
        var izquierda = this.declaraciones.izquierda.tipoInstancia;
        var derecha = this.declaraciones.derecha.tipoInstancia;
        var resultado = this.declaraciones.resultado.tipoInstancia;
        var modulo = this.padre;
        modulo.registrarOperadorBinario(operador, izquierda, derecha, resultado, this);
      }
    }
    this.serializar();
  }

  Subrutina.prototype.desplazarPosiciones = function(posicion, cantidad) {
    if (this.posicionSubrutina[0] >= posicion) {
      this.posicionSubrutina[0] = this.posicionSubrutina[0] + cantidad;
    }
    if (this.posicionSubrutina[1] >= posicion)
      this.posicionSubrutina[1] = this.posicionSubrutina[1] + cantidad;
    if (this.posicionCabecera[0] >= posicion)
      this.posicionCabecera[0] = this.posicionCabecera[0] + cantidad;
    if (this.posicionCabecera[1] >= posicion)
      this.posicionCabecera[1] = this.posicionCabecera[1] + cantidad;
    if (this.posicionDatos[0] >= posicion)
      this.posicionDatos[0] = this.posicionDatos[0] + cantidad;
    if (this.posicionDatos[1] >= posicion)
      this.posicionDatos[1] = this.posicionDatos[1] + cantidad;
    if (this.posicionAlgoritmo[0] >= posicion)
      this.posicionAlgoritmo[0] = this.posicionAlgoritmo[0] + cantidad;
    if (this.posicionAlgoritmo[1] >= posicion)
      this.posicionAlgoritmo[1] = this.posicionAlgoritmo[1] + cantidad;
  }

  function Declaracion(padre) {
    // Subrutina o módulo padre:
    this.padre = padre || null;

    this.nombre = "";
    this.tipoInstancia = null;
    this.modificadores = 0x00;
    this.posicion = [0, 0];

    // La serialización para poder serializar las subrutinas.
    this.serial = "";
    return this;
  }

  // Usado para comprobar que dos declaraciones son compatibles
  Declaracion.prototype.esCompatible = function(dec) {
    return (dec instanceof Declaracion) && (dec.serial === this.serial);
  }

  Declaracion.prototype.serializar = function() {
    //TODO: serializar correctamente el tipo
    this.serial = (this.nombre + /*"@" + this.tipo.serial +*/ "@" + this.modificadores).toLowerCase();
  }

  Declaracion.prototype.rellenarDesdeArbol = function(arbol) {
    this.nombre = arbol.nombre.toLowerCase();
    this.posicion = [arbol.begin, arbol.end];
    for (var j = 0; j < arbol.modificadores.length; j++) {
      var mod = arbol.modificadores[j].toLowerCase();
      if (mod.indexOf("salida") > -1) {
        if (this.modificadores & this.M_SALIDA)
          throw zl.error.newError(zl.error.E_MODIFICADOR_REPETIDO, arbol);
        this.modificadores |= this.M_SALIDA;
      }
      if (mod.indexOf("entrada") > -1) {
        if (this.modificadores & this.M_ENTRADA)
          throw zl.error.newError(zl.error.E_MODIFICADOR_REPETIDO, arbol);
        this.modificadores |= this.M_ENTRADA;
      }
      if (mod == "global") {
        if (this.modificadores != this.M_LOCAL)
          throw zl.error.newError(zl.error.E_USO_INDEBIDO_MODIFICADOR_GLOBAL, arbol);
        this.modificadores |= this.M_GLOBAL;
      }
    }
    this.tipoInstancia = new TipoInstancia(this.padre.padre.genericos);
    this.tipoInstancia.rellenarDesdeArbol(arbol.tipoInstancia, this.padre.padre);
    this.serializar();
  }

  function Tipo(modulo) {
    var self = this;
    this.modulo = modulo;
    this.nombre = "";

    // Métodos:
    this.metodos = {};

    // Constructor:
    this.constr = "";

    // Genericos:
    this.genericos = [];

    // Serialización:
    this.serial = "";

    if (modulo) {
      // El nombre dependa directamente del modulo:
      delete this.nombre;
      Object.defineProperty(this, "nombre", {
        get: function() {
          return this.modulo.configuracion.nombremodulo;
        },
        set: function(value) {
          this.modulo.configuracion.nombremodulo = value;
        }
      });

      delete this.constr;
      Object.defineProperty(this, "constr", {
        get: function() {
          return this.nombre;
        },
      })

      delete this.genericos;
      Object.defineProperty(this, "genericos", {
        get: function() {
          return this.modulo.genericos;
        }
      })

      this.metodos = this.modulo.subrutinas;
      this.serializar();
    }

    return this;
  }

  Tipo.prototype.esCompatible = function(tipo) {
    // TODO: no limitarse a usar el nombre
    return (tipo instanceof Tipo) && ((tipo.nombre === this.nombre) ||
      ("cualquiera" === tipo.nombre) ||
      ("cualquiera" === this.nombre));
  }

  Tipo.prototype.esIgual = function(tipo) {
    return ((tipo instanceof Tipo) && (tipo.nombre === this.nombre));
  }

  Tipo.prototype.serializar = function() {
    // TODO: Serializar correctamente con los métodos
    this.serial = this.nombre;
  }

  Tipo.prototype.instanciar = function(genericos, contexto) {
    var ti = new TipoInstancia(contexto);
    ti.genericos = genericos.slice();
    ti.tipo = this;
    return ti;
  }

  function TipoInstancia(contexto) {
    this.contexto = contexto;
    this.tipo = null;
    this.genericos = [];
    this.subsCache = {};
    // TODO: ¿Serializar?
  }

  TipoInstancia.prototype.subrutinaPorNombreInstanciada = function(nombre) {
    //if (nombre in this.subsCache)
    //return this.subsCache[nombre.toLowerCase()];
    var subrutinaGenerica;
    if (this.tipo.modulo)
      subrutinaGenerica = this.tipo.modulo.subrutinaPorNombre(nombre);
    if (!subrutinaGenerica)
      return null;
    if (!this.genericos.length)
      return subrutinaGenerica;

    var subrutinaNueva = new Subrutina();
    zl.writeJson(subrutinaNueva, subrutinaGenerica);
    subrutinaNueva.contexto = this.genericos;
    return this.subsCache[nombre.toLowerCase()] = subrutinaNueva;
  }

  TipoInstancia.prototype.esCompatible = function(otroTi) {
    // Tipo generico
    // sustituir por el subtipo
    var subIzquierda;
    var subDerecha;

    if (this.tipo.nombre === "generico") {
      subIzquierda = this.contexto[this.genericos[0] - 1];
    } else {
      subIzquierda = this;
    }

    if (otroTi.tipo.nombre === "generico") {
      subDerecha = otroTi.contexto[otroTi.genericos[0] - 1];
    } else {
      subDerecha = otroTi;
    }

    var compatible = subIzquierda.tipo.esCompatible(subDerecha.tipo);

    if (subDerecha.genericos.length != subIzquierda.genericos.length)
      return false;

    for (var i = 0; compatible && i < subDerecha.genericos.length; i++) {
      compatible = compatible && subIzquierda.genericos[i].esCompatible(subDerecha.genericos[i]);
    }
    return compatible;
  }

  TipoInstancia.prototype.rellenarDesdeArbol = function(arbol, modulo) {
    var tipo = modulo.tipoPorNombre(arbol.tipo);
    if (!tipo) {
      // TODO: Añadir una lista de tipos que sí existen.
      throw zl.error.newError(zl.error.E_TIPO_NO_EXISTE, {
        posicion: [arbol.begin, arbol.end],
        tipo: arbol.tipo
      });
    }

    if (tipo.genericos.length != arbol.genericos.length) {
      throw zl.error.newError(zl.error.E_GENERICOS_NO_COINCIDEN_TAM, {
        posicion: [arbol.begin, arbol.end],
        tipo: tipo
      });
    }

    this.tipo = tipo;
    this.genericos = new Array(arbol.genericos.length);

    for (var i = 0; i < arbol.genericos.length; i++) {
      // Si es el tipo genérico evitar consumir sus genericos como tipos
      if (tipo.nombre !== "generico") {
        this.genericos[i] = new TipoInstancia(this.contexto);
        this.genericos[i].rellenarDesdeArbol(arbol.genericos[i], modulo);
      } else {
        this.genericos[i] = arbol.genericos[i];
      }
    }
  }

  TipoInstancia.prototype.esIgual = function(otroTi) {
    // Tipo generico
    // sustituir por el subtipo
    var compatible = this.tipo.esIgual(otroTi.tipo);
    var subIzquierda;
    var subDerecha;

    if (this.tipo.nombre === "generico") {
      subIzquierda = this.contexto[this.genericos[0] - 1];
    } else {
      subIzquierda = this;
    }

    if (otroTi.tipo.nombre === "generico") {
      subDerecha = otroTi.contexto[otroTi.genericos[0] - 1];
    } else {
      subDerecha = otroTi;
    }

    if (subDerecha.genericos.length != subIzquierda.genericos.length)
      return false;

    for (var i = 0; compatible && i < subDerecha.genericos.length; i++) {
      compatible = compatible && subIzquierda.genericos[i].esIgual(subDerecha.genericos[i]);
    }
    return compatible;
  }

  TipoInstancia.prototype.especificar = function(contexto) {
    if (this.genericos.length) {
      if (this.tipo.nombre === "generico") {
        var indice = this.genericos[0];
        return contexto[indice - 1];
      } else {
        var ti = new TipoInstancia();
        ti.tipo = this.tipo;
        ti.contexto = this.contexto;
        ti.genericos = this.genericos.slice().map(function(v) {
          return v.especificar(contexto);
        });
        return ti;
      }
    } else {
      return this;
    }
  }

  TipoInstancia.prototype.toString = function() {
    if (this.tipo.nombre === "generico") {
      var indice = this.genericos[0];
      return "Generico(" + indice + ") = " + this.contexto[this.genericos[0] - 1]
    } else {
      var r = this.tipo.nombre.charAt(0).toUpperCase() + this.tipo.nombre.slice(1);
      if (this.genericos.length) {
        r += "(";
      }
      var coma = "";
      for (var i = 0; i < this.genericos.length; i++) {
        r += coma + this.genericos[i];
        coma = ",";
      }
      if (this.genericos.length) {
        r += ")";
      }
      return r;
    }
  }

  function Operacion() {
    this.operador = "";
    this.tipoDerecho = null;
    this.tipoIzquierdo = null;
    this.tipoResultado = null;
    this.localizacion = null;
    this.alias = "";
  }

  // Distintos tipos de modificador.
  Declaracion.prototype.M_LOCAL = 0x00;
  Declaracion.prototype.M_ENTRADA = 0x01;
  Declaracion.prototype.M_SALIDA = 0x02;
  Declaracion.prototype.M_GLOBAL = 0x04;

  zl.entorno.newModulo = function(a) {
    return new Modulo(a);
  }

  zl.entorno.newSubrutina = function(a) {
    return new Subrutina(a);
  }

  zl.entorno.newDeclaracion = function(a) {
    return new Declaracion(a);
  }

  zl.entorno.newTipo = function(a) {
    return new Tipo(a);
  }

  zl.entorno.newTipoInstancia = function(a) {
    return new TipoInstancia(a);
  }

  // El módulo interno contiene las funciones básicas del lenguaje.
  // Recibe un módulo y devuelve el mismo módulo con las transformaciones oportunas.
  var moduloInterno = function(mod) {
      // Tipos básicos:
      var numero = zl.entorno.newTipo(null);
      var booleano = zl.entorno.newTipo(null);
      var texto = zl.entorno.newTipo(null);
      var letra = zl.entorno.newTipo(null);
      var interno = zl.entorno.newTipo(null);
      var cualquiera = zl.entorno.newTipo(null);
      var generico = zl.entorno.newTipo(null); {
        zl.writeJson(numero, {
          nombre: "numero"
        });

        zl.writeJson(booleano, {
          nombre: "booleano"
        });

        zl.writeJson(texto, {
          nombre: "texto"
        });

        zl.writeJson(letra, {
          nombre: "letra"
        });

        zl.writeJson(interno, {
          nombre: "interno"
        });

        zl.writeJson(cualquiera, {
          nombre: "cualquiera"
        })

        zl.writeJson(generico, {
          nombre: "generico",
          genericos: Array(1)
        });

        numero.serializar();
        booleano.serializar();
        texto.serializar();
        interno.serializar();
        cualquiera.serializar();
        generico.serializar();

        mod.registrar(interno);
        mod.registrar(cualquiera);
        mod.registrar(generico);

        mod.registrar(numero);
        mod.registrar(booleano);
        mod.registrar(texto);
        mod.registrar(letra);
      }

      // Aritmética
      mod.registrarOperadorBinario("*", numero.instanciar([], modulo), numero.instanciar([], modulo), numero.instanciar([], modulo), null);
      mod.registrarOperadorBinario("+", numero.instanciar([], modulo), numero.instanciar([], modulo), numero.instanciar([], modulo), null);
      mod.registrarOperadorBinario("-", numero.instanciar([], modulo), numero.instanciar([], modulo), numero.instanciar([], modulo), null);
      mod.registrarOperadorBinario("/", numero.instanciar([], modulo), numero.instanciar([], modulo), numero.instanciar([], modulo), null);
      mod.registrarOperadorBinario("%", numero.instanciar([], modulo), numero.instanciar([], modulo), numero.instanciar([], modulo), null);
      mod.registrarOperadorBinario("=", numero.instanciar([], modulo), numero.instanciar([], modulo), booleano.instanciar([], modulo), null);
      mod.registrarOperadorBinario("<>", numero.instanciar([], modulo), numero.instanciar([], modulo), booleano.instanciar([], modulo), null);
      mod.registrarOperadorBinario("<", numero.instanciar([], modulo), numero.instanciar([], modulo), booleano.instanciar([], modulo), null);
      mod.registrarOperadorBinario(">", numero.instanciar([], modulo), numero.instanciar([], modulo), booleano.instanciar([], modulo), null);
      mod.registrarOperadorBinario("<=", numero.instanciar([], modulo), numero.instanciar([], modulo), booleano.instanciar([], modulo), null);
      mod.registrarOperadorBinario(">=", numero.instanciar([], modulo), numero.instanciar([], modulo), booleano.instanciar([], modulo), null);

      mod.registrarOperadorUnario("+", numero.instanciar([], modulo), numero.instanciar([], modulo), null);
      mod.registrarOperadorUnario("-", numero.instanciar([], modulo), numero.instanciar([], modulo), null);

      // Lógica
      mod.registrarOperadorBinario("y", booleano.instanciar([], modulo), booleano.instanciar([], modulo), booleano.instanciar([], modulo), null);
      mod.registrarOperadorBinario("o", booleano.instanciar([], modulo), booleano.instanciar([], modulo), booleano.instanciar([], modulo), null);
      mod.registrarOperadorUnario("no", booleano.instanciar([], modulo), booleano.instanciar([], modulo), null);

      // Texto
      mod.registrarOperadorBinario("+", texto.instanciar([], modulo), texto.instanciar([], modulo), texto.instanciar([], modulo), null);

      mod.serializar();
      return mod;
    }
    // Módulo interno
  modInterno = moduloInterno(new Modulo());
  modInterno.nombre = "$internal";
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
