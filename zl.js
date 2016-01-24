function debug() {
  // Quitar el comentario para hacer debug:
  //console.log.apply(console, arguments);
}

var zl = require('./compilador')({
  log: debug
});

var UglifyJS = require('uglify-js');
var js_beautify = require('js-beautify').js_beautify;

var options = {
  uglify: false,
  beautify: false
};

var uglify = function(code) {
  if (options.uglify)
    return UglifyJS.minify(code, {
      fromString: true
    }).code;
  return code;
}

var beautify = function(code) {
  if (options.beautify)
    return js_beautify(code);
  return code;
}

var content = "";

if (process.argv.indexOf("uglify") != -1) {
  options.uglify = true;
}

if (process.argv.indexOf("beautify") != -1) {
  options.beautify = true;
}

process.stdin.resume();
process.stdin.on('data', function(buf) {
  content += buf.toString();
});
process.stdin.on('end', function() {
  console.log(beautify(uglify(zl.Compilar(content).javascript)));
});
