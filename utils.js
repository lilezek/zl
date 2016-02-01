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

  // http://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  zl.escapeHtml = function(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

if (typeof module !== "undefined")
  module.exports = modulo;
else {
  this.zl = modulo(this.zl || {});
}
