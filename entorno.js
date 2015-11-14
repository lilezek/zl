var zl = zl || {};
zl.entorno = zl.entorno || {};

(function() {
    "use strict";

    function Entorno() {
      this.subrutinas = [];
      this.llamadas = [];
      this.subrutinaActual = new Subrutina();
      return this;
    }

    function Subrutina() {
      this.nombre = "";
      this.modificadores = [];
      this.datos = [];
      this.temporal = 0;

      return this;
    }

    function Dato() {
      this.modificador = null;
      this.nombre = "";
    }

    Entorno.prototype.registrarNombres = function(compilado) {
      return false;
    }

    Entorno.prototype.pedirNombreTemporal = function() {
      return this.subrutinaActual.temporal++ + "";
    }

    zl.entorno.newEntorno = function() {
      return new Entorno();
    }
})();
