var zl = require('./compilador')({
  log: function() {}
});

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var fs = require('fs');

var codigos = {
  '1': ""
};

for (var k in codigos) {
  codigos[k] = fs.readFileSync("pruebas/"+k+".zl").toString();
}

describe('Forzando errores', function() {
  it("Código mal escrito", function() {
    expect(zl.Compilar.bind(zl,"Subrutima Ayylmao")).to.throw();
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
  for (var k in codigos) {
    it('Prueba ' + k, function() {
      expect(zl.Compilar(codigos[k]).javascript).to.be.a("string");
    })
  }
});
