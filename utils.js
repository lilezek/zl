var modulo = function(zl) {
  // Función auxiliar que sobreescribe un objeto con un json
  zl.writeJson = function(obj, json) {
    for (var k in json) {
      obj[k] = json[k];
    }
    return obj;
  }

  return zl;
}

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
