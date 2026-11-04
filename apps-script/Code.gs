/**
 * Riceve le risposte del modulo RSVP e le scrive nel foglio Google: UNA RIGA PER PERSONA.
 * Va incollato in Estensioni > Apps Script dal foglio stesso (script "collegato").
 * Istruzioni passo per passo: apps-script/README.md
 */
var NOME_FOGLIO = "Risposte";
var INTESTAZIONI = [
  "Data invio", "Chi ha risposto", "Nome", "Cognome", "Presenza",
  "Allergie e intolleranze", "Canzone per ballare", "Gruppo"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var foglio = ss.getSheetByName(NOME_FOGLIO) || ss.insertSheet(NOME_FOGLIO);
    if (foglio.getLastRow() === 0) {
      foglio.appendRow(INTESTAZIONI);
      foglio.getRange(1, 1, 1, INTESTAZIONI.length).setFontWeight("bold");
      foglio.setFrozenRows(1);
    }
    var quando = Utilities.formatDate(new Date(), "Europe/Rome", "yyyy-MM-dd HH:mm:ss");
    var persone = (d.persone || []).slice(0, 12); // massimo ragionevole per un invio
    var righe = persone.map(function (p, i) {
      return [
        quando,
        testo(d.chiHaRisposto),
        testo(p.nome),
        testo(p.cognome),
        testo(d.presenza),
        testo(p.allergie),
        i === 0 ? testo(d.canzone) : "", // la canzone una volta sola per gruppo
        testo(d.gruppo),
      ];
    });
    if (righe.length) {
      foglio.getRange(foglio.getLastRow() + 1, 1, righe.length, INTESTAZIONI.length).setValues(righe);
    }
    return risposta({ ok: true, righe: righe.length });
  } catch (err) {
    return risposta({ ok: false, errore: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return risposta({ ok: true, servizio: "RSVP Elisa e Davide" });
}

// Toglie caratteri che Fogli interpreterebbe come formula (=, +, -, @) all'inizio.
function testo(v) {
  var s = String(v == null ? "" : v).slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function risposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
