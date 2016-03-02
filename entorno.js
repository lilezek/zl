var modulo = function(zl) {
  "use strict";

  zl.entorno = zl.entorno || {};
  var modInterno;

  function Modulo() {
    this.padre = null;
    this.subrutinas = {};
    this.tipos = {};
    this.globales = {};
    this.configuracion = {
      fps: 10,
      precision: 0,
      nombremodulo: "$principal"
    };

    this.importes = {

    };

    this.integraciones = {
    };
    if (modInterno)
      this.integraciones.$internal = modInterno;

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
    nombre = nombre.split(".");
    if (nombre.length > 1) {
      return this.importes[nombre[0]].subrutinaPorNombre(nombre.slice(1, nombre.length).join("."));
    } else {
      nombre = nombre[0];
      for (var k in this.subrutinas) {
        if (this.subrutinas[k].nombre == nombre)
          return this.subrutinas[k];
      }
      for (var k in this.integraciones) {
        var r = this.integraciones[k].subrutinaPorNombre(nombre);
        if (r)
          return r;
      }
    }
    return null;
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

    // Después de serializar, generar el estetipo
    this.estetipo = new Tipo(this);
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

  var ovalues = Object.values || function(o) {
    var r = [];
    for (var k in o)
      r.push(o[k]);
    return r;
  }

  Modulo.prototype.arrayDeIntegraciones = function() {
    return ovalues(this.integraciones);
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

    // Registrar conversores (después de que se registren los datos):
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
        this.conversion.datoEntrada.tipo.registrarConversor(this, this.conversion.datoSalida.tipo);
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
    this.tipo = null;
    // Información de genericidad
    // Ahora mismo es útil para listas y relaciones.
    this.genericidad = {
      subtipo: null, // Subtipo si es lista
      clave: null, // Clave si es relación
      valor: null // Valor si es relación
    };
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
    this.tipo = this.padre.padre.tipoPorNombre(arbol.tipo);
    if (!this.tipo) {
      // TODO: Añadir una lista de tipos que sí existen.
      throw zl.error.newError(zl.error.E_TIPO_NO_EXISTE, {
        posicion: [arbol.begin, arbol.end],
        tipo: arbol.tipo
      });
    }
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
    // Genericidad:
    // TODO: Comprobar que los subtipos existen y emitir el error indicado si no.
    if (this.tipo.nombre === "lista") {
      this.genericidad.subtipo = this.padre.padre.tipoPorNombre(arbol.subtipo);
      this.genericidad.dimensiones = [];
      for (var i = 0; i < arbol.dimensiones.length; i++) {
        if (arbol.dimensiones[i].tipo === 'expresion') {
          this.genericidad.dimensiones.push([1, parseInt(arbol.dimensiones[i].valor.valor)]);
        } else
          this.genericidad.dimensiones.push([parseInt(arbol.dimensiones[i].valor.minimo), parseInt(arbol.dimensiones[i].valor.maximo)]);
      }
    }
    if (this.tipo.nombre === "relacion") {
      this.genericidad.clave = this.padre.padre.tipoPorNombre(arbol.clave);
      this.genericidad.valor = this.padre.padre.tipoPorNombre(arbol.valor);
    }
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

    // Operaciones con el tipo:
    // Unarias
    this.opunario = {};
    // Binarias
    this.opbinario = {};

    // Conversiones:
    this.conversiones = {};

    // Serialización:
    this.serial = "";

    if (modulo) {
      this.nombre = this.modulo.configuracion.nombremodulo;
      this.metodos = this.modulo.subrutinas;
      for (var k in this.metodos) {
        if (this.metodos[k].modificadores.conversora);
          // TODO: añadir conversores.
      }
      this.serializar();
    }

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

  Tipo.prototype.registrarConversor = function(subrutina, tipoObjetivo) {
    // TODO: Comprobar si el conversor está en otro módulo
    // para preparar lo que sea necesario.
    this.conversiones[tipoObjetivo.nombre] = subrutina;
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

  // El módulo interno contiene las funciones básicas del lenguaje.
  // Recibe un módulo y devuelve el mismo módulo con las transformaciones oportunas.
  var moduloInterno = function(mod) {
    // Tipos básicos:
    var numero = zl.entorno.newTipo(null);
    var booleano = zl.entorno.newTipo(null);
    var texto = zl.entorno.newTipo(null);
    var letra = zl.entorno.newTipo(null);
    var relacion = zl.entorno.newTipo(null);
    var lista = zl.entorno.newTipo(null); {
      zl.writeJson(numero, {
        nombre: "numero",
        opunario: {
          '+': {
            resultado: 'numero'
          },
          '-': {
            resultado: 'numero'
          }
        },
        opbinario: {
          '>': {
            'numero': {
              resultado: 'booleano',
              alias: ''
            }
          },
          '=': {
            'numero': {
              resultado: 'booleano',
              alias: ''
            }
          },
          '<': {
            'numero': {
              resultado: 'booleano',
              alias: ''
            }
          },
          '<=': {
            'numero': {
              resultado: 'booleano',
              alias: ''
            }
          },
          '>=': {
            'numero': {
              resultado: 'booleano',
              alias: ''
            }
          },
          '+': {
            'numero': {
              resultado: 'numero',
              alias: ''
            }
          },
          '-': {
            'numero': {
              resultado: 'numero',
              alias: ''
            }
          },
          '*': {
            'numero': {
              resultado: 'numero',
              alias: ''
            },
            'texto': {
              resultado: 'texto',
              alias: 'productoTexto'
            }
          },
          '/': {
            'numero': {
              resultado: 'numero',
              alias: ''
            }
          },
          '%': {
            'numero': {
              resultado: 'numero',
              alias: ''
            }
          }
        }
      });

      zl.writeJson(booleano, {
        nombre: "booleano",
        opunario: {
          'no': {
            resultado: 'booleano',
            alias: ''
          }
        },
        opbinario: {
          'o': {
            'booleano': {
              resultado: 'booleano',
              alias: ''
            }
          },
          'y': {
            'booleano': {
              resultado: 'booleano',
              alias: ''
            }
          }
        }
      });

      zl.writeJson(texto, {
        nombre: "texto",
        opbinario: {
          '=': {
            'texto': {
              resultado: 'booleano',
              alias: ''
            }
          },
          '+': {
            'texto': {
              resultado: 'texto',
              alias: ''
            }
          },
          '*': {
            'numero': {
              resultado: 'texto',
              alias: 'productoTexto'
            }
          }
        }
      });

      zl.writeJson(letra, {
        nombre: "letra",
        opbinario: {
          '=': {
            'letra': {
              resultado: 'booleano',
              alias: ''
            }
          },
        }
      });

      zl.writeJson(lista, {
        nombre: "lista",
        constr: "construirLista"
      });

      zl.writeJson(relacion, {
        nombre: "relacion"
      });

      numero.serializar();
      booleano.serializar();
      texto.serializar();

      mod.registrar(numero);
      mod.registrar(booleano);
      mod.registrar(texto);
      mod.registrar(letra);
      mod.registrar(relacion);
      mod.registrar(lista);
    }

    // TODO: acabar el módulo
    mod.serializar();
    return mod;
  }
  // Módulo interno
  modInterno = moduloInterno(new Modulo());
  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
