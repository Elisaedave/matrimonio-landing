/* Mappa del viaggio di nozze: l'aereo disegna la rotta tappa dopo tappa.
   Usa i dati precalcolati in js/map-data.js (tools/build_mappa.mjs). */
(function () {
  "use strict";
  var M = window.MAPPA;
  if (!M) return;

  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("mappa-svg");
  var contenitore = document.getElementById("mappa");
  var scorrevole = document.getElementById("mappa-scroll");
  var tela = document.getElementById("mappa-tela");
  var ETICHETTE = { Milano: "sx", Singapore: "giu", Christchurch: "giu", Auckland: "dx", "Bora Bora": "su", Sydney: "sx" };
  var seguire = true; // la mappa scorre da sola dietro l'aereo, finché l'utente non la tocca
  var badge = document.getElementById("mappa-badge");
  var lista = document.getElementById("tappe");
  var rivedi = document.getElementById("rivedi");

  function el(nome, attr, padre) {
    var n = document.createElementNS(NS, nome);
    for (var k in attr) n.setAttribute(k, attr[k]);
    (padre || svg).appendChild(n);
    return n;
  }

  /* ---- sfondo ---- */
  el("path", { d: M.sphere, class: "m-sfera" });
  el("path", { d: M.reticolo, class: "m-reticolo" });
  el("path", { d: M.terre, class: "m-terre" });

  /* ---- rotta tratteggiata (intera) + tratti percorsi (si riempiono in volo) ---- */
  var rotte = M.tratte.map(function (d) { return el("path", { d: d, class: "m-rotta" }); });
  var volati = M.tratte.map(function (d) {
    var p = el("path", { d: d, class: "m-volato" });
    var L = p.getTotalLength();
    p.style.strokeDasharray = L;
    p.style.strokeDashoffset = L;
    p._L = L;
    return p;
  });

  /* ---- aereo (punta verso +x) ---- */
  var aereo = el("g", { class: "m-aereo" });
  el("path", {
    d: "M14 0 L5 -2.2 L-1 -12 L-4.6 -12 L-1.8 -2.4 L-9 -2.4 L-11.5 -5.6 L-14 -5.6 L-12 0 L-14 5.6 L-11.5 5.6 L-9 2.4 L-1.8 2.4 L-4.6 12 L-1 12 L5 2.2 Z",
  }, aereo);

  function scalaAereo() {
    var s = svg.getBoundingClientRect().width / M.w || 1;
    var px = Math.max(26, Math.min(40, s * 46));
    aereo._k = px / s / 28;
  }

  /* ---- punti e legenda ---- */
  // ordine visivo: tappe uniche numerate 1..6, il ritorno a Milano è il cuore
  var punti = M.citta.map(function (c, i) {
    var ritorno = i === M.citta.length - 1;
    var d = document.createElement("div");
    d.className = "punto" + (ritorno ? " cuore" : "");
    d.style.left = (c.x / M.w) * 100 + "%";
    d.style.top = (c.y / M.h) * 100 + "%";
    // dove sta l'etichetta rispetto al punto, per non sovrapporre le tappe vicine
    d.dataset.lab = ETICHETTE[c.nome] || "su";
    if (ritorno) d.style.transform = "translate(13px, -13px)"; // il cuore del ritorno non copre il "1" di Milano
    d.dataset.base = d.style.transform;
    d.innerHTML = (ritorno ? "♥" : i + 1) + '<span class="punto__nome">' + c.nome + "</span>";
    badge.appendChild(d);
    return d;
  });

  var voci = M.citta.map(function (c, i) {
    var ritorno = i === M.citta.length - 1;
    var li = document.createElement("li");
    li.innerHTML =
      '<span class="n">' + (ritorno ? "♥" : i + 1) + "</span><span><strong>" +
      (ritorno ? "Ritorno a " + c.nome : c.nome) + "</strong><small>" + (ritorno ? "A casa, sposi" : c.paese) + "</small></span>";
    lista.appendChild(li);
    return li;
  });

  /* ---- animazione ---- */
  var corsa = 0; // identifica la corsa in corso, così "Rivedi" annulla la precedente

  function reset() {
    corsa++;
    volati.forEach(function (p) { p.style.strokeDashoffset = p._L; });
    punti.forEach(function (p) { p.classList.remove("raggiunto"); p.style.transform = p.dataset.base; });
    voci.forEach(function (v) { v.classList.remove("raggiunta"); });
    aereo.classList.remove("attivo");
  }

  function mostraTutto() {
    corsa++;
    volati.forEach(function (p) { p.style.strokeDashoffset = 0; });
    punti.forEach(function (p) { p.classList.add("raggiunto"); });
    voci.forEach(function (v) { v.classList.add("raggiunta"); });
    aereo.classList.remove("attivo");
  }

  function raggiungi(i) {
    punti[i].classList.add("raggiunto");
    voci[i].classList.add("raggiunta");
  }

  function attesa(ms, id) {
    return new Promise(function (ok) { setTimeout(function () { ok(id === corsa); }, ms); });
  }

  // Sul telefono la mappa è più larga dello schermo: scorre per tenere l'aereo al centro.
  function segui(x) {
    var extra = scorrevole.scrollWidth - scorrevole.clientWidth;
    if (!seguire || extra <= 2) return;
    var bersaglio = (x / M.w) * tela.clientWidth - scorrevole.clientWidth / 2;
    bersaglio = Math.max(0, Math.min(extra, bersaglio));
    scorrevole.scrollLeft += (bersaglio - scorrevole.scrollLeft) * 0.12;
  }
  var ripresa = 0;
  ["touchstart", "wheel", "pointerdown"].forEach(function (ev) {
    scorrevole.addEventListener(ev, function () {
      seguire = false;
      clearTimeout(ripresa);
      ripresa = setTimeout(function () { seguire = true; }, 2500);
    }, { passive: true });
  });

  // requestAnimationFrame, con un timer di riserva se il browser lo sospende (scheda in secondo piano).
  function tick(fn) {
    var fatto = false;
    function vai() { if (!fatto) { fatto = true; fn(performance.now()); } }
    requestAnimationFrame(vai);
    setTimeout(vai, 60);
  }

  function volo(i, id) {
    return new Promise(function (ok) {
      var p = volati[i];
      var L = p._L;
      var durata = Math.max(1100, Math.min(2600, L * 4.6));
      var x = 0;
      var ultimo = null;
      function passo(t) {
        if (id !== corsa) return ok(false);
        var dt = ultimo === null ? 0 : Math.min(t - ultimo, 100); // un tick lungo non fa saltare l'aereo
        ultimo = t;
        if (inVista) x = Math.min(x + dt / durata, 1);
        var e = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; // ease in-out
        var l = e * L;
        var a = p.getPointAtLength(l);
        var b = p.getPointAtLength(Math.min(l + 1.5, L));
        var ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        aereo.setAttribute("transform", "translate(" + a.x + " " + a.y + ") rotate(" + ang + ") scale(" + aereo._k + ")");
        p.style.strokeDashoffset = L - l;
        segui(a.x);
        if (x < 1) tick(passo); else ok(true);
      }
      tick(passo);
    });
  }

  async function parti() {
    scalaAereo();
    reset();
    seguire = true;
    scorrevole.scrollLeft = 0;
    var id = corsa;
    aereo.classList.add("attivo");
    var p0 = volati[0].getPointAtLength(0);
    aereo.setAttribute("transform", "translate(" + p0.x + " " + p0.y + ") scale(" + aereo._k + ")");
    raggiungi(0);
    if (!(await attesa(600, id))) return;
    for (var i = 0; i < volati.length; i++) {
      if (!(await volo(i, id))) return;
      raggiungi(i + 1);
      if (!(await attesa(i === volati.length - 1 ? 200 : 450, id))) return;
    }
    aereo.classList.remove("attivo");
  }

  rivedi.addEventListener("click", parti);
  window.addEventListener("resize", scalaAereo);
  scalaAereo();

  // Parte da sola quando la mappa entra nello schermo, e si ferma se esce.
  var inVista = true;
  if ("IntersectionObserver" in window) {
    var partito = false;
    new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        inVista = v.intersectionRatio > 0.15;
        var grande = v.isIntersecting && v.intersectionRect.height >= window.innerHeight * 0.8; // mappa più alta dello schermo
        if (!partito && (v.intersectionRatio >= 0.45 || grande)) { partito = true; parti(); }
      });
    }, { threshold: [0, 0.15, 0.45, 0.8] }).observe(contenitore);
  } else {
    mostraTutto();
  }
})();
