# Elisa & Davide · sito di nozze

Sito statico (HTML, CSS, JavaScript, nessuna dipendenza). Si pubblica su Vercel direttamente da `main`.

## Cosa si cambia e dove
| Cosa | Dove |
|---|---|
| Indirizzo del foglio Google per l'RSVP, link dell'agenzia, album foto, luoghi | `js/config.js` |
| Testi della pagina | `index.html` |
| Colori, font, misure | `css/style.css` (variabili in cima) |
| Mappa del viaggio (tappe) | `tools/build_mappa.mjs`, poi `node tools/build_mappa.mjs` |

## Da fare quando i dati sono pronti
1. **RSVP:** segui `apps-script/README.md`, poi incolla l'indirizzo in `rsvpEndpoint`.
2. **Luna di miele:** incolla il link dell'agenzia in `agenziaUrl`. Finché è vuoto il bottone resta spento.
3. **Album foto:** incolla il link in `albumUrl`. La sezione compare dal 28 maggio 2027 (anteprima con `?album`).
4. **Anteprima su WhatsApp:** `index.html` punta a `https://matrimonio-landing.vercel.app/assets/og.jpg`.
   Se cambi dominio, aggiorna `og:url` e `og:image` nell'`<head>`.
5. **Orari della festa:** nella sezione `#programma` di `index.html`.

## Prove in locale
```bash
python -m http.server 5173
```
Poi apri `http://127.0.0.1:5173/`. Con `?salta` nell'indirizzo l'apertura con il sigillo viene saltata.

## Note
- Il sito è `noindex`: non compare nei motori di ricerca.
- Le intolleranze sono dati sulla salute: il foglio Google deve restare privato.
- I materiali di lavoro (PDF, screenshot, `_estratti/`) sono esclusi da git.
