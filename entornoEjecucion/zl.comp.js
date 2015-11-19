var $zl_inicio;
(function() { /*"use strict"*/
    $zl_inicio = function(arg) {
        var $zl_contador;
        var $zl_num;
        var $zl_primo;
        var $zlr = $zl_mostrar({
            mensaje: "Introduce un número"
        });
        var $zlr = $zl_leernumero({});
        $zl_num = $zlr.mensaje;
        $zl_contador = 2;
        $zl_primo = $zl_num >= 2;
        while ($zl_contador * $zl_contador < $zl_num && $zl_primo == true) {
            if ($zl_num % $zl_contador == 0) {
                $zl_primo = false;
            };
            $zl_contador = $zl_contador + 1;
        };
        if ($zl_primo == true) {
            var $zlr = $zl_mostrar({
                mensaje: "El número " + $zl_num + " es primo"
            });
        } else {
            var $zlr = $zl_mostrar({
                mensaje: "El número " + $zl_num + " no es primo: es divisible por " + ($zl_contador - 1)
            });
        };
    };
})();
