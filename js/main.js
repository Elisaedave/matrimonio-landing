/* Busta d'apertura, luoghi, calendario, rivelazioni, modulo RSVP. Nessuna dipendenza. */
(function () {
  "use strict";
  var C = window.CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- busta ---------- */
  var busta = $("#busta");
  var params = new URLSearchParams(location.search);

  // Tocchi il sigillo: i quattro lembi si aprono e scoprono il sito.
  function apri() {
    if (!document.body.classList.contains("chiuso")) return;
    document.body.classList.remove("chiuso");
    document.body.classList.add("aperto");
    busta.classList.add("apre");
    window.scrollTo(0, 0);
    setTimeout(function () { busta.classList.add("via"); }, 1400);
    setTimeout(function () { busta.setAttribute("hidden", ""); }, 3000);
  }
  $("#sigillo").addEventListener("click", apri);
  // Collegamenti diretti (#rsvp, ?salta) saltano l'apertura.
  if (location.hash.length > 1 || params.has("salta")) {
    busta.style.display = "none";
    document.body.classList.remove("chiuso");
    document.body.classList.add("aperto");
  }

  /* ---------- lettera: esce dalla busta in base allo scroll, rientra se torni su ---------- */
  var env = $("#env");
  var sezLettera = $("#lettera");
  var ridottoLettera = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function aggiornaLettera() {
    var r = sezLettera.getBoundingClientRect();
    var corsa = r.height - window.innerHeight;
    var p = ridottoLettera ? 1 : clamp(-r.top / (corsa > 0 ? corsa : 1));
    var ap = clamp(p / 0.32);                // 1° tempo: il lembo si apre
    var su = clamp((p - 0.22) / 0.62);       // 2° tempo: la lettera sale
    var cu = clamp((p - 0.82) / 0.14);       // alla fine compaiono i cuori
    env.style.setProperty("--ap", ap.toFixed(3));
    env.style.setProperty("--su", su.toFixed(3));
    env.style.setProperty("--cu", cu.toFixed(3));
    env.classList.toggle("oltre", ap > 0.5);
  }
  var inCoda = false;
  function programma() {
    if (inCoda) return;
    inCoda = true;
    function fai() { if (!inCoda) return; inCoda = false; aggiornaLettera(); }
    requestAnimationFrame(fai);
    setTimeout(fai, 80); // riserva se rAF è sospeso (scheda in secondo piano)
  }
  window.addEventListener("scroll", programma, { passive: true });
  window.addEventListener("resize", programma);
  aggiornaLettera();

  /* ---------- petali (festa) ---------- */
  var colori = ["#edcdc4", "#e3b5aa", "#f4dcd5", "#d6a69b"];
  window.petali = function (n) {
    var box = $("#petali");
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (var i = 0; i < (n || 36); i++) {
      var p = document.createElement("span");
      p.className = "petalo";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colori[i % colori.length];
      p.style.animationDuration = 3.2 + Math.random() * 2.8 + "s";
      p.style.animationDelay = Math.random() * 0.9 + "s";
      p.style.setProperty("--dx", (Math.random() - 0.5) * 160 + "px");
      p.style.setProperty("--r", 360 + Math.random() * 540 + "deg");
      box.appendChild(p);
      setTimeout(function (el) { el.remove(); }.bind(null, p), 7500);
    }
  };

  /* ---------- luoghi e mappe ---------- */
  function q(s) { return encodeURIComponent(s); }
  $$("[data-mappa]").forEach(function (a) {
    a.href = "https://www.google.com/maps/dir/?api=1&destination=" + q(C.luoghi[a.dataset.mappa].ricerca);
  });
  $$("[data-mappa-apple]").forEach(function (a) {
    a.href = "https://maps.apple.com/?daddr=" + q(C.luoghi[a.dataset.mappaApple].ricerca);
  });

  /* ---------- calendario (cerimonia 28/05/2027 11:00, ora italiana) ---------- */
  var titolo = "Matrimonio di Elisa e Davide";
  var luogo = C.luoghi.chiesa.nome + ", " + C.luoghi.chiesa.indirizzo;
  var dettagli = "Cerimonia alle 11:00. Seguirà il ricevimento a " + C.luoghi.villa.nome + ", " + C.luoghi.villa.indirizzo + ".";
  $("#cal-google").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + q(titolo) +
    "&dates=20270528T110000/20270528T123000&ctz=Europe/Rome&location=" + q(luogo) + "&details=" + q(dettagli);

  var ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Elisa e Davide//Matrimonio//IT", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:matrimonio-elisa-davide-20270528@invito",
    "DTSTAMP:20261102T000000Z",
    "DTSTART;TZID=Europe/Rome:20270528T110000",
    "DTEND;TZID=Europe/Rome:20270528T123000",
    "SUMMARY:" + titolo,
    "LOCATION:" + luogo.replace(/,/g, "\\,"),
    "DESCRIPTION:" + dettagli.replace(/,/g, "\\,"),
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  $("#cal-ics").href = "data:text/calendar;charset=utf-8," + q(ics);

  /* ---------- viaggio: agenzia ---------- */
  var ag = $("#bottone-agenzia");
  if (C.agenziaUrl) {
    ag.href = C.agenziaUrl;
  } else {
    ag.setAttribute("aria-disabled", "true");
    ag.removeAttribute("href");
    $("#nota-agenzia").hidden = false;
  }

  /* ---------- album (dopo il matrimonio) ---------- */
  var oggi = new Date();
  var apriAlbum = params.has("album") || (C.albumUrl && oggi >= new Date(C.dataAlbum + "T00:00:00"));
  if (apriAlbum) {
    $("#album").hidden = false;
    if (C.albumUrl) $("#bottone-album").href = C.albumUrl;
    else $("#bottone-album").setAttribute("aria-disabled", "true");
  }

  /* ---------- rivelazioni allo scorrimento ---------- */
  var daRivelare = $$(".carta--larga, .titolo, .sottotitolo, .tempo, .regalo, .striscia, .chiusura > *");
  daRivelare.forEach(function (el) { el.classList.add("rivela"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add("visibile"); io.unobserve(v.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    daRivelare.forEach(function (el) { io.observe(el); });
  } else {
    daRivelare.forEach(function (el) { el.classList.add("visibile"); });
  }

  /* ---------- modulo RSVP ---------- */
  var form = $("#modulo");
  var dettagliBox = $("#dettagli");
  var campoOspiti = $("#campo-ospiti");
  var esito = $("#esito");
  var invia = $("#invia");

  if (!C.rsvpEndpoint) $("#prova").hidden = false;

  $$('input[name="presenza"]').forEach(function (r) {
    r.addEventListener("change", function () {
      dettagliBox.hidden = form.presenza.value !== "si";
    });
  });
  $("#persone").addEventListener("change", function () {
    campoOspiti.hidden = parseInt(this.value, 10) < 2;
  });

  function messaggio(testo, tipo) {
    esito.textContent = testo;
    esito.className = "modulo__esito " + (tipo || "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    messaggio("");
    var nome = form.nome.value.trim();
    var presenza = form.presenza.value;
    $(".campo", form).classList.toggle("errore", !nome);
    if (!nome) { messaggio("Scrivi il tuo nome e cognome.", "ko"); form.nome.focus(); return; }
    if (!presenza) { messaggio("Dicci se ci sarai.", "ko"); return; }
    if (form.sito_web.value) return; // trappola anti-bot

    var si = presenza === "si";
    var dati = {
      nome: nome,
      presenza: si ? "Sì" : "No",
      persone: si ? form.persone.value : "0",
      ospiti: si && parseInt(form.persone.value, 10) > 1 ? form.ospiti.value.trim() : "",
      intolleranze: si ? form.intolleranze.value.trim() : "",
      canzone: si ? form.canzone.value.trim() : "",
    };

    if (!C.rsvpEndpoint) {
      console.info("[RSVP in prova] risposta non inviata:", dati);
      messaggio("Prova riuscita: la risposta non è stata salvata perché il foglio non è ancora collegato.", "ko");
      return;
    }

    invia.disabled = true;
    messaggio("Invio in corso…");
    fetch(C.rsvpEndpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dati),
    }).then(function () {
      form.reset();
      dettagliBox.hidden = true;
      campoOspiti.hidden = true;
      messaggio(si ? "Grazie! Ti aspettiamo il 28 maggio." : "Ci mancherai. Grazie di avercelo detto.", "ok");
      if (si) window.petali(40);
      setTimeout(function () { invia.disabled = false; }, 4000); // per chi risponde anche per un altro invitato
    }).catch(function () {
      invia.disabled = false;
      messaggio("Non siamo riusciti a inviare la risposta. Riprova tra poco.", "ko");
    });
  });
})();
