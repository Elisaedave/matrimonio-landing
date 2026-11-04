# Collegare il modulo RSVP al foglio Google

Una volta sola, circa 5 minuti. Le risposte arrivano nel foglio, in una scheda chiamata "Risposte": **una riga per persona**.
Una famiglia con tre persone produce tre righe con lo stesso valore nella colonna "Gruppo" (e lo stesso "Chi ha risposto").

1. Apri il foglio Google dove vuoi ricevere le risposte.
2. Menu **Estensioni → Apps Script**.
3. Cancella il codice di esempio e incolla tutto il contenuto di `Code.gs`. Salva.
4. **Distribuisci → Nuova distribuzione → tipo: App web**.
   - Esegui come: **Me**
   - Chi ha accesso: **Chiunque**
5. Autorizza l'accesso quando Google lo chiede (è il tuo script sul tuo foglio).
6. Copia l'**URL dell'app web** (finisce con `/exec`).
7. Incollalo in `js/config.js`, nel campo `rsvpEndpoint`. Pubblica di nuovo il sito.
8. Prova il modulo dal sito pubblicato: deve comparire una riga nella scheda "Risposte".

Se modifichi `Code.gs` in futuro: **Distribuisci → Gestisci distribuzioni → modifica → Nuova versione**, altrimenti il sito continua a usare il codice vecchio.

## Privacy

- Le intolleranze sono dati sulla salute. Il foglio deve restare privato: condividilo solo con Elisa e Davide.
- Il sito non mostra mai le risposte a nessuno e non le salva altrove.
