/**
 * Riceve le risposte del modulo RSVP e le scrive nel foglio Google.
 * Va incollato in Estensioni > Apps Script dal foglio stesso (script "collegato").
 * Istruzioni passo per passo: apps-script/README.md
 */
var NOME_FOGLIO = "Risposte";
var INTESTAZIONI = ["Data invio", "Nome e cognome", "Presenza", "Persone", "Altri ospiti", "Intolleranze o allergie", "Canzone per ballare"];

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
    foglio.appendRow([
      Utilities.formatDate(new Date(), "Europe/Rome", "yyyy-MM-dd HH:mm:ss"),
      testo(d.nome),
      testo(d.presenza),
      testo(d.persone),
      testo(d.ospiti),
      testo(d.intolleranze),
      testo(d.canzone),
    ]);
    return risposta({ ok: true });
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
