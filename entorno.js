var zl = zl || {};
zl.entorno = zl.entorno || {};

(function() {
  "use strict";

  function Programa() {
    this.modulos = {
      "$internal": modInterno // Módulo interno
    };
    modInterno.padre = this;
    return this;
  }

  Programa.prototype.registrarModulo = function(mod) {
    if (mod.serial == "")
      mod.serializar();
    this.modulos[mod.serial] = mod;
    mod.padre = this;
  }

  Programa.prototype.subrutinaPorNombre = function(nombre) {
    nombre = nombre.split(".");
    if (nombre.length == 1)
      return this.modulos["$internal"].subrutinaPorNombre(nombre[0]);
    return this.modulos[nombre[0]].subrutinaPorNombre(nombre[1]);
  }

  function Modulo(programa) {
    // Programa padre:
    this.padre = programa || null;

    this.subrutinas = {};
    this.tipos = {};
    this.globales = {};

    // Por defecto: representa el código escrito en el propio editor.
    this.fuente = "/";

    // La serialización para distinguirlo de otro módulo
    this.serial = "";

    return this;
  }

  Modulo.prototype.registrar = function (r) {
    var x =
    r instanceof Subrutina  ? this.registrarSubrutina(r)  :
    r instanceof Tipo       ? this.registrarTipo(r)       :
    "Solo se pueden registrar subrutinas o tipos";
    if (x)
      throw x;
  }

  Modulo.prototype.registrarSubrutina = function(sub) {
    this.subrutinas[sub.nombre] = sub;
  }

  Modulo.prototype.registrarTipo = function(tipo) {
    this.tipos[tipo.nombre] = tipo;
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
    return null;
  }

  Modulo.prototype.tipoPorNombre = function(nombre) {
    nombre = nombre.toLowerCase();
    for (var k in this.tipos) {
      if (this.tipos[k].nombre == nombre)
        return this.tipos[k];
    }
    // Si no está en el módulo, mirar en los internos:
    return (
    this.padre ?  this.padre.modulos["$internal"].tipoPorNombre(nombre) :
                  null
    );
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

    // Después de serializar, añadir al programa el módulo
    if (this.padre)
      this.padre.modulos[this.serial] = this;
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
    if (nombre in this.globales){
        if (!decl.esCompatible(this.globales[nombre]))
          throw zl.error.newError(zl.error.E_GLOBALES_INCOMPATIBLES, [decl, this.globales[nombre]]);
    }
    else
      this.globales[nombre] = decl;
    return true;
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
    this.posicionDatos = [arbol.datos[0].begin, arbol.datos[arbol.datos.length - 1].end];
    this.posicionAlgoritmo = [arbol.sentencias[0].begin, arbol.sentencias[arbol.sentencias.length - 1].end - 3]; // El - 3 resta la palabra Fin

    this.nombre = arbol.nombre.toLowerCase();

    // Registrar modificadores
    for (var i = 0; i < arbol.modificadores.length; i++) {
      this.modificadores[arbol.modificadores[i].toLowerCase()] = true;
    }
    // Registrar datos
    for (var i = 0; i < arbol.datos.length; i++) {
      var decl = new Declaracion(this);
      decl.rellenarDesdeArbol(arbol.datos[i]);

      if (decl.nombre in this.declaraciones)
        throw zl.error.newError(zl.error.E_NOMBRE_DATO_YA_USADO, arbol.datos[i]);
      else
        this.declaraciones[decl.nombre] = decl;

      // Registrar si es global:
      if (decl.modificadores & decl.M_GLOBAL) {
        this.padre.registrarGlobal(decl);
      }
    }
    this.serializar();
  }

  function Declaracion(padre) {
    // Subrutina o módulo padre:
    this.padre = padre || null;

    this.nombre = "";
    this.tipo = null;
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
    this.serial = (this.nombre + "@" + this.tipo.serial + "@" + this.modificadores).toLowerCase();
  }

  Declaracion.prototype.rellenarDesdeArbol = function(arbol) {
    this.nombre = arbol.nombre.toLowerCase();
    this.posicion = [arbol.begin, arbol.end];
    // TODO: Para obtener el tipo, hay que irse al Programa padre:
    this.tipo = this.padre.padre.tipoPorNombre(arbol.tipo);
    for (var j = 0; j < arbol.modificadores.length; j++) {
      var mod = arbol.modificadores[j].toLowerCase();
      if (mod == "salida") {
        if (this.modificadores & this.M_SALIDA)
          throw zl.error.newError(zl.error.E_MODIFICADOR_REPETIDO, arbol);
        this.modificadores |= this.M_SALIDA;
      }
      if (mod == "entrada") {
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
    this.serializar();
  }

  function Tipo(modulo) {
    var self = this;
    this.padre = modulo;
    this.nombre = "";

    // Métodos:
    this.metodos = {};

    // Operaciones con el tipo:
    // Unarias
    this.opunario = {};
    // Binarias
    this.opbinario = {};

    // Conversiones:
    this.conversiones = {};

    // Serialización:
    this.serial = "";

    return this;
  }

  Tipo.prototype.esCompatible = function(tipo) {
    // TODO: no limitarse a usar el nombre
    return (tipo instanceof Tipo) && (tipo.nombre === this.nombre);
  }

  Tipo.prototype.serializar = function() {
    // TODO: Serializar correctamente con los métodos
    this.serial = this.nombre;
  }

  // Distintos tipos de modificador.
  Declaracion.prototype.M_LOCAL = 0x00;
  Declaracion.prototype.M_ENTRADA = 0x01;
  Declaracion.prototype.M_SALIDA = 0x02;
  Declaracion.prototype.M_GLOBAL = 0x04;

  zl.entorno.newPrograma = function() {
    return new Programa();
  }

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

  // Módulo interno
  var modInterno = zl.ejecucion.moduloInterno(new Modulo());
})();
