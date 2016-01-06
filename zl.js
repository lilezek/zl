function debug() {
  // Quitar el comentario para hacer debug:
  //console.log.apply(console, arguments);
}

zl = require('./compilador')({
  log: debug
});

var content = "";

process.stdin.resume();
process.stdin.on('data', function(buf) {
  content += buf.toString();
});
process.stdin.on('end', function() {
  console.log(zl.Compilar(content).javascript);
});
