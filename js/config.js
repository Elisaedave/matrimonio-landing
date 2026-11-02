// Indirizzi e interruttori del sito: si cambiano solo qui.
window.CONFIG = {
  // Indirizzo del web app di Apps Script che scrive sul foglio Google (vedi apps-script/README.md).
  rsvpEndpoint: "",
  // Pagina dell'agenzia viaggi per la luna di miele. Vuoto = bottone ancora spento.
  agenziaUrl: "",
  // Album condiviso per le foto degli ospiti (Google Foto, Drive...). Vuoto = sezione nascosta.
  albumUrl: "",
  // L'album compare dal giorno delle nozze (anteprima: aggiungere ?album all'indirizzo).
  dataAlbum: "2027-05-28",

  luoghi: {
    chiesa: {
      nome: "Chiesa di Santa Maria Assunta",
      indirizzo: "Via Nobili Calvi, 2, Montesolaro (CO)",
      ricerca: "Chiesa di Santa Maria Assunta, Via Nobili Calvi 2, Montesolaro CO",
    },
    villa: {
      nome: "Villa Mattioli",
      indirizzo: "Via Rapazzini, 2, 20855 Lesmo (MB)",
      ricerca: "Villa Mattioli, Via Rapazzini 2, 20855 Lesmo MB",
    },
  },
};
