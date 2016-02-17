# Tabla de símbolos

* Módulo
  * Conjunto de subrutinas
  * Conjunto de declaraciones globales
  * Camino al código fuente, si existe
  * Conjunto de tipos definidos
  * Conjunto de otros módulos importados
* Subrutina
  * Nombre
  * Modificadores
  * Conjunto de declaraciones
  * Conjunto de sentencias
  * Líneas donde empieza (si el código fuente existe):
    * La subrutina
    * Las declaraciones
    * Las sentencias
* Declaración
  * Nombre
  * Tipo
  * Modificadores
  * Línea (si el código fuente existe)
* Tipo
  * Nombre
  * Estructura de Datos
  * Métodos asociados a la estructura

## Programa

Conjunto de módulos.

Tiene un solo módulo si se usa el editor online.
También tiene un módulo interno con las subrutinas internas del lenguaje.

Los símbolos dentro de un módulo se llamarán usando el operador punto:

modulo.subrutina

Debe ser imposible que los símbolos de un módulo entren en conflicto los nombres de otro módulo.

El módulo interno con las subrutinas internas del lenguaje no tiene nombre. Sus símbolos se exponen directamente. Estan accesibles y son compartidos a todos los módulos.

## Módulo

Conjunto de subrutinas y globales. Los globales de un módulo deben ser inaccesibles desde otros módulos, salvo si se escribe un *getter* del estilo:

```
Subrutina GetEjemplo
Datos
 Ejemplo es Numero globales
 out es Numero de salida
Algoritmo
  out <- Ejemplo
Fin
```

Los módulos no tienen nombre *per se*. El nombre lo generará el módulo que lo necesite.
Los módulos se pueden instanciar un número arbitrario de veces, en forma de declaración.
Un módulo puede tener la subrutina **Inicio**, que se ejecutará cada vez que se instancie el módulo.

Un módulo puede verse como un punto medio entre una estructura de tipo C y una clase de C++. Las subrutinas podrían ser métodos, y solo se exponen las de tipo Externo (ocultación de la implementación), y los miembros de la clase podrían ser los datos de tipo global, accesibles entre todas las subrutinas del módulo. Sin embargo, **de momento** no se ofrece herencia ni flexibilidad de ningún tipo.

## Subrutina

Un nombre, con modificadores, declaraciones y un conjunto de sentencias.

Si dos subrutinas hacen uso del mismo global (coinciden en nombre), deben también coincidir en tipo. Sino, ambas contienen un error de coherencia.

Si la subrutina pertenece a un módulo cuyo código fuente es conocido, debe ofrecer información de la línea donde se encuentra su definición.

## Declaración

Un nombre, un tipo, unos modificadores y la línea donde se encuentra.

El tipo debe existir. El tipo puede ser alguno de los siguientes:

* Letra
* Bit
* Numero
* Texto
* Booleano
* Cualquier instancia de módulo

Los modificadores indician si el dato es de entrada, de salida, es global, es una lista o una relación entre dos tipos.
