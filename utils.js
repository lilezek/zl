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

    zl.arrayContains = function(arr, item) {
      if (!Array.prototype.indexOf) {
        var i = arr.length;
        while (i--) {
          if (arr[i] === item) {
            return true;
          }
        }
        return false;
      }
      return arr.indexOf(item) != -1;
    }


    zl.forEach = function(arr, f) {
      for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
    }

    zl.tablaColores = {
      "adobe ligero": {r: 0xff, g: 0xee, b: 0xca},
      "aguamarina 1": {r: 0x7f, g: 0xff, b: 0xd4},
      "aguamarina 2": {r: 0x76, g: 0xee, b: 0xc6},
      "aguamarina 3": {r: 0x66, g: 0xcd, b: 0xaa},
      "aguamarina 4": {r: 0x45, g: 0x8b, b: 0x74},
      "aguamarina medio": {r: 0x66, g: 0xcd, b: 0xaa},
      "almendra pálido": {r: 0xff, g: 0xeb, b: 0xcd},
      "amarillo 1": {r: 0xff, g: 0xff, b: 0x00},
      "amarillo 2": {r: 0xee, g: 0xee, b: 0x00},
      "amarillo 3": {r: 0xcd, g: 0xcd, b: 0x00},
      "amarillo 4": {r: 0x8b, g: 0x8b, b: 0x00},
      "amarillo claro 2": {r: 0xee, g: 0xee, b: 0xd1},
      "amarillo claro 3": {r: 0xcd, g: 0xcd, b: 0xb4},
      "amarillo claro 4": {r: 0x8b, g: 0x8b, b: 0x7a},
      "amarillo claro": {r: 0xff, g: 0xff, b: 0xe0},
      "ambrosía 1": {r: 0xf0, g: 0xff, b: 0xf0},
      "ambrosía 2": {r: 0xe0, g: 0xee, b: 0xe0},
      "ambrosía 3": {r: 0xc1, g: 0xcd, b: 0xc1},
      "ambrosía 4": {r: 0x83, g: 0x8b, b: 0x83},
      "añil 2": {r: 0x21, g: 0x88, b: 0x68},
      "añil": {r: 0x4b, g: 0x00, b: 0x82},
      "arena ligera": {r: 0xfe, g: 0xff, b: 0xef},
      "azul 1": {r: 0x00, g: 0x00, b: 0xff},
      "azul 2": {r: 0x00, g: 0x00, b: 0xee},
      "azul 3": {r: 0x00, g: 0x00, b: 0xcd},
      "azul 4": {r: 0x00, g: 0x00, b: 0x8b},
      "azul acero 1": {r: 0x63, g: 0xb8, b: 0xff},
      "azul acero 2": {r: 0x5c, g: 0xac, b: 0xee},
      "azul acero 3": {r: 0x4f, g: 0x94, b: 0xcd},
      "azul acero 4": {r: 0x36, g: 0x64, b: 0x8b},
      "azul acero claro 1": {r: 0xca, g: 0xe1, b: 0xff},
      "azul acero claro 2": {r: 0xbc, g: 0xd2, b: 0xee},
      "azul acero claro 3": {r: 0xa2, g: 0xb5, b: 0xcd},
      "azul acero claro 4": {r: 0x6e, g: 0x7b, b: 0x8b},
      "azul acero claro": {r: 0xb0, g: 0xc4, b: 0xde},
      "azul acero": {r: 0x46, g: 0x82, b: 0xb4},
      "azul aciano": {r: 0x64, g: 0x95, b: 0xed},
      "azul alicia": {r: 0xf0, g: 0xf8, b: 0xff},
      "azul cadete 1": {r: 0x98, g: 0xf5, b: 0xff},
      "azul cadete 2": {r: 0x8e, g: 0xe5, b: 0xee},
      "azul cadete 3": {r: 0x7a, g: 0xc5, b: 0xcd},
      "azul cadete 4": {r: 0x53, g: 0x86, b: 0x8b},
      "azul cadete": {r: 0x5f, g: 0x9e, b: 0xa0},
      "azul capota 1": {r: 0x1e, g: 0x90, b: 0xff},
      "azul capota 2": {r: 0x1c, g: 0x86, b: 0xee},
      "azul capota 3": {r: 0x18, g: 0x74, b: 0xcd},
      "azul capota 4": {r: 0x10, g: 0x4e, b: 0x8b},
      "azul cielo 1": {r: 0x87, g: 0xce, b: 0xff},
      "azul cielo 2": {r: 0x7e, g: 0xc0, b: 0xee},
      "azul cielo 3": {r: 0x6c, g: 0xa6, b: 0xcd},
      "azul cielo 4": {r: 0x4a, g: 0x70, b: 0x8b},
      "azul cielo claro 1": {r: 0xb0, g: 0xe2, b: 0xff},
      "azul cielo claro 2": {r: 0xa4, g: 0xd3, b: 0xee},
      "azul cielo claro 3": {r: 0x8d, g: 0xb6, b: 0xcd},
      "azul cielo claro 4": {r: 0x60, g: 0x7b, b: 0x8b},
      "azul cielo claro": {r: 0x87, g: 0xce, b: 0xfa},
      "azul cielo profundo 1": {r: 0x00, g: 0xbf, b: 0xff},
      "azul cielo profundo 2": {r: 0x00, g: 0xb2, b: 0xee},
      "azul cielo profundo 3": {r: 0x00, g: 0x9a, b: 0xcd},
      "azul cielo profundo 4": {r: 0x00, g: 0x68, b: 0x8b},
      "azul cielo": {r: 0x87, g: 0xce, b: 0xeb},
      "azul claro 1": {r: 0xbf, g: 0xef, b: 0xff},
      "azul claro 2": {r: 0xb2, g: 0xdf, b: 0xee},
      "azul claro 3": {r: 0x9a, g: 0xc0, b: 0xcd},
      "azul claro 4": {r: 0x68, g: 0x83, b: 0x8b},
      "azul claro": {r: 0xad, g: 0xd8, b: 0xe6},
      "azul claro sgi": {r: 0x7d, g: 0x9e, b: 0xc0},
      "azul heráldico 1": {r: 0xf0, g: 0xff, b: 0xff},
      "azul heráldico 2": {r: 0xe0, g: 0xee, b: 0xee},
      "azul heráldico 3": {r: 0xc1, g: 0xcd, b: 0xcd},
      "azul heráldico 4": {r: 0x83, g: 0x8b, b: 0x8b},
      "azul medianoche": {r: 0x19, g: 0x19, b: 0x70},
      "azul medio": {r: 0x00, g: 0x00, b: 0xcd},
      "azul naval": {r: 0x00, g: 0x00, b: 0x80},
      "azul oscuro": {r: 0x00, g: 0x00, b: 0x8b},
      "azul pizarra 1": {r: 0x83, g: 0x6f, b: 0xff},
      "azul pizarra 2": {r: 0x7a, g: 0x67, b: 0xee},
      "azul pizarra 3": {r: 0x69, g: 0x59, b: 0xcd},
      "azul pizarra 4": {r: 0x47, g: 0x3c, b: 0x8b},
      "azul pizarra claro": {r: 0x84, g: 0x70, b: 0xff},
      "azul pizarra medio": {r: 0x7b, g: 0x68, b: 0xee},
      "azul pizarra oscuro": {r: 0x48, g: 0x3d, b: 0x8b},
      "azul pizarra": {r: 0x6a, g: 0x5a, b: 0xcd},
      "azul pizarra sgi": {r: 0x71, g: 0x71, b: 0xc6},
      "azul polvo": {r: 0xb0, g: 0xe0, b: 0xe6},
      "azul real 1": {r: 0x48, g: 0x76, b: 0xff},
      "azul real 2": {r: 0x43, g: 0x6e, b: 0xee},
      "azul real 3": {r: 0x3a, g: 0x5f, b: 0xcd},
      "azul real 4": {r: 0x27, g: 0x40, b: 0x8b},
      "azul real": {r: 0x41, g: 0x69, b: 0xe1},
      "azul violeta": {r: 0x8a, g: 0x2b, b: 0xe2},
      "beis": {r: 0xf5, g: 0xf5, b: 0xdc},
      "beis zambullida": {r: 0xfe, g: 0xe0, b: 0xc6},
      "bisque 1": {r: 0xff, g: 0xe4, b: 0xc4},
      "bisque 2": {r: 0xee, g: 0xd5, b: 0xb7},
      "bisque 3": {r: 0xcd, g: 0xb7, b: 0x9e},
      "bisque 4": {r: 0x8b, g: 0x7d, b: 0x6b},
      "blanco antiguo 1": {r: 0xff, g: 0xef, b: 0xdb},
      "blanco antiguo 2": {r: 0xee, g: 0xdf, b: 0xcc},
      "blanco antiguo 3": {r: 0xcd, g: 0xc0, b: 0xb0},
      "blanco antiguo 4": {r: 0x8b, g: 0x83, b: 0x78},
      "blanco antiguo": {r: 0xfa, g: 0xeb, b: 0xd7},
      "blanco fantasma": {r: 0xf8, g: 0xf8, b: 0xff},
      "blanco floral": {r: 0xff, g: 0xfa, b: 0xf0},
      "blanco navajo 1": {r: 0xff, g: 0xde, b: 0xad},
      "blanco navajo 2": {r: 0xee, g: 0xcf, b: 0xa1},
      "blanco navajo 3": {r: 0xcd, g: 0xb3, b: 0x8b},
      "blanco navajo 4": {r: 0x8b, g: 0x79, b: 0x5e},
      "blanco orquídea": {r: 0xfd, g: 0xfd, b: 0xf0},
      "blanco plantación": {r: 0xff, g: 0xff, b: 0xfe},
      "blanco porcelana": {r: 0xfe, g: 0xf9, b: 0xed},
      "blanco puro": {r: 0xff, g: 0xff, b: 0xff},
      "blanco": {r: 0xff, g: 0xff, b: 0xff},
      "blanco sutil": {r: 0xfe, g: 0xff, b: 0xf1},
      "blanco vela": {r: 0xff, g: 0xff, b: 0xf3},
      "bronceado 1": {r: 0xff, g: 0xa5, b: 0x4f},
      "bronceado 2": {r: 0xee, g: 0x9a, b: 0x49},
      "bronceado 3": {r: 0xcd, g: 0x85, b: 0x3f},
      "bronceado 4": {r: 0x8b, g: 0x5a, b: 0x2b},
      "bronceado carmelo": {r: 0xfe, g: 0xf0, b: 0xc9},
      "bronceado": {r: 0xd2, g: 0xb4, b: 0x8c},
      "burlywood 1": {r: 0xff, g: 0xd3, b: 0x9b},
      "burlywood 2": {r: 0xee, g: 0xc5, b: 0x91},
      "burlywood 3": {r: 0xcd, g: 0xaa, b: 0x7d},
      "burlywood 4": {r: 0x8b, g: 0x73, b: 0x55},
      "burlywood": {r: 0xde, g: 0xb8, b: 0x87},
      "cajón de arena": {r: 0xfe, g: 0xf5, b: 0xca},
      "cal helada": {r: 0xf6, g: 0xf9, b: 0xed},
      "caqui 1": {r: 0xff, g: 0xf6, b: 0x8f},
      "caqui 2": {r: 0xee, g: 0xe6, b: 0x85},
      "caqui 3": {r: 0xcd, g: 0xc6, b: 0x73},
      "caqui 4": {r: 0x8b, g: 0x86, b: 0x4e},
      "caqui oscuro": {r: 0xbd, g: 0xb7, b: 0x6b},
      "caqui": {r: 0xf0, g: 0xe6, b: 0x8c},
      "cardo 1": {r: 0xff, g: 0xe1, b: 0xff},
      "cardo 2": {r: 0xee, g: 0xd2, b: 0xee},
      "cardo 3": {r: 0xcd, g: 0xb5, b: 0xcd},
      "cardo 4": {r: 0x8b, g: 0x7b, b: 0x8b},
      "cardo": {r: 0xd8, g: 0xbf, b: 0xd8},
      "carmesí": {r: 0xdc, g: 0x14, b: 0x3c},
      "castaño 1": {r: 0xff, g: 0x34, b: 0xb3},
      "castaño 2": {r: 0xee, g: 0x30, b: 0xa7},
      "castaño 3": {r: 0xcd, g: 0x29, b: 0x90},
      "castaño 4": {r: 0x8b, g: 0x1c, b: 0x62},
      "castaño": {r: 0xb0, g: 0x30, b: 0x60},
      "cerceta sgi": {r: 0x38, g: 0x8e, b: 0x8e},
      "chartreuse 1": {r: 0x7f, g: 0xff, b: 0x00},
      "chartreuse 2": {r: 0x76, g: 0xee, b: 0x00},
      "chartreuse 3": {r: 0x66, g: 0xcd, b: 0x00},
      "chartreuse 4": {r: 0x45, g: 0x8b, b: 0x00},
      "chartreuse sgi": {r: 0x71, g: 0xc6, b: 0x71},
      "chiffon limón 1": {r: 0xff, g: 0xfa, b: 0xcd},
      "chiffon limón 2": {r: 0xee, g: 0xe9, b: 0xbf},
      "chiffon limón 3": {r: 0xcd, g: 0xc9, b: 0xa5},
      "chiffon limón 4": {r: 0x8b, g: 0x89, b: 0x70},
      "chocolate 1": {r: 0xff, g: 0x7f, b: 0x24},
      "chocolate 2": {r: 0xee, g: 0x76, b: 0x21},
      "chocolate 3": {r: 0xcd, g: 0x66, b: 0x1d},
      "chocolate 4": {r: 0x8b, g: 0x45, b: 0x13},
      "chocolate": {r: 0xd2, g: 0x69, b: 0x1e},
      "cian 1": {r: 0x00, g: 0xff, b: 0xff},
      "cian 2": {r: 0x00, g: 0xee, b: 0xee},
      "cian 3": {r: 0x00, g: 0xcd, b: 0xcd},
      "cian 4": {r: 0x00, g: 0x8b, b: 0x8b},
      "cian claro 1": {r: 0xe0, g: 0xff, b: 0xff},
      "cian claro 2": {r: 0xd1, g: 0xee, b: 0xee},
      "cian claro 3": {r: 0xb4, g: 0xcd, b: 0xcd},
      "cian claro 4": {r: 0x7a, g: 0x8b, b: 0x8b},
      "cian claro": {r: 0xe0, g: 0xff, b: 0xff},
      "cian oscuro": {r: 0x00, g: 0x8b, b: 0x8b},
      "ciruela 1": {r: 0xff, g: 0xbb, b: 0xff},
      "ciruela 2": {r: 0xee, g: 0xae, b: 0xee},
      "ciruela 3": {r: 0xcd, g: 0x96, b: 0xcd},
      "ciruela 4": {r: 0x8b, g: 0x66, b: 0x8b},
      "ciruela": {r: 0xdd, g: 0xa0, b: 0xdd},
      "concha marina 1": {r: 0xff, g: 0xf5, b: 0xee},
      "concha marina 2": {r: 0xee, g: 0xe5, b: 0xde},
      "concha marina 3": {r: 0xcd, g: 0xc5, b: 0xbf},
      "concha marina 4": {r: 0x8b, g: 0x86, b: 0x82},
      "coral 1": {r: 0xff, g: 0x72, b: 0x56},
      "coral 2": {r: 0xee, g: 0x6a, b: 0x50},
      "coral 3": {r: 0xcd, g: 0x5b, b: 0x45},
      "coral 4": {r: 0x8b, g: 0x3e, b: 0x2f},
      "coral claro": {r: 0xf0, g: 0x80, b: 0x80},
      "coral": {r: 0xff, g: 0x7f, b: 0x50},
      "cordón viejo": {r: 0xfd, g: 0xf5, b: 0xe6},
      "crema de menta": {r: 0xf5, g: 0xff, b: 0xfa},
      "escala de grises": {r: 0x55, g: 0x55, b: 0x55},
      "fusta de papaya": {r: 0xff, g: 0xef, b: 0xd5},
      "gainsboro": {r: 0xdc, g: 0xdc, b: 0xdc},
      "gris 0": {r: 0x00, g: 0x00, b: 0x00},
      "gris 100": {r: 0xff, g: 0xff, b: 0xff},
      "gris 10": {r: 0x1a, g: 0x1a, b: 0x1a},
      "gris 11": {r: 0x1c, g: 0x1c, b: 0x1c},
      "gris 12": {r: 0x1f, g: 0x1f, b: 0x1f},
      "gris 13": {r: 0x21, g: 0x21, b: 0x21},
      "gris 14": {r: 0x24, g: 0x24, b: 0x24},
      "gris 15": {r: 0x26, g: 0x26, b: 0x26},
      "gris 16": {r: 0x29, g: 0x29, b: 0x29},
      "gris 17": {r: 0x2b, g: 0x2b, b: 0x2b},
      "gris 18": {r: 0x2e, g: 0x2e, b: 0x2e},
      "gris 19": {r: 0x30, g: 0x30, b: 0x30},
      "gris 1": {r: 0x03, g: 0x03, b: 0x03},
      "gris 20": {r: 0x33, g: 0x33, b: 0x33},
      "gris 21": {r: 0x36, g: 0x36, b: 0x36},
      "gris 22": {r: 0x38, g: 0x38, b: 0x38},
      "gris 23": {r: 0x3b, g: 0x3b, b: 0x3b},
      "gris 24": {r: 0x3d, g: 0x3d, b: 0x3d},
      "gris 25": {r: 0x40, g: 0x40, b: 0x40},
      "gris 26": {r: 0x42, g: 0x42, b: 0x42},
      "gris 27": {r: 0x45, g: 0x45, b: 0x45},
      "gris 28": {r: 0x47, g: 0x47, b: 0x47},
      "gris 29": {r: 0x4a, g: 0x4a, b: 0x4a},
      "gris 2": {r: 0x05, g: 0x05, b: 0x05},
      "gris 30": {r: 0x4d, g: 0x4d, b: 0x4d},
      "gris 31": {r: 0x4f, g: 0x4f, b: 0x4f},
      "gris 32": {r: 0x52, g: 0x52, b: 0x52},
      "gris 33": {r: 0x54, g: 0x54, b: 0x54},
      "gris 34": {r: 0x57, g: 0x57, b: 0x57},
      "gris 35": {r: 0x59, g: 0x59, b: 0x59},
      "gris 36": {r: 0x5c, g: 0x5c, b: 0x5c},
      "gris 37": {r: 0x5e, g: 0x5e, b: 0x5e},
      "gris 38": {r: 0x61, g: 0x61, b: 0x61},
      "gris 39": {r: 0x63, g: 0x63, b: 0x63},
      "gris 3": {r: 0x08, g: 0x08, b: 0x08},
      "gris 40": {r: 0x66, g: 0x66, b: 0x66},
      "gris 41": {r: 0x69, g: 0x69, b: 0x69},
      "gris 42": {r: 0x6b, g: 0x6b, b: 0x6b},
      "gris 43": {r: 0x6e, g: 0x6e, b: 0x6e},
      "gris 44": {r: 0x70, g: 0x70, b: 0x70},
      "gris 45": {r: 0x73, g: 0x73, b: 0x73},
      "gris 46": {r: 0x75, g: 0x75, b: 0x75},
      "gris 47": {r: 0x78, g: 0x78, b: 0x78},
      "gris 48": {r: 0x7a, g: 0x7a, b: 0x7a},
      "gris 49": {r: 0x7d, g: 0x7d, b: 0x7d},
      "gris 4": {r: 0x0a, g: 0x0a, b: 0x0a},
      "gris 50": {r: 0x7f, g: 0x7f, b: 0x7f},
      "gris 51": {r: 0x82, g: 0x82, b: 0x82},
      "gris 52": {r: 0x85, g: 0x85, b: 0x85},
      "gris 53": {r: 0x87, g: 0x87, b: 0x87},
      "gris 54": {r: 0x8a, g: 0x8a, b: 0x8a},
      "gris 55": {r: 0x8c, g: 0x8c, b: 0x8c},
      "gris 56": {r: 0x8f, g: 0x8f, b: 0x8f},
      "gris 57": {r: 0x91, g: 0x91, b: 0x91},
      "gris 58": {r: 0x94, g: 0x94, b: 0x94},
      "gris 59": {r: 0x96, g: 0x96, b: 0x96},
      "gris 5": {r: 0x0d, g: 0x0d, b: 0x0d},
      "gris 60": {r: 0x99, g: 0x99, b: 0x99},
      "gris 61": {r: 0x9c, g: 0x9c, b: 0x9c},
      "gris 62": {r: 0x9e, g: 0x9e, b: 0x9e},
      "gris 63": {r: 0xa1, g: 0xa1, b: 0xa1},
      "gris 64": {r: 0xa3, g: 0xa3, b: 0xa3},
      "gris 65": {r: 0xa6, g: 0xa6, b: 0xa6},
      "gris 66": {r: 0xa8, g: 0xa8, b: 0xa8},
      "gris 67": {r: 0xab, g: 0xab, b: 0xab},
      "gris 68": {r: 0xad, g: 0xad, b: 0xad},
      "gris 69": {r: 0xb0, g: 0xb0, b: 0xb0},
      "gris 6": {r: 0x0f, g: 0x0f, b: 0x0f},
      "gris 70": {r: 0xb3, g: 0xb3, b: 0xb3},
      "gris 71": {r: 0xb5, g: 0xb5, b: 0xb5},
      "gris 72": {r: 0xb8, g: 0xb8, b: 0xb8},
      "gris 73": {r: 0xba, g: 0xba, b: 0xba},
      "gris 74": {r: 0xbd, g: 0xbd, b: 0xbd},
      "gris 75": {r: 0xbf, g: 0xbf, b: 0xbf},
      "gris 76": {r: 0xc2, g: 0xc2, b: 0xc2},
      "gris 77": {r: 0xc4, g: 0xc4, b: 0xc4},
      "gris 78": {r: 0xc7, g: 0xc7, b: 0xc7},
      "gris 79": {r: 0xc9, g: 0xc9, b: 0xc9},
      "gris 7": {r: 0x12, g: 0x12, b: 0x12},
      "gris 80": {r: 0xcc, g: 0xcc, b: 0xcc},
      "gris 81": {r: 0xcf, g: 0xcf, b: 0xcf},
      "gris 82": {r: 0xd1, g: 0xd1, b: 0xd1},
      "gris 83": {r: 0xd4, g: 0xd4, b: 0xd4},
      "gris 84": {r: 0xd6, g: 0xd6, b: 0xd6},
      "gris 85": {r: 0xd9, g: 0xd9, b: 0xd9},
      "gris 86": {r: 0xdb, g: 0xdb, b: 0xdb},
      "gris 87": {r: 0xde, g: 0xde, b: 0xde},
      "gris 88": {r: 0xe0, g: 0xe0, b: 0xe0},
      "gris 89": {r: 0xe3, g: 0xe3, b: 0xe3},
      "gris 8": {r: 0x14, g: 0x14, b: 0x14},
      "gris 90": {r: 0xe5, g: 0xe5, b: 0xe5},
      "gris 91": {r: 0xe8, g: 0xe8, b: 0xe8},
      "gris 92": {r: 0xeb, g: 0xeb, b: 0xeb},
      "gris 93": {r: 0xed, g: 0xed, b: 0xed},
      "gris 94": {r: 0xf0, g: 0xf0, b: 0xf0},
      "gris 95": {r: 0xf2, g: 0xf2, b: 0xf2},
      "gris 96": {r: 0xf5, g: 0xf5, b: 0xf5},
      "gris 97": {r: 0xf7, g: 0xf7, b: 0xf7},
      "gris 98": {r: 0xfa, g: 0xfa, b: 0xfa},
      "gris 99": {r: 0xfc, g: 0xfc, b: 0xfc},
      "gris 9": {r: 0x17, g: 0x17, b: 0x17},
      "gris brillante sgi": {r: 0xc5, g: 0xc1, b: 0xaa},
      "gris claro": {r: 0xd3, g: 0xd3, b: 0xd3},
      "gris claro sgi": {r: 0xaa, g: 0xaa, b: 0xaa},
      "gris débil": {r: 0x69, g: 0x69, b: 0x69},
      "gris medio sgi": {r: 0x84, g: 0x84, b: 0x84},
      "gris muy claro sgi": {r: 0xd6, g: 0xd6, b: 0xd6},
      "gris muy oscuro sgi": {r: 0x28, g: 0x28, b: 0x28},
      "gris oscuro": {r: 0xa9, g: 0xa9, b: 0xa9},
      "gris pizarra 1": {r: 0xc6, g: 0xe2, b: 0xff},
      "gris pizarra 2": {r: 0xb9, g: 0xd3, b: 0xee},
      "gris pizarra 3": {r: 0x9f, g: 0xb6, b: 0xcd},
      "gris pizarra 4": {r: 0x6c, g: 0x7b, b: 0x8b},
      "gris pizarra claro": {r: 0x77, g: 0x88, b: 0x99},
      "gris pizarra oscuro 1": {r: 0x97, g: 0xff, b: 0xff},
      "gris pizarra oscuro 2": {r: 0x8d, g: 0xee, b: 0xee},
      "gris pizarra oscuro 3": {r: 0x79, g: 0xcd, b: 0xcd},
      "gris pizarra oscuro 4": {r: 0x52, g: 0x8b, b: 0x8b},
      "gris pizarra oscuro": {r: 0x2f, g: 0x4f, b: 0x4f},
      "gris pizarra": {r: 0x70, g: 0x80, b: 0x90},
      "gris": {r: 0xbe, g: 0xbe, b: 0xbe},
      "gris roca": {r: 0xeb, g: 0xec, b: 0xe4},
      "gris sgi 0": {r: 0x00, g: 0x00, b: 0x00},
      "gris sgi 100": {r: 0xff, g: 0xff, b: 0xff},
      "gris sgi 12": {r: 0x1e, g: 0x1e, b: 0x1e},
      "gris sgi 16": {r: 0x28, g: 0x28, b: 0x28},
      "gris sgi 20": {r: 0x33, g: 0x33, b: 0x33},
      "gris sgi 24": {r: 0x3d, g: 0x3d, b: 0x3d},
      "gris sgi 28": {r: 0x47, g: 0x47, b: 0x47},
      "gris sgi 32": {r: 0x51, g: 0x51, b: 0x51},
      "gris sgi 36": {r: 0x5b, g: 0x5b, b: 0x5b},
      "gris sgi 40": {r: 0x66, g: 0x66, b: 0x66},
      "gris sgi 44": {r: 0x70, g: 0x70, b: 0x70},
      "gris sgi 48": {r: 0x7a, g: 0x7a, b: 0x7a},
      "gris sgi 4": {r: 0x0a, g: 0x0a, b: 0x0a},
      "gris sgi 52": {r: 0x84, g: 0x84, b: 0x84},
      "gris sgi 56": {r: 0x8e, g: 0x8e, b: 0x8e},
      "gris sgi 60": {r: 0x99, g: 0x99, b: 0x99},
      "gris sgi 64": {r: 0xa3, g: 0xa3, b: 0xa3},
      "gris sgi 68": {r: 0xad, g: 0xad, b: 0xad},
      "gris sgi 72": {r: 0xb7, g: 0xb7, b: 0xb7},
      "gris sgi 76": {r: 0xc1, g: 0xc1, b: 0xc1},
      "gris sgi 80": {r: 0xcc, g: 0xcc, b: 0xcc},
      "gris sgi 84": {r: 0xd6, g: 0xd6, b: 0xd6},
      "gris sgi 88": {r: 0xe0, g: 0xe0, b: 0xe0},
      "gris sgi 8": {r: 0x14, g: 0x14, b: 0x14},
      "gris sgi 92": {r: 0xea, g: 0xea, b: 0xea},
      "gris sgi 96": {r: 0xf4, g: 0xf4, b: 0xf4},
      "hojaldre de melocotón 1": {r: 0xff, g: 0xda, b: 0xb9},
      "hojaldre de melocotón 2": {r: 0xee, g: 0xcb, b: 0xad},
      "hojaldre de melocotón 3": {r: 0xcd, g: 0xaf, b: 0x95},
      "hojaldre de melocotón 4": {r: 0x8b, g: 0x77, b: 0x65},
      "horizonte lejano": {r: 0xec, g: 0xf1, b: 0xef},
      "humo blanco": {r: 0xf5, g: 0xf5, b: 0xf5},
      "ladrillo refractario 1": {r: 0xff, g: 0x30, b: 0x30},
      "ladrillo refractario 2": {r: 0xee, g: 0x2c, b: 0x2c},
      "ladrillo refractario 3": {r: 0xcd, g: 0x26, b: 0x26},
      "ladrillo refractario": {r: 0xb2, g: 0x22, b: 0x22},
      "ladrillo refractario x4": {r: 0x8b, g: 0x1a, b: 0x1a},
      "lavanda": {r: 0xe6, g: 0xe6, b: 0xfa},
      "lavanda rubor 1": {r: 0xff, g: 0xf0, b: 0xf5},
      "lavanda rubor 2": {r: 0xee, g: 0xe0, b: 0xe5},
      "lavanda rubor 3": {r: 0xcd, g: 0xc1, b: 0xc5},
      "lavanda rubor 4": {r: 0x8b, g: 0x83, b: 0x86},
      "ligeramente ruborizado": {r: 0xfe, g: 0xee, b: 0xd4},
      "lino": {r: 0xfa, g: 0xf0, b: 0xe6},
      "magenta 1": {r: 0xff, g: 0x00, b: 0xff},
      "magenta 2": {r: 0xee, g: 0x00, b: 0xee},
      "magenta 3": {r: 0xcd, g: 0x00, b: 0xcd},
      "magenta 4": {r: 0x8b, g: 0x00, b: 0x8b},
      "magenta oscuro": {r: 0x8b, g: 0x00, b: 0x8b},
      "marfil 1": {r: 0xff, g: 0xff, b: 0xf0},
      "marfil 2": {r: 0xee, g: 0xee, b: 0xe0},
      "marfil 3": {r: 0xcd, g: 0xcd, b: 0xc1},
      "marfil 4": {r: 0x8b, g: 0x8b, b: 0x83},
      "marfil colmillo": {r: 0xfd, g: 0xfc, b: 0xdc},
      "marrón 1": {r: 0xff, g: 0x40, b: 0x40},
      "marrón 2": {r: 0xee, g: 0x3b, b: 0x3b},
      "marrón 3": {r: 0xcd, g: 0x33, b: 0x33},
      "marrón 4": {r: 0x8b, g: 0x23, b: 0x23},
      "marrón arenoso": {r: 0xf4, g: 0xa4, b: 0x60},
      "marrón montura": {r: 0x8b, g: 0x45, b: 0x13},
      "marrón": {r: 0xa5, g: 0x2a, b: 0x2a},
      "marrón rosáceo 1": {r: 0xff, g: 0xc1, b: 0xc1},
      "marrón rosáceo 2": {r: 0xee, g: 0xb4, b: 0xb4},
      "marrón rosáceo 3": {r: 0xcd, g: 0x9b, b: 0x9b},
      "marrón rosáceo 4": {r: 0x8b, g: 0x69, b: 0x69},
      "marrón rosáceo": {r: 0xbc, g: 0x8f, b: 0x8f},
      "melocotón helado": {r: 0xfc, g: 0xf8, b: 0xdc},
      "merengue tostado": {r: 0xf1, g: 0xed, b: 0xc2},
      "mocasín": {r: 0xff, g: 0xe4, b: 0xb5},
      "nácar": {r: 0xff, g: 0xff, b: 0xf2},
      "naranja 1": {r: 0xff, g: 0xa5, b: 0x00},
      "naranja 2": {r: 0xee, g: 0x9a, b: 0x00},
      "naranja 3": {r: 0xcd, g: 0x85, b: 0x00},
      "naranja 4": {r: 0x8b, g: 0x5a, b: 0x00},
      "naranja oscuro 1": {r: 0xff, g: 0x7f, b: 0x00},
      "naranja oscuro 2": {r: 0xee, g: 0x76, b: 0x00},
      "naranja oscuro 3": {r: 0xcd, g: 0x66, b: 0x00},
      "naranja oscuro 4": {r: 0x8b, g: 0x45, b: 0x00},
      "naranja oscuro": {r: 0xff, g: 0x8c, b: 0x00},
      "nata líquida": {r: 0xfe, g: 0xfe, b: 0xf2},
      "negro": {r: 0x00, g: 0x00, b: 0x00},
      "niebla matutina": {r: 0xfd, g: 0xf2, b: 0xee},
      "nieve 1": {r: 0xff, g: 0xfa, b: 0xfa},
      "nieve 2": {r: 0xee, g: 0xe9, b: 0xe9},
      "nieve 3": {r: 0xcd, g: 0xc9, b: 0xc9},
      "nieve 4": {r: 0x8b, g: 0x89, b: 0x89},
      "oliva pálido": {r: 0xfb, g: 0xf5, b: 0xe6},
      "oro 1": {r: 0xff, g: 0xd7, b: 0x00},
      "oro 2": {r: 0xee, g: 0xc9, b: 0x00},
      "oro 3": {r: 0xcd, g: 0xad, b: 0x00},
      "oro 4": {r: 0x8b, g: 0x75, b: 0x00},
      "orquídea 1": {r: 0xff, g: 0x83, b: 0xfa},
      "orquídea 2": {r: 0xee, g: 0x7a, b: 0xe9},
      "orquídea 3": {r: 0xcd, g: 0x69, b: 0xc9},
      "orquídea 4": {r: 0x8b, g: 0x47, b: 0x89},
      "orquídea medio 1": {r: 0xe0, g: 0x66, b: 0xff},
      "orquídea medio 2": {r: 0xd1, g: 0x5f, b: 0xee},
      "orquídea medio 3": {r: 0xb4, g: 0x52, b: 0xcd},
      "orquídea medio 4": {r: 0x7a, g: 0x37, b: 0x8b},
      "orquídea medio": {r: 0xba, g: 0x55, b: 0xd3},
      "orquídea oscuro 1": {r: 0xbf, g: 0x3e, b: 0xff},
      "orquídea oscuro 2": {r: 0xb2, g: 0x3a, b: 0xee},
      "orquídea oscuro 3": {r: 0x9a, g: 0x32, b: 0xcd},
      "orquídea oscuro 4": {r: 0x68, g: 0x22, b: 0x8b},
      "orquídea oscuro": {r: 0x99, g: 0x32, b: 0xcc},
      "orquídea": {r: 0xda, g: 0x70, b: 0xd6},
      "perú": {r: 0xcd, g: 0x85, b: 0x3f},
      "pluma de avestruz": {r: 0xfe, g: 0xf1, b: 0xe9},
      "púrpura 1": {r: 0x9b, g: 0x30, b: 0xff},
      "púrpura 2": {r: 0x91, g: 0x2c, b: 0xee},
      "púrpura 3": {r: 0x7d, g: 0x26, b: 0xcd},
      "púrpura 4": {r: 0x55, g: 0x1a, b: 0x8b},
      "púrpura medio 1": {r: 0xab, g: 0x82, b: 0xff},
      "púrpura medio 2": {r: 0x9f, g: 0x79, b: 0xee},
      "púrpura medio 3": {r: 0x89, g: 0x68, b: 0xcd},
      "púrpura medio 4": {r: 0x5d, g: 0x47, b: 0x8b},
      "púrpura medio": {r: 0x93, g: 0x70, b: 0xdb},
      "púrpura": {r: 0xa0, g: 0x20, b: 0xf0},
      "rastro polvoriento": {r: 0xfe, g: 0xf1, b: 0xe1},
      "remolacha sgi": {r: 0x8e, g: 0x38, b: 0x8e},
      "rojo 1": {r: 0xff, g: 0x00, b: 0x00},
      "rojo 2": {r: 0xee, g: 0x00, b: 0x00},
      "rojo 3": {r: 0xcd, g: 0x00, b: 0x00},
      "rojo 4": {r: 0x8b, g: 0x00, b: 0x00},
      "rojo anaranjado 1": {r: 0xff, g: 0x45, b: 0x00},
      "rojo anaranjado 2": {r: 0xee, g: 0x40, b: 0x00},
      "rojo anaranjado 3": {r: 0xcd, g: 0x37, b: 0x00},
      "rojo anaranjado 4": {r: 0x8b, g: 0x25, b: 0x00},
      "rojo indio 1": {r: 0xff, g: 0x6a, b: 0x6a},
      "rojo indio 2": {r: 0xee, g: 0x63, b: 0x63},
      "rojo indio 3": {r: 0xcd, g: 0x55, b: 0x55},
      "rojo indio 4": {r: 0x8b, g: 0x3a, b: 0x3a},
      "rojo indio": {r: 0xcd, g: 0x5c, b: 0x5c},
      "rojo oscuro": {r: 0x8b, g: 0x00, b: 0x00},
      "rojo violeta 1": {r: 0xff, g: 0x3e, b: 0x96},
      "rojo violeta 2": {r: 0xee, g: 0x3a, b: 0x8c},
      "rojo violeta 3": {r: 0xcd, g: 0x32, b: 0x78},
      "rojo violeta 4": {r: 0x8b, g: 0x22, b: 0x52},
      "rojo violeta medio": {r: 0xc7, g: 0x15, b: 0x85},
      "rojo violeta pálido 1": {r: 0xff, g: 0x82, b: 0xab},
      "rojo violeta pálido 2": {r: 0xee, g: 0x79, b: 0x9f},
      "rojo violeta pálido 3": {r: 0xcd, g: 0x68, b: 0x89},
      "rojo violeta pálido 4": {r: 0x8b, g: 0x47, b: 0x5d},
      "rojo violeta pálido": {r: 0xdb, g: 0x70, b: 0x93},
      "rojo violeta": {r: 0xd0, g: 0x20, b: 0x90},
      "rosa 1": {r: 0xff, g: 0xb5, b: 0xc5},
      "rosa 2": {r: 0xee, g: 0xa9, b: 0xb8},
      "rosa 3": {r: 0xcd, g: 0x91, b: 0x9e},
      "rosa 4": {r: 0x8b, g: 0x63, b: 0x6c},
      "rosa cálido 1": {r: 0xff, g: 0x6e, b: 0xb4},
      "rosa cálido 2": {r: 0xee, g: 0x6a, b: 0xa7},
      "rosa cálido 3": {r: 0xcd, g: 0x60, b: 0x90},
      "rosa cálido 4": {r: 0x8b, g: 0x3a, b: 0x62},
      "rosa cálido": {r: 0xff, g: 0x69, b: 0xb4},
      "rosa claro 1": {r: 0xff, g: 0xae, b: 0xb9},
      "rosa claro 2": {r: 0xee, g: 0xa2, b: 0xad},
      "rosa claro 3": {r: 0xcd, g: 0x8c, b: 0x95},
      "rosa claro 4": {r: 0x8b, g: 0x5f, b: 0x65},
      "rosa claro": {r: 0xff, g: 0xb6, b: 0xc1},
      "rosa húmedo 1": {r: 0xff, g: 0xe4, b: 0xe1},
      "rosa húmedo 2": {r: 0xee, g: 0xd5, b: 0xd2},
      "rosa húmedo 3": {r: 0xcd, g: 0xb7, b: 0xb5},
      "rosa húmedo 4": {r: 0x8b, g: 0x7d, b: 0x7b},
      "rosa húmedo": {r: 0xff, g: 0xe4, b: 0xe1},
      "rosa polvoriento": {r: 0xfe, g: 0xee, b: 0xcd},
      "rosa profundo 1": {r: 0xff, g: 0x14, b: 0x93},
      "rosa profundo 2": {r: 0xee, g: 0x12, b: 0x89},
      "rosa profundo 3": {r: 0xcd, g: 0x10, b: 0x76},
      "rosa profundo 4": {r: 0x8b, g: 0x0a, b: 0x50},
      "rosa": {r: 0xff, g: 0xc0, b: 0xcb},
      "salmón 1": {r: 0xff, g: 0x8c, b: 0x69},
      "salmón 2": {r: 0xee, g: 0x82, b: 0x62},
      "salmón 3": {r: 0xcd, g: 0x70, b: 0x54},
      "salmón 4": {r: 0x8b, g: 0x4c, b: 0x39},
      "salmón claro 1": {r: 0xff, g: 0xa0, b: 0x7a},
      "salmón claro 2": {r: 0xee, g: 0x95, b: 0x72},
      "salmón claro 3": {r: 0xcd, g: 0x81, b: 0x62},
      "salmón claro 4": {r: 0x8b, g: 0x57, b: 0x42},
      "salmón claro": {r: 0xff, g: 0xa0, b: 0x7a},
      "salmón oscuro": {r: 0xe9, g: 0x96, b: 0x7a},
      "salmón": {r: 0xfa, g: 0x80, b: 0x72},
      "salmón sgi": {r: 0xc6, g: 0x71, b: 0x71},
      "seda de grano 1": {r: 0xff, g: 0xf8, b: 0xdc},
      "seda de grano 2": {r: 0xee, g: 0xe8, b: 0xcd},
      "seda de grano 3": {r: 0xcd, g: 0xc8, b: 0xb1},
      "seda de grano 4": {r: 0x8b, g: 0x88, b: 0x78},
      "siena 1": {r: 0xff, g: 0x82, b: 0x47},
      "siena 2": {r: 0xee, g: 0x79, b: 0x42},
      "siena 3": {r: 0xcd, g: 0x68, b: 0x39},
      "siena 4": {r: 0x8b, g: 0x47, b: 0x26},
      "siena": {r: 0xa0, g: 0x52, b: 0x2d},
      "sombra caliente": {r: 0xfe, g: 0xf6, b: 0xe4},
      "tomate 1": {r: 0xff, g: 0x63, b: 0x47},
      "tomate 2": {r: 0xee, g: 0x5c, b: 0x42},
      "tomate 3": {r: 0xcd, g: 0x4f, b: 0x39},
      "tomate 4": {r: 0x8b, g: 0x36, b: 0x26},
      "trigo 1": {r: 0xff, g: 0xe7, b: 0xba},
      "trigo 2": {r: 0xee, g: 0xd8, b: 0xae},
      "trigo 3": {r: 0xcd, g: 0xba, b: 0x96},
      "trigo 4": {r: 0x8b, g: 0x7e, b: 0x66},
      "trigo": {r: 0xf5, g: 0xde, b: 0xb3},
      "turquesa 1": {r: 0x00, g: 0xf5, b: 0xff},
      "turquesa 2": {r: 0x00, g: 0xe5, b: 0xee},
      "turquesa 3": {r: 0x00, g: 0xc5, b: 0xcd},
      "turquesa 4": {r: 0x00, g: 0x86, b: 0x8b},
      "turquesa medio": {r: 0x48, g: 0xd1, b: 0xcc},
      "turquesa oscuro": {r: 0x00, g: 0xce, b: 0xd1},
      "turquesa pálido 1": {r: 0xbb, g: 0xff, b: 0xff},
      "turquesa pálido 2": {r: 0xae, g: 0xee, b: 0xee},
      "turquesa pálido 3": {r: 0x96, g: 0xcd, b: 0xcd},
      "turquesa pálido 4": {r: 0x66, g: 0x8b, b: 0x8b},
      "turquesa": {r: 0x40, g: 0xe0, b: 0xd0},
      "turquesa": {r: 0xaf, g: 0xee, b: 0xee},
      "vara de oro 1": {r: 0xff, g: 0xc1, b: 0x25},
      "vara de oro 2": {r: 0xee, g: 0xb4, b: 0x22},
      "vara de oro 3": {r: 0xcd, g: 0x9b, b: 0x1d},
      "vara de oro 4": {r: 0x8b, g: 0x69, b: 0x14},
      "vara de oro amarilla claro": {r: 0xfa, g: 0xfa, b: 0xd2},
      "vara de oro claro 1": {r: 0xff, g: 0xec, b: 0x8b},
      "vara de oro claro 2": {r: 0xee, g: 0xdc, b: 0x82},
      "vara de oro claro 3": {r: 0xcd, g: 0xbe, b: 0x70},
      "vara de oro claro 4": {r: 0x8b, g: 0x81, b: 0x4c},
      "vara de oro claro": {r: 0xee, g: 0xdd, b: 0x82},
      "vara de oro oscuro 1": {r: 0xff, g: 0xb9, b: 0x0f},
      "vara de oro oscuro 2": {r: 0xee, g: 0xad, b: 0x0e},
      "vara de oro oscuro 3": {r: 0xcd, g: 0x95, b: 0x0c},
      "vara de oro oscuro 4": {r: 0x8b, g: 0x65, b: 0x08},
      "vara de oro oscuro": {r: 0xb8, g: 0x86, b: 0x0b},
      "vara de oro pálido": {r: 0xee, g: 0xe8, b: 0xaa},
      "vara de oro": {r: 0xda, g: 0xa5, b: 0x20},
      "velo de boda": {r: 0xff, g: 0xff, b: 0xfd},
      "verano caliente": {r: 0xfc, g: 0xf6, b: 0xcf},
      "verde 1": {r: 0x00, g: 0xff, b: 0x00},
      "verde 2": {r: 0x00, g: 0xee, b: 0x00},
      "verde 3": {r: 0x00, g: 0xcd, b: 0x00},
      "verde 4": {r: 0x00, g: 0x8b, b: 0x00},
      "verde amarillento": {r: 0x9a, g: 0xcd, b: 0x32},
      "verde amarillento": {r: 0xad, g: 0xff, b: 0x2f},
      "verde bosque": {r: 0x22, g: 0x8b, b: 0x22},
      "verde césped": {r: 0x7c, g: 0xfc, b: 0x00},
      "verde claro": {r: 0x90, g: 0xee, b: 0x90},
      "verde lima": {r: 0x32, g: 0xcd, b: 0x32},
      "verde mar 1": {r: 0x54, g: 0xff, b: 0x9f},
      "verde mar 2": {r: 0x4e, g: 0xee, b: 0x94},
      "verde mar 3": {r: 0x43, g: 0xcd, b: 0x80},
      "verde mar 4": {r: 0x2e, g: 0x8b, b: 0x57},
      "verde mar claro": {r: 0x20, g: 0xb2, b: 0xaa},
      "verde mar medio": {r: 0x3c, g: 0xb3, b: 0x71},
      "verde mar oscuro 1": {r: 0xc1, g: 0xff, b: 0xc1},
      "verde mar oscuro 2": {r: 0xb4, g: 0xee, b: 0xb4},
      "verde mar oscuro 3": {r: 0x9b, g: 0xcd, b: 0x9b},
      "verde mar oscuro 4": {r: 0x69, g: 0x8b, b: 0x69},
      "verde mar oscuro": {r: 0x8f, g: 0xbc, b: 0x8f},
      "verde mar": {r: 0x2e, g: 0x8b, b: 0x57},
      "verde oliva militar 1": {r: 0xc0, g: 0xff, b: 0x3e},
      "verde oliva militar 2": {r: 0xb3, g: 0xee, b: 0x3a},
      "verde oliva militar 3": {r: 0x9a, g: 0xcd, b: 0x32},
      "verde oliva militar 4": {r: 0x69, g: 0x8b, b: 0x22},
      "verde oliva militar": {r: 0x6b, g: 0x8e, b: 0x23},
      "verde oliva militar sgi": {r: 0x8e, g: 0x8e, b: 0x38},
      "verde oliva oscuro 1": {r: 0xca, g: 0xff, b: 0x70},
      "verde oliva oscuro 2": {r: 0xbc, g: 0xee, b: 0x68},
      "verde oliva oscuro 3": {r: 0xa2, g: 0xcd, b: 0x5a},
      "verde oliva oscuro 4": {r: 0x6e, g: 0x8b, b: 0x3d},
      "verde oliva oscuro": {r: 0x55, g: 0x6b, b: 0x2f},
      "verde oscuro": {r: 0x00, g: 0x64, b: 0x00},
      "verde pálido 1": {r: 0x9a, g: 0xff, b: 0x9a},
      "verde pálido 2": {r: 0x90, g: 0xee, b: 0x90},
      "verde pálido 3": {r: 0x7c, g: 0xcd, b: 0x7c},
      "verde pálido 4": {r: 0x54, g: 0x8b, b: 0x54},
      "verde pálido": {r: 0x98, g: 0xfb, b: 0x98},
      "verde primavera 1": {r: 0x00, g: 0xff, b: 0x7f},
      "verde primavera 2": {r: 0x00, g: 0xee, b: 0x76},
      "verde primavera 3": {r: 0x00, g: 0xcd, b: 0x66},
      "verde primavera 4": {r: 0x00, g: 0x8b, b: 0x45},
      "verde primavera medio": {r: 0x00, g: 0xfa, b: 0x9a},
      "verde velo": {r: 0xee, g: 0xf3, b: 0xe2},
      "violeta oscuro": {r: 0x94, g: 0x00, b: 0xd3},
      "violeta": {r: 0xee, g: 0x82, b: 0xee}
    }

    return zl;
}

if (typeof module !== "undefined")
    module.exports = modulo;
else {
    this.zl = modulo(this.zl || {});
}
