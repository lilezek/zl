var async = require("async");
var zl = require('./compilador')({
  log: function() {}
}, async);
// Meter el NodeJS Test IO antes de que la ejecución cargue su propio IO
require('./njstestio')(zl);
require('./ejecucion')(zl, async);

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();
var fs = require('fs');

var codigos = {
  'basico': '',
  'lista': '',
  'operaciones': '',
  'asincrono': '',
  'entradasalidanumero': '',
  'ordenoperaciones': '',
  'listabidimensional': '',
  'globales': '',
  'conversion': ''
};

function precision(precision, n) {
  return (precision > 0 ?
    n.toPrecision(precision) :
    n)
}

for (var k in codigos) {
  codigos[k] = fs.readFileSync("pruebas/" + k + ".zl").toString();
}

describe('Forzando errores', function() {
  // TODO: Reparar esta prueba
  /*it("Código mal escrito", function(done) {
    zl.Compilar("Subrutima Ayylmao", {}, function(err, res) {
      console.log(err, res);
      expect(err).to.not.be.null;
      done();
    });
  });*/

  it("Variable sin declarar", function(done) {
    zl.Compilar("Subrutina B Datos a es Numero Algoritmo c <- a Fin", {}, function(err, res) {
      if (!err) {
        err.should.exist;
        done();
      } else {
        expect(err.tipo).to.equal(zl.error.E_NOMBRE_NO_DEFINIDO);
        done();
      }
    });
  });
})

describe('Compilando las pruebas', function() {
  it('Pruebas de compilación', function(done) {
    async.each(codigos, function(k, innerDone) {
      zl.Compilar(k, {}, function(err, res) {
        if (err)
          done(err);
        else {
          expect(err).to.be.null;
          expect(res.javascript).to.be.a("string");
          innerDone();
        }
      });
    }, function() {
      done();
    });
  });
});

describe('Ejecución de pruebas', function() {
  it("Los códigos emiten por pantalla strings", function(done) {
    async.each(codigos, function(k, innerDone) {
      zl.Compilar(k, {}, function(err, res) {
        if (err) {
          innerDone(err);
        } else {
          var zlcodigo = res.javascript;
          var carga = zl.Cargar(zlcodigo);
          carga.$alAcabar = function() {
            // Para evitar stack overflows:
            async.setImmediate(function() {
              innerDone(null);
            });
          }
          zl.Ejecutar(carga);
        }
      });
    }, function(error) {
      if (error)
        done(error);
      else {
        for (var i = 0; i < zl.test.output.length; i++) {
          expect(zl.test.output[i]).to.be.a("string");
        }
        done();
      }
    });
  });
});

describe('Emisión de valores correctos', function() {
  var prec;

  it("El código operaciones emite 32", function(done) {
    var codigo = codigos["operaciones"];
    var zlcodigo = zl.Compilar(codigo, {}, function(err, res) {
      if (err)
        done(err);
      else {
        prec = res.modulo.configuracion.precision;
        var carga = zl.Cargar(res.javascript);
        carga.$alAcabar = function() {
          expect(zl.test.output[0]).to.equal(precision(prec, 32) + "\n");
          done();
        }
        zl.Ejecutar(carga);
      }
    });
  });
});

describe('Pruebas de entrada/salida', function() {
  var aleatorio = ~~(Math.random() * 10000);
  var prec;
  it('Entrada/salida de número ' + aleatorio, function(done) {
    var codigo = codigos["entradasalidanumero"];
    var zlcodigo = zl.Compilar(codigo, {}, function(err, res) {
      if (err)
        done(err);
      else {
        var carga = zl.Cargar(res.javascript);
        prec = res.modulo.configuracion.precision;
        carga.$asincrono.inicio = true;
        carga.$alAcabar = function() {
          expect(zl.test.output[0]).to.equal(precision(prec, aleatorio) + "\n");
          done();
        }
        zl.test.input.push("" + aleatorio);
        zl.Ejecutar(carga);
      }
    });
  });
});

describe('Pruebas con globales', function() {
  var aleatorio = ~~(Math.random() * 10000);
  var prec;

  it('Entrada/salida con globales ' + aleatorio, function(done) {
    var codigo = codigos["globales"];
    var zlcodigo = zl.Compilar(codigo, {}, function(err, res) {
      if (err)
        done(err);
      else {
        var carga = zl.Cargar(res.javascript);
        prec = res.modulo.configuracion.precision;
        carga.$asincrono.inicio = true;
        carga.$alAcabar = function() {
          expect(zl.test.output[0]).to.equal(precision(prec, aleatorio) + "\n");
          done();
        }
        zl.test.input.push("" + aleatorio);
        zl.Ejecutar(carga);
      }
    });
  });
})

describe('Orden de los operadores', function() {
  var aleatorio = ~~(Math.random() * 10000);
  it('Orden básico de los operadores aritméticos con número ' + aleatorio, function(done) {
    var codigo = codigos["ordenoperaciones"];
    var zlcodigo = zl.Compilar(codigo, {}, function(err, res) {
      if (err)
        done(err);
      else {
        var carga = zl.Cargar(res.javascript);
        prec = res.modulo.configuracion.precision;
        carga.$asincrono.inicio = true;
        carga.$alAcabar = function() {
          expect(zl.test.output[0]).to.equal(precision(prec, 3.1 - aleatorio + 4 * 2) + "\n");
          done();
        }
        zl.test.input.push("" + aleatorio);
        zl.Ejecutar(carga);
      }
    });
  });
})

describe('Pruebas erróneas con listas', function() {
  var c1 = fs.readFileSync("pruebas/accesoerroneolista.zl").toString();

  it('Acceso a una posición que está fuera del array', function(done) {
    zl.Compilar(c1, {}, function(err, res) {
      if (err)
        done(err);
      else {
        var carga = zl.Cargar(res.javascript);
        var error = null;
        carga.$alError = function(err) {
          this.$continuar = false;
          expect(err.tipo).to.equal(zl.error.E_EJECUCION_INDICE_DESCONTROLADO);
          done();
        }
        carga.$alAcabar = function() {
          expect(error).not.to.be.null;
          done();
        }
        zl.Ejecutar(carga);
      }
    });
  });
});

describe('Subrutinas conversoras', function() {
  it('Conversión de texto a numero', function(done) {
    var codigo = codigos["conversion"];
    var zlcodigo = zl.Compilar(codigo, {}, function(err, res) {
      if (err)
        done(err);
      else {
        var carga = zl.Cargar(res.javascript);
        carga.$alError = function(err) {
          done(err);
        }
        carga.$alAcabar = function() {
          expect(isNaN(zl.test.output[0])).to.equal(false);
          expect(zl.test.output[0]).to.equal(zl.test.output[1]);
          done();
        }
        zl.Ejecutar(carga);
      }
    });
  });
});
