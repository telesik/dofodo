[Deutsch](README.de.md) · [English](README.en.md) · [Español](README.es.md) · **Français** · [Italiano](README.it.md) · [Português (BR)](README.pt-BR.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [中文](README.zh.md)

# Dofodo

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22512610.svg)](https://doi.org/10.5281/zenodo.22512610)

Le jeu est référencé sur BoardGameGeek : [Dofodo (2026)](https://boardgamegeek.com/boardgame/476432).

Jouer dans le navigateur : <https://telesik.github.io/dofodo/> — à deux sur un même écran ou contre le bot.

Un jeu de société qui se joue avec un **jeu de dominos ordinaire** (28 dominos, double-six) — mais
selon des règles complètement différentes. Ce n’est pas le domino classique : la chaîne par moitiés
identiques, le jeu de blocage traditionnel et le décompte des restes fonctionnent ici autrement.

## De quoi parle le jeu

Une manche commence par un double — la **racine**. Un arbre en pousse : un domino ordinaire posé à
90° crée une **fourche** et ajoute un nouveau bout ouvert, tandis qu’un double posé en travers
**ferme** une branche pour de bon.

C’est de là que vient le conflit central. Une manche s’achève quand personne ne peut plus poser de
domino, et les points vont à celui à qui il en reste le plus. Ainsi, le joueur à la main légère
étrangle la manche par des fermetures, et le joueur à la main lourde fourche et gagne du temps pour
se délester. La longueur de la manche est l’objet d’une lutte directe.

Seconde particularité : **on joue mains ouvertes**. Les dominos sont face visible et les deux
joueurs les voient, comme aux échecs. La seule source de hasard est la pioche face cachée.

## Documents

- **[RULES.fr.md](RULES.fr.md)** — les règles complètes à deux joueurs. Aucune question n’est en
  suspens ; les règles sont formalisées au point d’être implémentables. Avec la terminologie, les
  schémas et une section « Remarques sur l’équilibre » sur les conséquences de la mécanique.
- **[RULES.ru.md](RULES.ru.md)** — les mêmes règles en russe. **Le texte russe fait foi** ; en cas
  de divergence, c’est lui qui est correct.

## Auteurs

**Alexey Kiselyov** et **Olga Popova**.

J’ai fait ce jeu pour ma femme bien-aimée Olechka le soir du 31 juillet 2026. Ce qui me gênait dans
le domino ordinaire, c’était le poids du hasard, mais je ne voulais pas le supprimer tout à fait —
d’où les mains ouvertes et la pioche face cachée comme unique source de hasard.

J’ai griffonné l’idée rapidement et nous nous sommes assis pour jouer aussitôt. Le soir même,
Olechka a proposé de permettre de poser un double dans l’axe — cela a donné un choix au joueur, et
la règle est devenue la principale. Dans la première version, un double fermait toujours la branche.

Toute l’histoire est dans [RULES.fr.md §14](RULES.fr.md).

## État

Les règles à deux joueurs sont complètes. L’édition 1.1 a été publiée en septembre 2026 avec un
identifiant pérenne (le DOI en tête) ; les règles elles-mêmes n’ont pas changé depuis la première
édition, seule la façon de poser un domino tourné a été précisée. Un mode à 3 joueurs et plus est
volontairement reporté ([RULES.fr.md §12](RULES.fr.md)).

On peut jouer :

- **dans le navigateur** — <https://telesik.github.io/dofodo/> : à deux sur un même écran ou contre le bot ;
- **sur iPhone et iPad** — l’application [Dofodo sur l’App Store](https://apps.apple.com/app/id6801880127) : à deux sur un même écran,
  contre un bot à trois niveaux de force ou sur deux téléphones côte à côte en Bluetooth, sans
  internet. Gratuite, sans publicité, sans compte et sans collecte de données ; onze langues
  d’interface ;
- **sur Android** — l’application [Dofodo sur Google Play](https://play.google.com/store/apps/details?id=com.telesik.bonesai) :
  les trois mêmes façons de jouer ; gratuite, sans publicité, sans compte et sans collecte de
  données ; onze langues d’interface.

Le jeu a été inventé le soir du 31 juillet 2026 et joué de nombreuses fois depuis — à deux, contre le
bot et par les testeurs de l’application. C’est encore trop peu pour conclure sur l’équilibre ; les
observations sont rassemblées dans « Remarques sur l’équilibre » ([RULES.fr.md §13](RULES.fr.md)).

Le nom a été choisi en septembre 2026 après vérification sur BoardGameGeek, dans les boutiques
d’applications et dans les registres de marques (TMview, EUIPO, OMPI).

## Contact

Questions sur les règles, suggestions ou proposition de partie — Alexey sur
[LinkedIn](https://www.linkedin.com/in/alexey-kiselyov-80809416/).

## Soutenir les auteurs

Le jeu est gratuit et le restera. S’il vous a offert une bonne soirée, vous pouvez dire merci :
[Ko-fi](https://ko-fi.com/telesik) ou [GitHub Sponsors](https://github.com/sponsors/telesik).

## Licence

Le texte des règles et la documentation sont publiés sous [CC BY 4.0](LICENSE.fr). Utilisez-les et
adaptez-les librement, avec attribution.
