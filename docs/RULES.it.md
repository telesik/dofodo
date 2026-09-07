# Dofodo — Regole

> **Stato al 2026-09-06.** Le regole per due giocatori sono complete; non restano questioni aperte.
> Il gioco è stato inventato la sera del 31 luglio 2026, e quella stessa sera si sono giocate molte
> mani (§14). Punti rinviati — §12.
>
> Questa è una traduzione. Il testo russo in [RULES.ru.md](RULES.ru.md) è la versione primaria; in
> caso di discrepanza, fa fede quella russa.
>
> **Edizione 1.1** (settembre 2026): il gioco ora si chiama Dofodo (Bonesai fino al 5 settembre
> 2026); il §6.3 precisa come si dispone una tessera ad angolo — compare la **curva forzata** (§1),
> una tecnica comoda per giocare con tessere vere su un tavolo. Le regole in sé non cambiano.
> L’edizione 1.0 è stata pubblicata il 1° agosto 2026.
>
> Versione pubblicata 1.1, con identificatore permanente:
> [10.5281/zenodo.22512610](https://doi.org/10.5281/zenodo.22512610). Si prega di citare quello.

## 1. Terminologia

| Termine | Significato |
|---|---|
| **Primo giocatore** | Chi muove per primo nella mano in corso. Il ruolo viene riassegnato a ogni mano (§2.5). |
| **Secondo giocatore** | L’avversario del primo giocatore nella mano in corso. |
| **Doppio** | Una tessera con le due metà uguali (0-0, 1-1, … 6-6). Nel set ce ne sono 7. |
| **Radice** | Il doppio da cui inizia la mano. La prima tessera sul tavolo. |
| **Pozzo** | La riserva, coperta, delle tessere non distribuite. |
| **Estremità** | Un numero aperto al bordo della figura, a cui si può attaccare una tessera. |
| **Ramo** | Una catena di tessere che va da un bivio (o dalla radice) a una delle estremità. |
| **Bivio** | Il punto in cui un ramo si divide in due direzioni (§6.3). |
| **Estremità dritta** | L’estremità di un bivio che conserva il numero a cui la tessera è stata attaccata. |
| **Estremità del bivio** | L’estremità di un bivio formata dalla metà libera della tessera attaccata. |
| **Estremità fresca** | Un’estremità di un bivio a cui non è ancora stata attaccata alcuna tessera (§6.4). |
| **Estremità chiusa** | Un’estremità sigillata da un doppio posato di traverso (§7.1). Non si può più sviluppare. |
| **Vicolo cieco** | Un’estremità a cui nessuna tessera può più essere attaccata: tutte e 7 le tessere con quel numero sono già sul tavolo. |
| **In linea** | Un modo di posare una tessera: prolunga il ramo senza dividerlo. |
| **Ad angolo** | Un modo di posare una tessera: divide il ramo. |
| **Curva forzata** | Una tessera attaccata a un’estremità di lato, subito spostata. Secondo le regole è «in linea»: non si forma alcun bivio, il ramo cambia soltanto direzione sul tavolo (§6.3). (Un espediente puramente pratico per un tavolo stretto dove un ramo non ha più spazio; non tocca le regole.) |
| **Di traverso** | Un modo di posare un doppio: chiude l’estremità. |
| **Blocco** | La situazione in cui nessun giocatore può posare una tessera (§9.1). Nell’originale russo si chiama *ryba*, «pesce». |
| **Chiusura** | Un giocatore ha posato l’ultima tessera della sua mano (§9.2). |
| **Mano** | Una distribuzione, dalla radice fino al blocco o alla chiusura di un giocatore. |
| **Partita** | Una serie di mani giocata fino a 100 punti (§10.5). |

## 2. Componenti e preparazione

2.1. Un normale set di domino: 28 tessere, doppio sei. Non serve altro.

2.2. Il gioco è per due. Chi muove per primo nella mano in corso è il **primo giocatore**, il suo
avversario il **secondo giocatore**. Sono ruoli all’interno di una singola mano, non identità fisse:
il diritto di muovere per primo passa di mano in mano (§2.5), quindi di solito i giocatori si
scambiano i ruoli nella mano successiva.

2.3. Tutte le 28 tessere si rimescolano prima di ogni mano. Ogni giocatore pesca **7 tessere**;
**14** restano nel pozzo.

2.4. Il primo giocatore pesca le sue 7 tessere subito **scoperte**. Il secondo giocatore pesca
**coperto** e tiene la mano nascosta finché il turno non passa per la prima volta (§3).

2.5. **Il diritto di muovere per primo.**
- Nella prima mano di una partita si decide a caso — lancio di una moneta, tessera più bassa, come si vuole.
- In ogni mano successiva muove per primo il **vincitore della mano precedente** (§10.4).
- Se la mano precedente è finita in **parità**, non c’è vincitore e i giocatori semplicemente
  **si scambiano**: chi ha mosso per secondo ora muove per primo.

> La posizione del primo giocatore si presume leggermente più debole: rivela la mano prima di
> muovere, senza sapere nulla di quella dell’avversario. Per questo la prima mossa spetta al
> vincitore. Se le statistiche diranno il contrario — che il primo giocatore vince più spesso — la
> regola diventerà «muove per primo chi ha perso la mano precedente».

## 3. Mani scoperte — la caratteristica distintiva

3.1. Si gioca **a mani scoperte**: le tessere di entrambi i giocatori sono a faccia in su e visibili
a tutti.

3.2. **L’unica eccezione è il primissimo turno.** Il primo giocatore è scoperto dal momento in cui
pesca le tessere (§2.4), cioè **prima** della sua prima mossa. Il secondo giocatore tiene le tessere
coperte finché il turno del primo non è finito.

3.3. Appena il turno del primo giocatore termina — **comunque termini**: ha posato la radice, ha
pescato una tessera, ha passato — il secondo giocatore scopre la mano.

3.4. Da quel momento fino alla fine della mano entrambe le mani sono scoperte. L’asimmetria del
§3.2 vale **una volta per mano** e compensa il diritto di muovere per primo.

3.5. **Il pozzo è sempre coperto.** È voluto: le mani sono scoperte come negli scacchi, e il pozzo
resta l’unica fonte di casualità del gioco. Il suo contenuto si può dedurre (28 meno tutto ciò che
è visibile), ma l’ordine delle tessere è sconosciuto.

## 4. La regola fondamentale: se puoi giocare, devi

4.1. Il giocatore di turno **deve giocare se può**. Vale per tutta la mano — durante la ricerca
della radice e dopo.

4.2. Passare quando esiste una mossa legale non è consentito. Nemmeno pescare dal pozzo quando
esiste una mossa legale.

4.3. Conseguenze:
- avere un doppio in mano quando la radice non è ancora stata posata → il giocatore deve posare la
  radice (§5.2);
- pescare un doppio durante la ricerca della radice → deve posarlo (§5.3);
- pescare una tessera che ci sta → deve giocarla (§8.2);
- l’unica mossa legale è cattiva → il giocatore deve farla lo stesso. La trappola del §11.1 si regge
  proprio su questo.

## 5. Inizio della mano: la ricerca della radice

5.1. Una mano inizia sempre con un doppio — **uno qualsiasi**. Diventa la radice.

5.2. Il giocatore di turno deve posare un doppio come radice se ne ha uno (§4.1). Se ne ha diversi,
sceglie quale diventa la radice.

5.3. Se non ha doppi, pesca una tessera dal pozzo (§8).
- Pesca un doppio → deve posarlo come radice.
- Pesca altro → lo tiene e passa il turno.

5.4. Il ciclo §5.2–5.3 si ripete finché qualcuno non posa la radice.

5.5. Non può bloccarsi: il set contiene 7 doppi, quindi una volta svuotato il pozzo tutti i doppi
sono di sicuro nelle mani dei giocatori.

## 6. Il gioco dopo la radice

6.1. Il giocatore deve posare una tessera il cui numero coincide con una delle estremità aperte
(§4.1).

6.2. **La radice si sviluppa in una sola direzione.** Il lato sinistro della radice non è in gioco, e
i rami non crescono nemmeno sopra o sotto di essa. In pratica la radice offre **una sola** estremità
aperta.

```
fuori gioco ←── [4|4] ──→ estremità aperta «4»
```

6.3. Una tessera normale (non doppio) si posa **in linea** oppure **ad angolo**.

**In linea** — la tessera prolunga il ramo nella stessa direzione. La metà attaccata sigilla la
vecchia estremità, la metà libera diventa quella nuova. Il numero di estremità aperte non cambia:

```
prima:   … ── [3|5] ──→ estremità «5»
dopo:    … ── [3|5] ── [5|4] ──→ estremità «4»
```

**Ad angolo** — la tessera si attacca all’estremità libera del ramo, ma ruotata di 90°. Si forma un
**bivio**: due direzioni libere con numeri **diversi**:

- l’**estremità dritta** — il numero a cui la tessera è stata attaccata («5» nell’esempio); resta
  viva e il ramo mantiene la direzione;
- l’**estremità del bivio** — la metà libera della tessera attaccata («4» nell’esempio); questo ramo
  procede a 90° rispetto alla direzione dritta.

```
prima:   … ── [3|5] ──→ estremità «5»

dopo:    … ── [3|5] ──→ estremità dritta «5»
                   │
                  [5]
                  [4]
                   ↓
          estremità del bivio «4»
```

*Un bivio non consuma la vecchia estremità, ne **aggiunge** una nuova: il numero di estremità aperte
cresce di 1.*

**Disporre la tessera sul tavolo: bivio o curva forzata.** Fisicamente una tessera ruotata di 90° si
può accostare a un’estremità in due modi, e dall’edizione 1.1 significano cose diverse.

- **Modo 1 — allineata alla fila: un vero bivio.** La metà attaccata prosegue il ramo dritto e la
  metà libera sporge di lato. Questa è la mossa «ad angolo»: ora ci sono due estremità — dritta e
  del bivio — ed entrambe sono vive. Così dispone la tessera anche l’app.
- **Modo 2 — subito di lato: una curva forzata.** La tessera è attaccata all’estremità di lato; la
  sua metà attaccata non prosegue la fila ma le sta accanto. Secondo le regole è una mossa **«in
  linea»**: la vecchia estremità è sigillata, la nuova è la metà libera della tessera, e il numero
  di estremità aperte non cambia. Il ramo cambia soltanto direzione sul tavolo. Valgono tutte le
  regole della mossa in linea: la curva forzata è permessa anche su un’estremità fresca (§6.4), e la
  tessera successiva su quell’estremità è di nuovo libera — in linea, ad angolo o doppio di traverso.

Perché serve. Prima di tutto lo spazio: su un tavolo piccolo spesso non c’è più posto per allungare
un ramo, e senza la curva forzata bisognerebbe ridisporre l’intero ramo. Poi la leggibilità: una
tessera spostata di lato all’occhio si legge come una svolta della fila, non come un bivio; la
convenzione fissa soltanto ciò che l’occhio già vede.

![La tessera 6:1 ad angolo, allineata alla fila](img/turn-inline.jpg)

*Modo 1: la tessera 6:1 è allineata alla fila — la sua metà «6» prosegue il ramo dritto. Un bivio: l’estremità dritta «6» a destra e l’estremità del bivio «1» in basso.*

![La stessa tessera 6:1 messa subito di lato](img/turn-sideways.jpg)

*Modo 2: la stessa tessera 6:1 messa subito di lato — una curva forzata. Secondo le regole è come giocare 6:1 in linea: l’estremità «6» è sigillata e il ramo prosegue verso il basso con l’estremità «1».*

Entrambe le fotografie mostrano anche un’**estremità chiusa** in alto: il ramo verticale finisce
contro il doppio 1:1 posato di traverso (§7.1).

6.4. **La limitazione dell’estremità fresca.** La prima tessera attaccata a una delle due estremità
di un bivio — quella dritta o quella del bivio — va posata **in linea**. Non può né creare un altro
bivio né chiudere l’estremità con un doppio di traverso.

In altre parole: **un bivio subito dopo un bivio è vietato**, e **un’estremità appena formata non si
può nemmeno chiudere**.

La limitazione vale per ciascuna estremità separatamente e decade non appena una tessera è stata
attaccata a quell’estremità. Da lì in poi vi sono di nuovo disponibili sia il bivio sia la chiusura.

*Esempio.* Un bivio con estremità «5» (dritta) e «4» (del bivio). Non si può posare 4:1 ad angolo,
non si può posare 5:6 ad angolo, e non si può chiudere né «5» né «4» con un doppio. Si può posare,
per esempio, 5:6 in linea — dopo di che l’estremità cresciuta da «5» è di nuovo aperta a qualsiasi
mossa, mentre l’estremità «4» è ancora fresca.

6.5. Il bivio è disponibile in **qualsiasi** turno, tranne nel caso del §6.4.

6.6. **L’unica eccezione è la prima tessera dopo la radice.** Può essere posata ad angolo anche se
l’estremità della radice è anch’essa «fresca». È un diritto, non un obbligo.

## 7. Il doppio e la chiusura di un ramo

7.1. Il doppio è una tessera speciale. Si può posare in **due soli modi**:

- **in linea** — il doppio sta **lungo** il ramo, come una tessera normale; l’estremità resta aperta
  e conserva lo **stesso** numero:

```
… ── [3|5] ── [5|5] ──→ estremità «5»
```

- **di traverso** — il doppio si mette **perpendicolare alla direzione del ramo**; il ramo è
  **chiuso** e non si può più sviluppare:

```
                ┌───┐
                │ 5 │
… ── [3|5] ─────┤   │   ✕ ramo chiuso
                │ 5 │
                └───┘
```

Per un esempio reale di ramo chiuso, vedi le fotografie del §6.3: il ramo verticale in alto finisce
contro il doppio 1:1 posato di traverso.

7.2. **Un doppio non si può posare ad angolo.** Con un doppio non si crea un bivio.

7.3. Un’estremità può essere chiusa solo dal doppio **corrispondente** — quello il cui numero è
uguale al numero dell’estremità.

7.4. Un’estremità fresca non si può chiudere (§6.4). Un doppio posato come prima tessera su tale
estremità può stare solo **in linea**.

## 8. Pescare dal pozzo

8.1. Nel proprio turno un giocatore pesca **al massimo una tessera** dal pozzo — sia durante la
ricerca della radice sia nella fase principale.

8.2. Un giocatore pesca solo se non ha mosse legali (§4.1). Poi:
- la tessera pescata gli dà una mossa → deve giocarla, e il turno finisce;
- la tessera pescata non aiuta → la tiene, non posa nulla e passa il turno.

8.3. Se il pozzo è vuoto e non c’è alcuna mossa legale, il giocatore non fa nulla e passa.

## 9. Fine della mano

Una mano finisce per uno di due motivi.

9.1. **Blocco** — nessuno può posare una tessera: ogni estremità aperta è o chiusa (§7.1) o un
vicolo cieco (non resta alcuna tessera adatta né nelle mani né nel pozzo, perché tutte e 7 le tessere
con quel numero sono già sul tavolo). Un caso particolare è quello in cui tutte le estremità, nessuna
esclusa, sono chiuse.

9.2. **Chiusura** — un giocatore ha posato l’ultima tessera della sua mano e non ha più nulla.

9.3. In caso di blocco non si pesca dal pozzo — si contano subito i punti (§10).

## 10. Conteggio dei punti e vittoria nella partita

10.1. Alla fine della mano ogni giocatore conta la **somma dei punti delle tessere rimaste in
mano** — la somma dei numeri sulle due metà di ogni tessera. Il giocatore che ha chiuso (§9.2) ha
somma zero.

10.2. **Il doppio 0:0 ha un valore speciale.** Se lo 0:0 è l’**unica** tessera rimasta al giocatore,
vale **25 punti**. Se ha almeno un’altra tessera, lo 0:0 vale **0**, come al solito.

10.3. **Solo il giocatore con la somma strettamente minore non segna nulla.** Tutti gli altri
aggiungono la propria somma al proprio punteggio. In due significa:

- le somme sono diverse → chi ha quella maggiore la aggiunge al proprio punteggio, chi ha quella
  minore non riceve nulla;
- le somme sono **uguali** → aggiungono **entrambi** la propria.

10.4. **Il vincitore della mano** è il giocatore con la somma strettamente minore, cioè chi non ha
segnato nulla. A somme uguali la mano non ha vincitore. Il vincitore muove per primo nella mano
successiva (§2.5).

10.5. **Fine della partita.** Non appena dopo un conteggio almeno un giocatore raggiunge **100 punti
o più**, la partita finisce. **Perde il giocatore con il punteggio complessivo maggiore.** Se i
punteggi complessivi sono uguali (per esempio 103 e 103), la partita è **pari** e non ha vincitore.

## 11. Varianti di regole

11.1. **«Il doppio chiude soltanto.»** Un doppio non si può posare in linea — può solo chiudere un
ramo (di traverso). Ne segue automaticamente che un doppio non può essere la prima tessera su
un’estremità fresca: lì chiudere non è consentito (§6.4), e in questa variante il doppio non ha
altre opzioni.

**Questa è la versione originale delle regole** — così il gioco è stato concepito all’inizio. La
posa del doppio in linea è stata introdotta la sera stessa, durante le prime mani (§14).

La variante crea una **trappola**: il doppio smette di essere una tessera sicura, e l’avversario può
essere costretto a chiudere la mano nel momento peggiore. Esempio: la radice è 2:2 e il secondo
giocatore posa 2:1 in linea. Se il primo giocatore non ha altro che 1:1, deve giocare (§4.1), e
l’unico modo di farlo è di traverso — il che chiude l’unica estremità e tronca la mano, quanti che
siano i punti che ha ancora in mano.

La variante del §7.1 è attualmente considerata quella principale: un doppio può sia prolungare sia
chiudere. È più morbida e offre più decisioni, ma elimina la trappola — vale quindi la pena provarle
entrambe.

## 12. Rinviato

12.1. **Una modalità per 3+ giocatori.** Da riprendere una volta realizzato il gioco a due.
(28 tessere: tre giocatori con 7 ciascuno → un pozzo di 7; quattro giocatori con 7 ciascuno →
nessun pozzo.)

## 13. Note sull’equilibrio

*Non sono regole, ma conseguenze della meccanica — annotate per non doverle ricavare di nuovo.*

13.1. **Il bilancio delle estremità.** In linea → il numero di estremità non cambia; ad angolo → +1;
chiusura con un doppio di traverso → −1. Una mano inizia con una sola estremità (§6.2).

13.2. **Il gioco si può bloccare molto in fretta.** La mano più breve possibile: radice → una tessera
in linea → un doppio di traverso. Tre tessere sul tavolo ed entrambi i giocatori con la mano quasi
piena. È esattamente la vittoria rapida di chi ha la somma minore.

13.3. **La difesa contro una chiusura rapida è il bivio.** È sempre disponibile: qualsiasi tessera
non doppia adatta si può posare ad angolo, e il §6.4 impedisce all’avversario di chiudere subito
un’estremità fresca. Così il giocatore con la mano pesante allunga la mano con i bivi, e quello con
la mano leggera la strangola con le chiusure. Ci si contende direttamente la lunghezza della mano,
ed è questo il conflitto centrale del gioco. Nelle prime mani dal vivo la meccanica sembra
equilibrata; prove più ampie lo stabiliranno.

13.4. **Un tetto ai bivi.** Per riportare a 0 il numero di estremità serve una chiusura in più dei
bivi fatti. I doppi sono 7 e uno è andato alla radice → al massimo 6 chiusure → al massimo 5 bivi per
mano. Una volta fatti **6 o più bivi, bloccare il gioco chiudendo tutte le estremità diventa
impossibile** — la mano può finire solo con la chiusura di un giocatore o con estremità morte. Ogni
doppio posato in linea abbassa il tetto di un’altra unità.

13.5. **Un doppio posato in linea brucia la chiave per sempre.** Non ne esiste una seconda copia,
quindi da quel momento nessuna estremità con quel numero potrà più essere chiusa — solo esaurita.

13.6. **Due strade verso lo zero.** Chiudere (§9.2) garantisce somma 0, di sicuro strettamente
minore, quindi non costa mai un solo punto. Questo dà al giocatore due piani distinti: bloccare il
gioco con la mano più leggera, o svuotare del tutto la mano. Il bivio serve al secondo piano, la
chiusura al primo.

13.7. **Perché lo 0:0 vale 25 (§10.2).** Senza quella regola lo 0:0 sarebbe la tessera perfetta da
tenere: la si potrebbe conservare fino alla fine gratis, e un giocatore con solo lo 0:0 avrebbe somma
0 — quindi non pagherebbe nemmeno contro un avversario che ha chiuso (0 contro 0 è parità, e nessuno
dei due paga). La regola ribalta tutto: uno 0:0 rimasto da solo diventa la tessera più cara del set.

13.8. **La parità punisce entrambi.** A somme uguali pagano entrambi (§10.3), quindi l’unico posto
sicuro è una somma strettamente minore. Insieme al fatto che chi perde aggiunge l’**intera** somma e
non la differenza, questo rende il finale tagliente: 41 contro 40 significa che un solo punto ne
costa 41.

13.9. **Una partita breve va bene.** La tessera media del set vale 6 punti, quindi una mano piena di
7 fa circa 42. Un blocco rapido (§13.2) lascia quasi tutto in mano, cioè una sola mano del genere
consegna al perdente 40–50 punti in un colpo, e una partita a 100 si chiude in 2–3 mani. È accettato
così com’è: la lunghezza di una partita non è una costante ma il risultato della lotta. Il giocatore
in posizione peggiore ha ogni ragione di fare bivi e allungare la mano per liberarsi di più tessere,
e quanto bene ci riesce decide proprio se la partita sarà breve o lunga.

13.10. **Il diritto di muovere per primo: amplificatore o recupero?** La prima mossa va al vincitore
(§2.5). Se la posizione del primo giocatore è davvero la più debole, funziona come meccanismo di
recupero e tiene la partita in equilibrio. Se invece muovere per primo risulta un vantaggio, la
regola farà l’opposto e allargherà il distacco di chi è in testa. È questo che le statistiche
dovranno mostrare.

13.11. **Mani scoperte più obbligo di giocare significano informazione perfetta.** Le decisioni del
giocatore si riducono a quale tessera adatta giocare e come orientarla. L’unica casualità rimasta è
nel pozzo coperto (§3.5).

## 14. Come è nato il gioco

Ho fatto questo gioco per la mia amata moglie Olechka la sera del 31 luglio 2026.

Del domino normale mi infastidiva quanto dipendesse dal caso: troppo spesso l’esito lo decide non la
scelta del giocatore ma la tessera capitata. Eppure non volevo eliminare del tutto il caso — senza,
se ne va il brivido. Da qui la caratteristica distintiva di queste regole: le mani sono scoperte
come i pezzi negli scacchi, e l’unica fonte di casualità rimasta è il pozzo coperto (§3.5).

Ho abbozzato l’idea in fretta e ci siamo seduti a giocare subito. Abbiamo giocato tutta la sera. La
mia prima versione era più severa: un doppio si poteva posare solo di traverso, quindi chiudeva
sempre un ramo (§11.1). Olechka ha proposto di permettere di posarlo anche in linea — questo ha dato
al giocatore una scelta, e la regola è diventata quella principale (§7.1).

Il gioco ci è piaciuto, ed è per questo che ho scritto le regole.
