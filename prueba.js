"use strict";function basicoModulo($in){"use strict"; var $global=this.$miembros={};this.$configuracion = {"fps":10,"precision":0,"nombremodulo":"basico"};this.mostrar=function($entrada, done){var $self=this;var $salida={};var $local={};
  $in.$io.outWrite($entrada.mensaje+"\n");
  return $salida;};this.mostrarnumero=function($entrada, done){var $self=this;var $salida={};var $local={};
  $in.$io.outWrite($in.$precision($entrada.numero)+"\n");
  return $salida;};this.leer=function($entrada, done){var $self=this;var $salida={};var $local={};
  if ($in.$continuar) {
    var oldabortar = $in.$abortar;
    var self = $in;
    $in.$abortar = $in.$io.abortRead;
    $in.$io.inRead(function(err, value) {
      self.$abortar = oldabortar;
      done(null, {
        mensaje: value
      });
    });
  }
  return $salida;};this.leernumero=function($entrada, done){var $self=this;var $salida={};var $local={};
  if ($in.$continuar) {
    var oldabortar = $in.$abortar;
    var self = $in;
    $in.$abortar = $in.$io.abortRead;
    $in.$io.inRead(function cbck(err, value) {
      var x = parseFloat(value);
      if (isNaN(x))
        $in.$io.inRead(cbck);
      else {
        self.$abortar = oldabortar;
        done(null, {
          numero: x
        });
      }
    });
  }
  return $salida;};this.aleatorio=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.round((Math.random() * ($entrada.maximo - $entrada.minimo)) + $entrada.minimo);
  return $salida;};this.delta=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.delta = $in.$delta/1000;
  return $salida;};this.año=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.año = new Date().getFullYear();
  return $salida;};this.mes=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.mes = new Date().getMonth()+1;
  return $salida;};this.dia=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.dia = new Date().getDate();
  return $salida;};this.hora=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.hora = new Date().getHours();
  return $salida;};this.minuto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.minuto = new Date().getMinutes();
  return $salida;};this.segundo=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.segundo = new Date().getSeconds();
  return $salida;};this.milisegundos=function($entrada, done){var $self=this;var $salida={};var $local={};
  //$salida.milisegundos = (new Date().getTime()) - startTime.getTime();
  return $salida;};this.numerocomotexto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.t = ""+$entrada.n;
  return $salida;};this.textocomonumero=function($entrada, done){var $self=this;var $salida={};var $local={};
  if (isNaN($entrada.t)) {
  	$in.$alError($in.$error.newError($in.$error.E_EJECUCION_CONVERSION_INVALIDA, {
    		tipoBase: "texto",
        tipoObjetivo: "numero",
       	valor: $entrada.t,
        adicional: "No es un número válido."
  		}));
  } else {
  	$salida.n = parseFloat($entrada.t);
  }
  return $salida;};this.pi=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.pi = Math.PI;
  return $salida;};this.e=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.e = Math.E;
  return $salida;};this.esentero=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = ($entrada.num % 1 === 0);
  return $salida;};this.redondearbajo=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.floor($entrada.numero);
  return $salida;};this.redondearalto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.ceil($entrada.numero);
  return $salida;};this.redondear=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.round($entrada.numero);
  return $salida;};this.seno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.sin($entrada.numero);
  return $salida;};this.coseno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.cos($entrada.numero);
  return $salida;};this.tangente=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.tan($entrada.numero);
  return $salida;};this.arcoseno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.asin($entrada.numero);
  return $salida;};this.arcocoseno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.acos($entrada.numero);
  return $salida;};this.arcotangente=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.atan($entrada.numero);
  return $salida;};this.raizcuadrada=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.sqrt($entrada.numero);
  return $salida;};this.absoluto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.abs($entrada.numero);
  return $salida;};this.logaritmo=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.log($entrada.numero);
  return $salida;};this.potencia=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.pow($entrada.base,$entrada.exponente);
  return $salida;};}this.newbasicoModulo = function(){"use strict";var r = new basicoModulo(this);var tmp$principal=new $principalModulo(this);this.$writeJson(r,tmp$principal);r.instancia = this.newbasicoModulo;return r;}"use strict";function $principalModulo($in){"use strict"; var $global=this.$miembros={};this.$configuracion = {"fps":10,"precision":0,"nombremodulo":"$principal"};this.numerocomotexto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.t = ""+$entrada.n;
  return $salida;};this.inicio=function($entrada, done){var $self=this;var $salida={};var $local={};$salida=$self.aleatorio({minimo:0,maximo:100});$local.n=$salida.resultado;$salida=$self.mostrarnumero({numero:$local.n});$salida=$self.mostrar({mensaje:$self.numerocomotexto({n:$local.n}).t});return $salida;};}this.new$principalModulo = function(){"use strict";var r = new $principalModulo(this);var tmp$principal=new $principalModulo(this);this.$writeJson(r,tmp$principal);var tmpbasico=new basicoModulo(this);this.$writeJson(r,tmpbasico);r.instancia = this.new$principalModulo;return r;}
