var zl = require('./compilador')({
  log: function() {}
});
// Meter el NodeJS Test IO antes de que la ejecución cargue su propio IO
require('./njstestio')(zl);
require('./ejecucion')(zl);
require('./configuracion')(zl);

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var fs = require('fs');

var codigos = {
  'basico': '',
  'lista': '',
  'operaciones': '',
  'asincrono': '',
  'entradasalidanumero': '',
  'ordenoperaciones': '',
  'listabidimensional': '',
  'globales': ''
};

function precision(n) {
  return (zl.configuracion.precision > 0       ?
    n.toPrecision(zl.configuracion.precision)  :
    n                                          )
}

for (var k in codigos) {
  codigos[k] = fs.readFileSync("pruebas/" + k + ".zl").toString();
}

describe('Forzando errores', function() {
  it("Código mal escrito", function() {
    expect(zl.Compilar.bind(zl, "Subrutima Ayylmao")).to.throw();
  });

  it("Variable sin declarar", function() {
    try {
      zl.Compilar("Subrutina B Datos a es Numero Algoritmo c <- a Fin");
    } catch (e) {
      expect(e.tipo).to.equal(zl.error.E_NOMBRE_NO_DEFINIDO);
    }
  });
})

describe('Compilando las pruebas', function() {
  it('Pruebas de compilación', function() {
    for (var k in codigos) {
      expect(zl.Compilar(codigos[k]).javascript).to.be.a("string");
    }
  });
});

describe('Ejecución de pruebas', function() {
  it("Los códigos emiten por pantalla strings", function() {
    for (var k in codigos) {
      var codigo = codigos[k];
      var zlcodigo = zl.Compilar(codigo).javascript;
      var carga = zl.Cargar(zlcodigo);
      zl.Ejecutar(carga);
      for (var i = 0; i < zl.test.output.length; i++) {
        expect(zl.test.output[i]).to.be.a("string");
      }
    }
  });
});

describe('Emisión de valores correctos', function() {
  it("El código operaciones emite 32", function() {
    var codigo = codigos["operaciones"];
    var zlcodigo = zl.Compilar(codigo).javascript;
    var carga = zl.Cargar(zlcodigo);
    zl.Ejecutar(carga);
    expect(zl.test.output[0]).to.equal(precision(32) + "\n");
  });
});

describe('Pruebas de entrada/salida', function() {
  var aleatorio = ~~(Math.random() * 10000);
  beforeEach(function(done) {
    var codigo = codigos["entradasalidanumero"];
    var zlcodigo = zl.Compilar(codigo).javascript;
    var carga = zl.Cargar(zlcodigo);
    carga.$asincrono.inicio = true;
    carga.$alAcabar = done;
    zl.test.input.push("" + aleatorio);
    zl.Ejecutar(carga);
  });

  it('Entrada/salida de número ' + aleatorio, function() {
    expect(zl.test.output[0]).to.equal(precision(aleatorio) + "\n");
  });
});

describe('Pruebas con globales', function() {
  var aleatorio = ~~(Math.random() * 10000);
  beforeEach(function(done) {
    var codigo = codigos["globales"];
    var zlcodigo = zl.Compilar(codigo).javascript;
    var carga = zl.Cargar(zlcodigo);
    carga.$asincrono.inicio = true;
    carga.$alAcabar = done;
    zl.test.input.push("" + aleatorio);
    zl.Ejecutar(carga);
  });

  it('Entrada/salida con globales ' + aleatorio, function() {
    expect(zl.test.output[0]).to.equal(precision(aleatorio) + "\n");
  });
})

describe('Orden de los operadores', function() {
  var aleatorio = ~~(Math.random() * 10000);
  beforeEach(function(done) {
    var codigo = codigos["ordenoperaciones"];
    var zlcodigo = zl.Compilar(codigo).javascript;
    var carga = zl.Cargar(zlcodigo);
    carga.$asincrono.inicio = true;
    carga.$alAcabar = done;
    zl.test.input.push("" + aleatorio);
    zl.Ejecutar(carga);
  });

  it('Orden básico de los operadores aritméticos con número ' + aleatorio, function() {
    expect(zl.test.output[0]).to.equal(precision(3.1 - aleatorio + 4 * 2) + "\n");
  });
})

describe('Pruebas erróneas con listas', function() {
  var c1 = fs.readFileSync("pruebas/accesoerroneolista.zl").toString();

  it('Acceso a una posición que está fuera del array', function() {
    try {
      var zlcodigo = zl.Compilar(c1);
      var carga = zl.Cargar(zlcodigo);
      zl.Ejecutar(carga);
    } catch (e) {
      expect(e.tipo).to.equal(zl.error.E_EJECUCION_INDICE_DESCONTROLADO);
    }
  });
});
