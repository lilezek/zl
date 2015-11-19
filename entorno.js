var zl = zl || {};
zl.entorno = zl.entorno || {};

(function() {
    "use strict";

    function Entorno() {
      this.subrutinas = {};
      this.subrutinaActual = new Subrutina();
      return this;
    }

    function Subrutina() {
      this.nombre = "";
      this.modificadores = {};
      this.datos = {};

      // Sirve para declarar variables temporales sin repetir nombres.
      this.temporal = 0;
      // Útil para determinar el bloque en el que se está:
      this.begin = 0;
      this.end = 0;

      // Útil para saber si se usa o no:
      this.usado = false;

      return this;
    }

    function Dato() {
      this.modificador = 0;
      this.nombre = "";
      this.tipo = "";
      // Útil para saber si se usa o no:
      this.usado = false;
      // Útil para determinar la línea en la que está:
      this.begin = 0;
      this.end = 0;
    }

    // Distintos tipos de modificador.
    Dato.prototype.M_LOCAL = 0;
    Dato.prototype.M_ENTRADA = 1;
    Dato.prototype.M_SALIDA = 2;
    Dato.prototype.M_ENTRADA_SALIDA = 3;
    Dato.prototype.M_GLOBAL = 4;

    // Estas funciones son privadas porque no tienen una utilidad fuera de aquí:
    var programa = function(c,e) {
      // Lista de subrutinas
      for (var i = 0; i < c.subrutinas.length; i++) {
        subrutina(c.subrutinas[i],e);
      }
    }

    var subrutina = function(c,e) {
      // Esto cambia la subrutina actual:
      if (!e.registrarSubrutina(c.nombre)) {
        throw zl.error.newError(zl.error.E_NOMBRE_SUBRUTINA_YA_USADO, {

        });
      }
      // Registrar modificadores
      for (var i = 0; i < c.modificadores.length; i++) {
        e.subrutinaActual.modificadores[c.modificadores[i].toLowerCase()] = true;
      }
      // Registrar datos
      for (var i = 0; i < c.datos.length; i++) {
        var dato = e.subrutinaActual.registrarDato(c.datos[i].nombre);
        if (!dato) {
          throw zl.error.newError(zl.error.E_NOMBRE_DATO_YA_USADO, {

          });
        }
        dato.tipo = c.datos[i].tipo;
        for (var j = 0; j < c.datos[i].modificadores.length; j++) {
          var mod = c.datos[i].modificadores[j].toLowerCase();
          if (mod == "salida") {
            if (dato.modificador == dato.M_GLOBAL) {
              throw zl.error.newError(zl.error.E_USO_INDEBIDO_MODIFICADOR_GLOBAL, {

              });
            } else if (dato.modificador == dato.M_SALIDA) {
              throw zl.error.newError(zl.error.E_MODIFICADOR_REPETIDO, {

              });
            } else if (dato.modificador == dato.M_ENTRADA) {
              dato.modificador = dato.M_ENTRADA_SALIDA;
            } else {
              dato.modificador = dato.M_SALIDA;
            }
          } else if (mod == "entrada") {
            if (dato.modificador == dato.M_GLOBAL) {
              throw zl.error.newError(zl.error.E_USO_INDEBIDO_MODIFICADOR_GLOBAL, {

              });
            } else if (dato.modificador == dato.M_ENTRADA) {
              throw zl.error.newError(zl.error.E_MODIFICADOR_REPETIDO, {

              });
            } else if (dato.modificador == dato.M_SALIDA) {
              dato.modificador = dato.M_ENTRADA_SALIDA;
            } else {
              dato.modificador = dato.M_ENTRADA;
            }
          } else if (mod == "global") {
            if (dato.modificador == dato.M_GLOBAL) {
              throw zl.error.newError(zl.error.E_MODIFICADOR_REPETIDO, {

              });
            } else if (dato.modificador == dato.M_ENTRADA || dato.modificador == dato.M_SALIDA) {
              throw zl.error.newError(zl.error.E_MODIFICADOR_REPETIDO, {

              });
            } else {
              dato.modificador = dato.M_GLOBAL;
            }
          }
        }
      }
    }

    Entorno.prototype.registrarNombres = function(compilado) {
      programa(compilado,this);
    }

    Entorno.prototype.pedirNombreTemporal = function() {
      return this.subrutinaActual.temporal++ + "";
    }

    Entorno.prototype.registrarSubrutina = function(nombre) {
      var lnombre = nombre.toLowerCase();
      if (lnombre in this.subrutinas)
        return false;
      this.subrutinas[lnombre] = new Subrutina();
      this.subrutinas[lnombre].nombre = nombre;
      this.subrutinaActual = this.subrutinas[lnombre];
      return true;
    }

    Entorno.prototype.cambiarSubrutina = function(nombre) {
      var lnombre = nombre.toLowerCase();
      if (!(lnombre in this.subrutinas))
        return false;
      this.subrutinaActual = this.subrutinas[lnombre];
      return true;
    }

    Subrutina.prototype.registrarDato = function(nombre) {
      var lnombre = nombre.toLowerCase();
      if (lnombre in this.datos)
        return false;
      this.datos[lnombre] = new Dato();
      this.datos[lnombre].nombre = nombre;
      return this.datos[lnombre];
    }

    zl.entorno.newEntorno = function() {
      return new Entorno();
    }
})();
