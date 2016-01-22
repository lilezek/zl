var zl = require('./compilador')({
  log: function() {}
});
// Meter el NodeJS Test IO antes de que la ejecución cargue su propio IO
require('./njstestio')(zl);
require('./ejecucion')(zl);

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var fs = require('fs');

var codigos = {
  'basico': "",
  'lista': "",
  'operaciones': ""
};

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
      for (var i = 0; i < zl.test.lineas.length; i++) {
        expect(zl.test.lineas[i]).to.be.a("string");
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
    expect(zl.test.lineas[0]).to.equal("32.00000\n");
  });
});
