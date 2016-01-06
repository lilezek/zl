(function() {
  "use strict";
  var $in = this;
  this.inicio = function(arg, done) {
    var $zlr = arg;
    var tamaño;
    var matriz;
    async.waterfall([function(c) {
      c(null, arg);
    }, function(arg, done) {
      $zlr = {};
      $zlr = $in.mostrar({
        mensaje: "¿De que tamaño quieres dibujar la matriz cuadrada?"
      });;;
      done(null, {});
    }, $in.leernumero, function(arg, done) {
      $zlr = arg;;
      tamaño = $zlr.mensaje;
      matriz = ($in.productoTexto({
        izq: "#",
        der: tamaño
      })) + "\n";
      matriz = $in.productoTexto({
        izq: matriz,
        der: tamaño
      });
      $zlr = $in.mostrar({
        mensaje: matriz
      });;
      done(null, $zlr);
    }], done);
  };
}).call(this);
