/* "Gratta e scopri la data": tre pannelli da grattare col dito o col mouse. Nessuna dipendenza. */
(function () {
  "use strict";
  var sezione = document.getElementById("data");
  var celle = Array.prototype.slice.call(document.querySelectorAll(".gratta__cella"));
  if (!sezione || !celle.length) return;

  var dopo = document.getElementById("data-dopo");
  var scoperte = 0;

  function stella(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  }

  // Foglio rosa perlato con righe e piccole stelle.
  function disegna(canvas) {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = ctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, "#f1d9d2");
    g.addColorStop(0.45, "#e2bcb2");
    g.addColorStop(1, "#d9aca1");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, r.width, r.height);
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1.2;
    for (var i = -r.height; i < r.width; i += 9) {
      ctx.beginPath();
      ctx.moveTo(i, r.height);
      ctx.lineTo(i + r.height, 0);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,.55)";
    [[.2, .25, 5], [.72, .18, 4], [.5, .55, 6], [.25, .82, 4], [.8, .75, 5]].forEach(function (s) {
      stella(ctx, s[0] * r.width, s[1] * r.height, s[2]);
    });
    ctx.globalCompositeOperation = "source-over";
    return ctx;
  }

  function percentualeGrattata(canvas, ctx) {
    var w = canvas.width, h = canvas.height;
    var dati = ctx.getImageData(0, 0, w, h).data;
    var vuoti = 0, totali = 0;
    for (var y = 0; y < h; y += 4) {
      for (var x = 0; x < w; x += 4) {
        totali++;
        if (dati[(y * w + x) * 4 + 3] < 40) vuoti++;
      }
    }
    return vuoti / totali;
  }

  function finale() {
    sezione.classList.add("finita");
    dopo.hidden = false;
    if (window.petali) window.petali(44);
  }

  function scopri(cella, canvas) {
    if (cella._scoperta) return;
    cella._scoperta = true;
    canvas.classList.add("via");
    scoperte++;
    if (scoperte === celle.length) finale();
  }

  celle.forEach(function (cella) {
    var canvas = cella.querySelector("canvas");
    var ctx = disegna(canvas);
    var giu = false, ux = 0, uy = 0;

    function punto(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fill();
      ux = x; uy = y;
    }

    canvas.addEventListener("pointerdown", function (e) {
      giu = true;
      cella._toccata = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* puntatore già rilasciato: si prosegue senza */ }
      var r = canvas.getBoundingClientRect();
      ux = e.clientX - r.left; uy = e.clientY - r.top;
      punto(e);
      e.preventDefault();
    });
    canvas.addEventListener("pointermove", function (e) { if (giu) punto(e); });
    function fine() {
      if (!giu) return;
      giu = false;
      if (percentualeGrattata(canvas, ctx) > 0.45) scopri(cella, canvas);
    }
    canvas.addEventListener("pointerup", fine);
    canvas.addEventListener("pointercancel", fine);

    cella._scopri = function () { scopri(cella, canvas); };

    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        if (!cella._toccata && !cella._scoperta) ctx = disegna(canvas);
      }).observe(canvas);
    }
  });

  document.getElementById("mostra-data").addEventListener("click", function () {
    celle.forEach(function (c) { c._scopri(); });
  });

})();
