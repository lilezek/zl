var zl = require('./compilador')({
  log: function() {}
});

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;

var codigos = {
  '1': ""
};

for (var k in codigos) {

}

describe('Compilando las pruebas', function() {
  for (var k in codigos) {
    it('Prueba ' + k, function() {
      expect(zl.Compilar(codigos[k]).javascript).to.be.a("string");
    })
  }
});