"use strict";function basicoModulo($in){"use strict"; var $global=this.$miembros={};this.$configuracion = {"fps":10,"precision":0,"nombremodulo":"basico"};this.mostrar=function($entrada, done){var $self=this;var $salida={};var $local={};
  $in.$io.outWrite($entrada.mensaje+"\n");
  return $salida;};this.mostrarnumero=function($entrada, done){var $self=this;var $salida={};var $local={};
  $in.$io.outWrite($in.$precision($entrada.numero)+"\n");
  return $salida;};this.leer=function($entrada, done){var $self=this;var $salida={};var $local={};
  if ($in.$continuar) {
    var oldabortar = $in.$abortar;
    var self = $in;
    $in.$abortar = $in.$io.abortRead;
    $in.$io.inRead(function(err, value) {
      self.$abortar = oldabortar;
      done(null, {
        mensaje: value
      });
    });
  }
  return $salida;};this.leernumero=function($entrada, done){var $self=this;var $salida={};var $local={};
  if ($in.$continuar) {
    var oldabortar = $in.$abortar;
    var self = $in;
    $in.$abortar = $in.$io.abortRead;
    $in.$io.inRead(function cbck(err, value) {
      var x = parseFloat(value);
      if (isNaN(x))
        $in.$io.inRead(cbck);
      else {
        self.$abortar = oldabortar;
        done(null, {
          numero: x
        });
      }
    });
  }
  return $salida;};this.aleatorio=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.round((Math.random() * ($entrada.maximo - $entrada.minimo)) + $entrada.minimo);
  return $salida;};this.delta=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.delta = $in.$delta/1000;
  return $salida;};this.año=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.año = new Date().getFullYear();
  return $salida;};this.mes=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.mes = new Date().getMonth()+1;
  return $salida;};this.dia=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.dia = new Date().getDate();
  return $salida;};this.hora=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.hora = new Date().getHours();
  return $salida;};this.minuto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.minuto = new Date().getMinutes();
  return $salida;};this.segundo=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.segundo = new Date().getSeconds();
  return $salida;};this.milisegundos=function($entrada, done){var $self=this;var $salida={};var $local={};
  //$salida.milisegundos = (new Date().getTime()) - startTime.getTime();
  return $salida;};this.numerocomotexto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.t = ""+$entrada.n;
  return $salida;};this.textocomonumero=function($entrada, done){var $self=this;var $salida={};var $local={};
  if (isNaN($entrada.t)) {
  	$in.$alError($in.$error.newError($in.$error.E_EJECUCION_CONVERSION_INVALIDA, {
    		tipoBase: "texto",
        tipoObjetivo: "numero",
       	valor: $entrada.t,
        adicional: "No es un número válido."
  		}));
  } else {
  	$salida.n = parseFloat($entrada.t);
  }
  return $salida;};this.pi=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.pi = Math.PI;
  return $salida;};this.e=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.e = Math.E;
  return $salida;};this.esentero=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = ($entrada.num % 1 === 0);
  return $salida;};this.redondearbajo=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.floor($entrada.numero);
  return $salida;};this.redondearalto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.ceil($entrada.numero);
  return $salida;};this.redondear=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.round($entrada.numero);
  return $salida;};this.seno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.sin($entrada.numero);
  return $salida;};this.coseno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.cos($entrada.numero);
  return $salida;};this.tangente=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.tan($entrada.numero);
  return $salida;};this.arcoseno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.asin($entrada.numero);
  return $salida;};this.arcocoseno=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.acos($entrada.numero);
  return $salida;};this.arcotangente=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.atan($entrada.numero);
  return $salida;};this.raizcuadrada=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.sqrt($entrada.numero);
  return $salida;};this.absoluto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.abs($entrada.numero);
  return $salida;};this.logaritmo=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.log($entrada.numero);
  return $salida;};this.potencia=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.resultado = Math.pow($entrada.base,$entrada.exponente);
  return $salida;};}this.newbasicoModulo = function(){"use strict";var r = new basicoModulo(this);var tmp$principal=new $principalModulo(this);this.$writeJson(r,tmp$principal);r.instancia = this.newbasicoModulo;return r;}"use strict";function $principalModulo($in){"use strict"; var $global=this.$miembros={};this.$configuracion = {"fps":10,"precision":0,"nombremodulo":"$principal"};this.numerocomotexto=function($entrada, done){var $self=this;var $salida={};var $local={};
  $salida.t = ""+$entrada.n;
  return $salida;};this.inicio=function($entrada, done){var $self=this;var $salida={};var $local={};$salida=$self.aleatorio({minimo:0,maximo:100});$local.n=$salida.resultado;$salida=$self.mostrarnumero({numero:$local.n});$salida=$self.mostrar({mensaje:$self.numerocomotexto({n:$local.n}).t});return $salida;};}this.new$principalModulo = function(){"use strict";var r = new $principalModulo(this);var tmp$principal=new $principalModulo(this);this.$writeJson(r,tmp$principal);var tmpbasico=new basicoModulo(this);this.$writeJson(r,tmpbasico);r.instancia = this.new$principalModulo;return r;}
