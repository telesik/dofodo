[Deutsch](README.de.md) · [English](README.en.md) · **Español** · [Français](README.fr.md) · [Italiano](README.it.md) · [Português (BR)](README.pt-BR.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [中文](README.zh.md)

# Dofodo

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22512610.svg)](https://doi.org/10.5281/zenodo.22512610)

El juego está en la base de datos de BoardGameGeek: [Dofodo (2026)](https://boardgamegeek.com/boardgame/476432).

Jugar en el navegador: <https://telesik.github.io/dofodo/> — a dos en una pantalla o contra el bot.

Un juego de mesa con un **dominó estándar corriente** (28 fichas, doble seis) — pero con reglas
completamente distintas. No es el dominó clásico: la cadena por mitades coincidentes, el clásico
juego de bloqueo y el recuento por los restos aquí no funcionan.

## De qué va el juego

El juego comienza con un doble — la **raíz**. De ella crece un árbol: una ficha corriente colocada
a 90° crea una **bifurcación** y añade un nuevo extremo abierto, mientras que un doble colocado
atravesado **cierra** la rama para siempre.

De ahí el conflicto central. El juego termina cuando nadie puede colocar ficha, y los puntos se
los lleva quien se quedó con más en la mano. Por eso el jugador con la mano ligera estrangula el
juego con cierres, y el de la mano pesada ramifica y gana tiempo para llegar a soltar sus fichas.
La duración del juego se convierte en objeto de lucha directa.

La segunda particularidad: **se juega con las manos abiertas**. Las fichas están boca arriba,
a la vista de ambos, como en el ajedrez. La única fuente de azar es el pozo cerrado.

## Documentos

- **[RULES.es.md](RULES.es.md)** — el reglamento completo del juego a dos. No quedan cuestiones
  abiertas; las reglas están formalizadas hasta el punto de poder implementarse. Incluye la
  terminología, los esquemas y la sección «Notas sobre el equilibrio» con las consecuencias
  de la mecánica.
- **[RULES.ru.md](RULES.ru.md)** — las mismas reglas en ruso. **El texto ruso es la versión
  primaria**; en caso de discrepancia, prevalece el ruso.

## Autores

Los autores son **Alexey Kiselyov** y **Olga Popova**.

Inventé este juego para mi querida esposa Olechka la noche del 31 de julio de 2026. No me gustaba
cuánto depende del azar el dominó corriente, pero tampoco quería eliminar el azar por completo —
de ahí las manos abiertas y el pozo cerrado como su única fuente.

Esbocé la idea deprisa, y nos sentamos a jugar enseguida. Esa misma noche Olechka propuso permitir
la colocación del doble recto — así el jugador ganó una elección, y esa regla pasó a ser la
principal. En la primera variante el doble siempre cerraba la rama.

Cómo fue todo — [RULES.es.md §14](RULES.es.md).

## Estado

Las reglas para dos jugadores están completas. La edición 1.1 se publicó en septiembre de 2026 con
un identificador permanente (el DOI de la cabecera); las reglas en sí no han cambiado desde la
primera edición: solo se precisó la forma de colocar una ficha girada. El modo para 3 o más
jugadores se pospone deliberadamente ([RULES.es.md §12](RULES.es.md)).

Se puede jugar:

- **en el navegador** — <https://telesik.github.io/dofodo/>: dos jugadores en una misma pantalla o contra el bot;
- **en iPhone y iPad** — la aplicación [Dofodo en el App Store](https://apps.apple.com/app/id6801880127): dos jugadores en una misma
  pantalla, contra un bot con tres niveles de fuerza o en dos teléfonos uno junto al otro por
  Bluetooth, sin internet. Gratis, sin anuncios, sin cuentas y sin recopilación de datos; once
  idiomas de interfaz;
- **en Android** — la aplicación [Dofodo en Google Play](https://play.google.com/store/apps/details?id=com.telesik.bonesai):
  las mismas tres formas de jugar; gratis, sin anuncios, sin cuentas y sin recopilación de datos;
  once idiomas de interfaz.

El juego se inventó la tarde del 31 de julio de 2026 y desde entonces se ha jugado muchas veces:
entre dos, contra el bot y por los probadores de la aplicación. Sigue siendo poco para sacar
conclusiones sobre el equilibrio; las observaciones se recogen en «Notas sobre el equilibrio»
([RULES.es.md §13](RULES.es.md)).

El nombre se eligió en septiembre de 2026 tras comprobarlo en BoardGameGeek, las tiendas de
aplicaciones y los registros de marcas (TMview, EUIPO, OMPI).

## Contacto

Preguntas sobre las reglas, sugerencias y ganas de jugar — Alexey en
[LinkedIn](https://www.linkedin.com/in/alexey-kiselyov-80809416/).

## Apoyar a los autores

El juego es gratuito y lo seguirá siendo. Si le regaló una buena velada,
puede dar las gracias a los autores: [Ko-fi](https://ko-fi.com/telesik) o
[GitHub Sponsors](https://github.com/sponsors/telesik).

## Licencia

El texto de las reglas y la documentación — [CC BY 4.0](LICENSE.es). Úselos y adáptelos
libremente, con atribución.
