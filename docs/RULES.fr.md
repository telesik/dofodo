# Dofodo — Règles

> **État au 2026-09-06.** Les règles à deux joueurs sont complètes ; aucune question n’est en suspens.
> Le jeu a été inventé le soir du 31 juillet 2026, et de nombreuses manches ont été jouées ce
> soir-là (§14). Points reportés — §12.
>
> Ceci est une traduction. Le texte russe de [RULES.ru.md](RULES.ru.md) fait foi ; en cas de
> divergence, c’est la version russe qui est correcte.
>
> **Édition 1.1** (septembre 2026) : le jeu s’appelle désormais Dofodo (Bonesai jusqu’au
> 5 septembre 2026) ; le §6.3 précise la façon de poser un domino en angle — le **virage forcé**
> apparaît (§1), une technique pratique pour jouer avec de vrais dominos sur une table. Les règles
> elles-mêmes ne changent pas. L’édition 1.0 a été publiée le 1er août 2026.
>
> Version publiée 1.1, avec un identifiant permanent :
> [10.5281/zenodo.22512610](https://doi.org/10.5281/zenodo.22512610). Merci de citer celui-ci.

## 1. Terminologie

| Terme | Sens |
|---|---|
| **Premier joueur** | Celui qui joue en premier dans la manche en cours. Le rôle est réattribué à chaque manche (§2.5). |
| **Second joueur** | L’adversaire du premier joueur dans la manche en cours. |
| **Double** | Un domino aux deux moitiés identiques (0-0, 1-1, … 6-6). Il y en a 7 dans le jeu. |
| **Racine** | Le double par lequel la manche commence. Le premier domino sur la table. |
| **Pioche** | La réserve, face cachée, des dominos qui n’ont pas été distribués. |
| **Bout** | Un chiffre ouvert au bord de la figure, auquel on peut joindre un domino. |
| **Branche** | Une chaîne de dominos allant d’une fourche (ou de la racine) jusqu’à l’un des bouts. |
| **Fourche** | L’endroit où une branche se sépare en deux directions (§6.3). |
| **Bout droit** | Le bout d’une fourche qui garde le chiffre auquel le domino a été joint. |
| **Bout de fourche** | Le bout d’une fourche formé par la moitié libre du domino qui a été joint. |
| **Bout frais** | Un bout de fourche auquel aucun domino n’a encore été joint (§6.4). |
| **Bout fermé** | Un bout scellé par un double posé en travers (§7.1). On ne peut plus le développer. |
| **Impasse** | Un bout auquel aucun domino ne peut plus être joint : les 7 dominos portant ce chiffre sont déjà sur la table. |
| **Dans l’axe** | Une manière de poser un domino : il prolonge la branche sans la diviser. |
| **En angle** | Une manière de poser un domino : il divise la branche. |
| **Virage forcé** | Un domino joint à un bout par le côté, décalé d’emblée. Selon les règles, c’est « dans l’axe » : aucune fourche n’apparaît, la branche change seulement de direction sur la table (§6.3). (Un pur artifice pratique pour une table exiguë où une branche n’a plus de place ; il ne touche pas aux règles.) |
| **En travers** | Une manière de poser un double : il ferme le bout. |
| **Blocage** | L’état où aucun joueur ne peut poser de domino (§9.1). Appelé *ryba*, « poisson », dans l’original russe. |
| **Domino** (sortie) | Un joueur a posé le dernier domino de sa main (§9.2). |
| **Manche** | Une donne, de la racine jusqu’au blocage ou à la sortie d’un joueur. |
| **Partie** | Une série de manches jouée jusqu’à 100 points (§10.5). |

## 2. Matériel et mise en place

2.1. Un jeu de dominos ordinaire : 28 dominos, double-six. Rien d’autre n’est nécessaire.

2.2. Le jeu se joue à deux. Celui qui joue en premier dans la manche en cours est le **premier
joueur**, son adversaire le **second joueur**. Ce sont des rôles au sein d’une manche, non des
identités fixes : le droit de commencer passe de manche en manche (§2.5), si bien que les joueurs
échangent généralement leurs rôles à la manche suivante.

2.3. Les 28 dominos sont mélangés à nouveau avant chaque manche. Chaque joueur tire **7 dominos** ;
**14** restent dans la pioche.

2.4. Le premier joueur tire ses 7 dominos **face visible** immédiatement. Le second joueur tire
**face cachée** et garde sa main cachée jusqu’à ce que le tour passe pour la première fois (§3).

2.5. **Le droit de commencer.**
- Dans la première manche d’une partie, il est tiré au sort — pile ou face, domino le plus bas, peu importe.
- Dans chaque manche suivante, c’est le **vainqueur de la manche précédente** qui commence (§10.4).
- Si la manche précédente s’est terminée par une **égalité**, il n’y a pas de vainqueur et les joueurs
  **échangent** simplement : celui qui jouait second commence.

> La position du premier joueur est supposée légèrement plus faible : il révèle sa main avant de
> jouer, sans rien savoir de celle de l’adversaire. C’est pourquoi le premier coup revient au
> vainqueur. Si les statistiques disent le contraire — que le premier joueur gagne plus souvent —, la
> règle deviendra « le perdant de la manche précédente commence ».

## 3. Mains ouvertes — le trait distinctif

3.1. On joue **mains ouvertes** : les dominos des deux joueurs sont face visible et tout le monde
les voit.

3.2. **La seule exception est le tout premier tour.** Le premier joueur est ouvert dès le tirage des
dominos (§2.4), c’est-à-dire **avant** son premier coup. Le second joueur garde ses dominos cachés
jusqu’à la fin du tour du premier joueur.

3.3. Dès que le tour du premier joueur s’achève — **quelle qu’en soit la manière** : il a posé la
racine, pioché un domino, passé — le second joueur révèle sa main.

3.4. À partir de là et jusqu’à la fin de la manche, les deux mains sont ouvertes. L’asymétrie du
§3.2 s’applique **une fois par manche** et compense le droit de commencer.

3.5. **La pioche est toujours face cachée.** C’est voulu : les mains sont ouvertes comme aux échecs,
et la pioche reste la seule source de hasard du jeu. On peut déduire son contenu (28 moins tout ce
qui est visible), mais l’ordre des dominos est inconnu.

## 4. La règle fondamentale : jouer est obligatoire

4.1. Le joueur dont c’est le tour **doit jouer s’il le peut**. Cela vaut pour toute la manche —
pendant la recherche de la racine comme après.

4.2. Passer alors qu’un coup légal existe est interdit. Piocher alors qu’un coup légal existe est
interdit aussi.

4.3. Conséquences :
- tenir un double alors qu’aucune racine n’est posée → le joueur doit poser la racine (§5.2) ;
- piocher un double pendant la recherche de la racine → il doit le poser (§5.3) ;
- piocher un domino qui va → il doit le jouer (§8.2) ;
- le seul coup légal est mauvais → le joueur doit quand même le jouer. Le piège du §11.1 repose
  exactement là-dessus.

## 5. Début de manche : la recherche de la racine

5.1. Une manche commence toujours par un double — **n’importe lequel**. Il devient la racine.

5.2. Le joueur dont c’est le tour doit poser un double comme racine s’il en a un (§4.1). S’il en a
plusieurs, il choisit lequel devient la racine.

5.3. S’il n’a pas de double, il tire un domino de la pioche (§8).
- Il tire un double → il doit le poser comme racine.
- Il tire autre chose → il le garde et passe le tour.

5.4. Le cycle §5.2–5.3 se répète jusqu’à ce que quelqu’un pose la racine.

5.5. Il ne peut pas y avoir d’impasse : le jeu contient 7 doubles, donc une fois la pioche vide,
tous les doubles sont forcément dans les mains des joueurs.

## 6. Le jeu après la racine

6.1. Le joueur doit poser un domino dont le chiffre correspond à l’un des bouts ouverts (§4.1).

6.2. **La racine ne se développe que dans une direction.** Le côté gauche de la racine ne joue pas,
et les branches ne poussent pas non plus au-dessus ou au-dessous. En pratique, la racine offre
**un seul** bout ouvert.

```
hors jeu ←── [4|4] ──→ bout ouvert « 4 »
```

6.3. Un domino ordinaire (non double) se pose soit **dans l’axe**, soit **en angle**.

**Dans l’axe** — le domino prolonge la branche dans la même direction. La moitié jointe scelle
l’ancien bout, la moitié libre devient le nouveau. Le nombre de bouts ouverts ne change pas :

```
avant :  … ── [3|5] ──→ bout « 5 »
après :  … ── [3|5] ── [5|4] ──→ bout « 4 »
```

**En angle** — le domino est joint au bout libre de la branche, mais tourné de 90°. Cela crée une
**fourche** : deux directions libres portant des chiffres **différents** :

- le **bout droit** — le chiffre auquel le domino a été joint (« 5 » dans l’exemple) ; il reste
  vivant et la branche garde sa direction ;
- le **bout de fourche** — la moitié libre du domino joint (« 4 » dans l’exemple) ; cette branche
  part à 90° de la direction droite.

```
avant :  … ── [3|5] ──→ bout « 5 »

après :  … ── [3|5] ──→ bout droit « 5 »
                   │
                  [5]
                  [4]
                   ↓
           bout de fourche « 4 »
```

*Une fourche ne consomme pas l’ancien bout, elle en **ajoute** un nouveau : le nombre de bouts
ouverts augmente de 1.*

**Poser le domino sur la table : fourche ou virage forcé.** Physiquement, un domino tourné de 90°
peut se caler contre un bout de deux façons, et depuis l’édition 1.1 elles signifient des choses
différentes.

- **Façon 1 — aligné avec la rangée : une vraie fourche.** La moitié jointe se place dans le
  prolongement de la branche droite et la moitié libre dépasse sur le côté. C’est le coup « en
  angle » : il y a maintenant deux bouts — droit et de fourche — et les deux sont vivants. C’est
  aussi ainsi que l’application pose le domino.
- **Façon 2 — décalé d’emblée sur le côté : un virage forcé.** Le domino est joint au bout par le
  côté ; sa moitié jointe ne prolonge pas la rangée mais se place à côté. Selon les règles, c’est un
  coup **« dans l’axe »** : l’ancien bout est scellé, le nouveau bout est la moitié libre du domino,
  et le nombre de bouts ouverts ne change pas. La branche change seulement de direction sur la
  table. Toutes les règles du coup dans l’axe s’appliquent : un virage forcé est permis même sur un
  bout frais (§6.4), et le domino suivant sur ce bout est de nouveau libre — dans l’axe, en angle
  ou double en travers.

Pourquoi c’est utile. D’abord la place : sur une petite table, il n’y a souvent plus d’espace pour
prolonger une branche, et sans le virage forcé il faudrait la réagencer entièrement. Ensuite la
lisibilité : un domino décalé sur le côté se lit à l’œil comme un tournant de la rangée, pas comme
une fourche ; la convention ne fait que fixer ce que l’œil voit déjà.

![Le domino 6:1 posé en angle, aligné avec la rangée](img/turn-inline.jpg)

*Façon 1 : le domino 6:1 est aligné avec la rangée — sa moitié « 6 » prolonge la branche droite. Une fourche : le bout droit « 6 » à droite et le bout de fourche « 1 » en bas.*

![Le même domino 6:1 décalé d’emblée sur le côté](img/turn-sideways.jpg)

*Façon 2 : le même domino 6:1 décalé d’emblée sur le côté — un virage forcé. Selon les règles, c’est la même chose que jouer 6:1 dans l’axe : le bout « 6 » est scellé et la branche continue vers le bas avec le bout « 1 ».*

Les deux photographies montrent aussi un **bout fermé** en haut : la branche verticale bute sur le
double 1:1 posé en travers (§7.1).

6.4. **La restriction du bout frais.** Le premier domino joint à l’un ou l’autre bout d’une fourche
— le bout droit comme le bout de fourche — doit être posé **dans l’axe**. Il ne peut ni créer une
nouvelle fourche ni fermer le bout par un double en travers.

Autrement dit : **une fourche immédiatement après une fourche est interdite**, et **un bout qui vient
d’apparaître ne peut pas non plus être fermé**.

La restriction s’applique à chaque bout séparément et se lève dès qu’un domino a été joint à ce
bout. Ensuite, fourche et fermeture y redeviennent possibles.

*Exemple.* Une fourche avec les bouts « 5 » (droit) et « 4 » (de fourche). On ne peut pas poser 4:1
en angle, ni 5:6 en angle, ni fermer « 5 » ou « 4 » par un double. On peut poser, par exemple, 5:6
dans l’axe — après quoi le bout issu de « 5 » est de nouveau ouvert à tout coup, tandis que le bout
« 4 » est encore frais.

6.5. La fourche est possible à **n’importe quel** tour, sauf dans le cas du §6.4.

6.6. **La seule exception est le premier domino après la racine.** Il peut être posé en angle bien
que le bout de la racine soit lui aussi « frais ». C’est un droit, pas une obligation.

## 7. Le double et la fermeture d’une branche

7.1. Le double est un domino particulier. Il ne peut se poser que de **deux façons** :

- **dans l’axe** — le double est **le long** de la branche, comme un domino ordinaire ; le bout
  reste ouvert et garde le **même** chiffre :

```
… ── [3|5] ── [5|5] ──→ bout « 5 »
```

- **en travers** — le double est posé **perpendiculairement à la direction de la branche** ; la
  branche est **fermée** et ne peut plus être développée :

```
                ┌───┐
                │ 5 │
… ── [3|5] ─────┤   │   ✕ branche fermée
                │ 5 │
                └───┘
```

Pour un exemple réel de branche fermée, voir les photographies du §6.3 : la branche verticale du
haut bute sur le double 1:1 posé en travers.

7.2. **Un double ne peut pas se poser en angle.** On ne crée pas de fourche avec un double.

7.3. Un bout ne peut être fermé que par le double **correspondant** — celui dont le chiffre est égal
au chiffre du bout.

7.4. Un bout frais ne peut pas être fermé (§6.4). Un double posé comme premier domino sur un tel
bout ne peut être posé que **dans l’axe**.

## 8. Piocher

8.1. À son tour, un joueur pioche **au plus un domino** — aussi bien pendant la recherche de la
racine que dans la phase principale.

8.2. Un joueur ne pioche que s’il n’a aucun coup légal (§4.1). Ensuite :
- le domino pioché lui donne un coup → il doit le jouer, et le tour s’achève ;
- le domino pioché ne l’aide pas → il le garde, ne pose rien et passe le tour.

8.3. Si la pioche est vide et qu’il n’y a aucun coup légal, le joueur ne fait rien et passe.

## 9. Fin de manche

Une manche se termine pour l’une de deux raisons.

9.1. **Blocage** — personne ne peut poser de domino : chaque bout ouvert est soit fermé (§7.1), soit
une impasse (il ne reste aucun domino convenable ni dans les mains ni dans la pioche, car les 7
dominos portant ce chiffre sont déjà sur la table). Cas particulier : tous les bouts sans exception
sont fermés.

9.2. **Domino** — un joueur a posé le dernier domino de sa main et n’a plus rien.

9.3. En cas de blocage, on ne pioche pas — on compte les points aussitôt (§10).

## 10. Décompte des points et victoire dans la partie

10.1. À la fin de la manche, chaque joueur compte le **total des points des dominos restés dans sa
main** — la somme des chiffres des deux moitiés de chaque domino. Le joueur qui a fait domino (§9.2)
a un total de zéro.

10.2. **Le double 0:0 a une valeur particulière.** Si le 0:0 est le **seul** domino restant du
joueur, il compte **25 points**. S’il a au moins un autre domino, le 0:0 compte **0**, comme
d’habitude.

10.3. **Seul le joueur dont le total est strictement inférieur ne marque rien.** Tous les autres
ajoutent leur propre total à leur score cumulé. À deux joueurs, cela signifie :

- les totaux diffèrent → le plus élevé ajoute son total à son score, le plus bas ne reçoit rien ;
- les totaux sont **égaux** → **les deux** ajoutent le leur.

10.4. **Le vainqueur de la manche** est le joueur au total strictement inférieur, c’est-à-dire celui
qui n’a rien marqué. À totaux égaux, la manche n’a pas de vainqueur. Le vainqueur commence la manche
suivante (§2.5).

10.5. **Fin de la partie.** Dès qu’après un décompte au moins un joueur atteint **100 points ou
plus**, la partie s’arrête. **Le joueur au score cumulé le plus élevé perd.** Si les scores cumulés
sont égaux (103 et 103, par exemple), la partie est **nulle** et n’a pas de vainqueur.

## 11. Variantes de règles

11.1. **« Un double ne fait que fermer. »** Un double ne peut pas être posé dans l’axe — il ne peut
que fermer une branche (en travers). Il s’ensuit automatiquement qu’un double ne peut pas être le
premier domino sur un bout frais : fermer y est interdit (§6.4), et dans cette variante le double
n’a pas d’autre option.

**C’est la version originale des règles** — c’est ainsi que le jeu a été conçu d’abord. La pose du
double dans l’axe a été introduite le soir même, pendant les premières manches (§14).

La variante crée un **piège** : le double cesse d’être un domino sûr, et l’on peut forcer
l’adversaire à terminer la manche au pire moment. Exemple : la racine est 2:2 et le second joueur
pose 2:1 dans l’axe. Si le premier joueur n’a rien d’autre que 1:1, il doit jouer (§4.1), et sa seule
façon de le faire est en travers — ce qui ferme l’unique bout et écourte la manche, quels que soient
les points qu’il a encore en main.

La variante du §7.1 est actuellement considérée comme la principale : un double peut à la fois
prolonger et fermer. Elle est plus douce et offre plus de décisions, mais elle supprime le piège —
les deux valent donc la peine d’être essayées.

## 12. Reporté

12.1. **Un mode à 3 joueurs et plus.** À revoir une fois le jeu à deux réalisé. (28 dominos : trois
joueurs à 7 chacun → une pioche de 7 ; quatre joueurs à 7 chacun → pas de pioche.)

## 13. Remarques sur l’équilibre

*Ce ne sont pas des règles, mais des conséquences de la mécanique — notées pour ne pas avoir à les
redécouvrir.*

13.1. **Le bilan des bouts.** Dans l’axe → le nombre de bouts est inchangé ; en angle → +1 ;
fermeture par un double en travers → −1. Une manche commence avec un seul bout (§6.2).

13.2. **Le jeu peut être bloqué très vite.** La manche la plus courte possible : racine → un domino
dans l’axe → un double en travers. Trois dominos sur la table et les deux joueurs avec une main
presque pleine. C’est exactement la victoire rapide de celui qui a le total le plus bas.

13.3. **La défense contre une fermeture rapide, c’est la fourche.** Elle est toujours disponible :
tout domino non double qui convient peut se poser en angle, et le §6.4 empêche l’adversaire de
fermer aussitôt un bout frais. Ainsi, le joueur à la main lourde allonge la manche par des fourches,
et le joueur à la main légère l’étrangle par des fermetures. On se dispute directement la longueur
de la manche, et c’est le conflit central du jeu. Sur les premières manches réelles, la mécanique
paraît équilibrée ; des essais plus larges trancheront.

13.4. **Un plafond aux fourches.** Pour ramener le nombre de bouts à 0, il faut une fermeture de plus
qu’il n’y a eu de fourches. Il y a 7 doubles et l’un est allé à la racine → au plus 6 fermetures →
au plus 5 fourches par manche. Une fois **6 fourches ou plus créées, bloquer le jeu en fermant tous
les bouts devient impossible** — la manche ne peut plus se terminer que par la sortie d’un joueur ou
par des impasses. Chaque double posé dans l’axe abaisse encore le plafond d’une unité.

13.5. **Un double posé dans l’axe brûle la clé pour de bon.** Il n’en existe pas de second
exemplaire, donc aucun bout portant ce chiffre ne pourra plus jamais être fermé — seulement asséché.

13.6. **Deux chemins vers zéro.** Faire domino (§9.2) garantit un total de 0, forcément strictement
inférieur, donc cela ne coûte jamais un seul point. Cela donne au joueur deux plans distincts :
bloquer le jeu en tenant la main la plus légère, ou vider entièrement sa main. La fourche sert le
second plan, la fermeture le premier.

13.7. **Pourquoi le 0:0 vaut 25 (§10.2).** Sans cette règle, le 0:0 serait le domino parfait à
garder : on pourrait le conserver jusqu’à la fin sans frais, et un joueur n’ayant que le 0:0 aurait
un total de 0 — il ne paierait donc même pas face à un adversaire qui a fait domino (0 contre 0 est
une égalité, et les deux ne paient rien). La règle renverse tout cela : un 0:0 resté seul devient le
domino le plus cher du jeu.

13.8. **L’égalité punit les deux joueurs.** À totaux égaux, les deux paient (§10.3), donc le seul
endroit sûr est un total strictement inférieur. Ajouté au fait que le perdant additionne son total
**entier** et non la différence, cela rend la fin de manche tranchante : 41 contre 40, c’est un seul
point qui en coûte 41.

13.9. **Une partie courte, ce n’est pas grave.** Le domino moyen vaut 6 points, donc une main
complète de 7 fait environ 42. Un blocage rapide (§13.2) laisse presque tout cela en main, si bien
qu’une seule manche de ce genre inflige d’un coup 40–50 points au perdant, et une partie en 100 se
joue en 2–3 manches. C’est accepté tel quel : la longueur d’une partie n’est pas une constante mais
le résultat de la lutte. Le joueur en mauvaise posture a toutes les raisons de fourcher et
d’allonger la manche pour se délester, et sa réussite en la matière décide justement de la longueur
de la partie.

13.10. **Le droit de commencer : amplificateur ou rattrapage ?** Le premier coup va au vainqueur
(§2.5). Si la position du premier joueur est vraiment la plus faible, cela fonctionne comme un
mécanisme de rattrapage et garde la partie serrée. Si commencer s’avère au contraire un avantage, la
règle fera l’inverse et creusera l’écart du leader. C’est ce que les statistiques devront montrer.

13.11. **Mains ouvertes plus jeu obligatoire égalent information parfaite.** Les décisions du joueur
se ramènent au choix du domino à poser parmi ceux qui conviennent, et à son orientation. Le seul
hasard restant est dans la pioche face cachée (§3.5).

## 14. Comment le jeu est né

J’ai fait ce jeu pour ma femme bien-aimée Olechka le soir du 31 juillet 2026.

Ce qui me gênait dans le domino ordinaire, c’était le poids du hasard : bien trop souvent l’issue est
réglée non par le choix du joueur mais par le domino qui se trouve sortir. Pourtant je ne voulais
pas supprimer le hasard tout à fait — sans lui, le frisson disparaît. D’où le trait distinctif de
ces règles : les mains sont ouvertes comme les pièces aux échecs, et la seule source de hasard qui
reste est la pioche face cachée (§3.5).

J’ai griffonné l’idée rapidement et nous nous sommes assis pour jouer aussitôt. Nous avons joué
toute la soirée. Ma première version était plus stricte : un double ne pouvait se poser qu’en
travers, il fermait donc toujours une branche (§11.1). Olechka a proposé de permettre aussi de le
poser dans l’axe — cela a donné un choix au joueur, et la règle est devenue la principale (§7.1).

Le jeu nous a plu, et c’est pour cela que j’ai écrit les règles.
