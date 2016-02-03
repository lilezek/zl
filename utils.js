var modulo = function(zl) {
    // Función auxiliar que sobreescribe un objeto con un json
    zl.writeJson = function(obj, json) {
        for (var k in json) {
            obj[k] = json[k];
        }
        return obj;
    }

    // http://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;',
        "\n": '<br>',
        " ": '&nbsp;'
    };

    zl.escapeHtml = function(string) {
        return String(string).replace(/[&<>"'\/\n ]/g, function(s) {
            return entityMap[s];
        });
    }

    return zl;
}

if (typeof module !== "undefined")
    module.exports = modulo;
else {
    this.zl = modulo(this.zl || {});
}
