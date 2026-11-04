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

  /* ---------- modulo RSVP: una scheda per persona ---------- */
  var MAX_ALTRI = 9;
  var form = $("#modulo");
  var dettagliBox = $("#dettagli");
  var altri = $("#altri");
  var aggiungi = $("#aggiungi");
  var esito = $("#esito");
  var invia = $("#invia");

  if (!C.rsvpEndpoint) $("#prova").hidden = false;

  function nuovoBloccoAllergie() { return document.importNode($("#tpl-allergie").content, true); }

  // Scheda "Per te": solo le allergie (nome e cognome sono già in cima).
  $("#persona-io .allergie-posto").appendChild(nuovoBloccoAllergie());

  function rinumera() {
    $$(".persona:not(.persona--io)", altri).forEach(function (card, i) {
      $(".persona__titolo", card).textContent = "Persona " + (i + 2);
    });
    aggiungi.disabled = $$(".persona", altri).length >= MAX_ALTRI;
  }

  aggiungi.addEventListener("click", function () {
    var card = document.importNode($("#tpl-persona").content, true).firstElementChild;
    $(".allergie-posto", card).appendChild(nuovoBloccoAllergie());
    card.classList.add("nuova");
    $(".persona__togli", card).addEventListener("click", function () { card.remove(); rinumera(); });
    altri.appendChild(card);
    rinumera();
    $(".p-nome", card).focus({ preventScroll: false });
  });

  $$('input[name="presenza"]').forEach(function (r) {
    r.addEventListener("change", function () {
      dettagliBox.hidden = form.presenza.value === "no"; // i dettagli si vedono finché non rispondi di no
    });
  });

  // Scelte rapide + testo libero in un'unica cella del foglio.
  function allergie(radice) {
    var scelte = $$('input[name="allergeni"]:checked', radice).map(function (i) { return i.value; });
    var altro = $(".altro", radice).value.trim();
    return scelte.concat(altro ? [altro] : []).join(" · ");
  }

  function messaggio(testo, tipo) {
    esito.textContent = testo;
    esito.className = "modulo__esito " + (tipo || "");
  }

  function pulisciErrori() {
    $$(".errore", form).forEach(function (e) { e.classList.remove("errore"); });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    messaggio("");
    pulisciErrori();
    var nome = form.nome.value.trim();
    var cognome = form.cognome.value.trim();
    var presenza = form.presenza.value;

    if (!nome || !cognome) {
      if (!nome) form.nome.classList.add("errore");
      if (!cognome) form.cognome.classList.add("errore");
      messaggio("Scrivi il tuo nome e il tuo cognome.", "ko");
      (nome ? form.cognome : form.nome).focus();
      return;
    }
    if (!presenza) { messaggio("Dicci se ci sarai.", "ko"); return; }
    if (form.sito_web.value) return; // trappola anti-bot

    var si = presenza === "si";
    var persone = [{ nome: nome, cognome: cognome, allergie: si ? allergie($("#persona-io")) : "" }];

    if (si) {
      var mancano = false;
      $$(".persona", altri).forEach(function (card) {
        var n = $(".p-nome", card), c = $(".p-cognome", card);
        var vuota = !n.value.trim() && !c.value.trim() && !allergie(card);
        if (vuota) { card.remove(); return; } // scheda aperta per sbaglio e lasciata vuota
        [n, c].forEach(function (campo) {
          campo.classList.toggle("errore", !campo.value.trim());
          if (!campo.value.trim()) mancano = true;
        });
        persone.push({ nome: n.value.trim(), cognome: c.value.trim(), allergie: allergie(card) });
      });
      rinumera();
      if (mancano) {
        messaggio("Per ogni persona che aggiungi servono nome e cognome.", "ko");
        var primo = $(".errore", form); if (primo) primo.focus();
        return;
      }
    }

    var dati = {
      gruppo: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      chiHaRisposto: nome + " " + cognome,
      presenza: si ? "Sì" : "No",
      persone: persone,
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
      var quanti = persone.length;
      form.reset();
      altri.innerHTML = "";
      rinumera();
      $$('input[name="allergeni"]', form).forEach(function (i) { i.checked = false; });
      dettagliBox.hidden = false;
      messaggio(si ? (quanti > 1 ? "Grazie! Vi aspettiamo il 28 maggio." : "Grazie! Ti aspettiamo il 28 maggio.") : "Ci mancherai. Grazie di avercelo detto.", "ok");
      if (si) window.petali(40);
      setTimeout(function () { invia.disabled = false; }, 4000); // per chi risponde anche per un altro gruppo
    }).catch(function () {
      invia.disabled = false;
      messaggio("Non siamo riusciti a inviare la risposta. Riprova tra poco.", "ko");
    });
  });
})();
