/* Urban Nest Estates: motion layer.
   Self-initialising, re-runnable, and fully disabled under prefers-reduced-motion. */
(function () {
  "use strict";

  var MARK = '<svg viewBox="0 0 100 54" aria-hidden="true"><path d="M4 30 L20 14 L36 30 M8 30 V50 H32 V30 M17 38 h6 v12 h-6 z M34 30 L50 14 L66 30 M38 30 V50 H62 V30 M47 38 h6 v12 h-6 z M64 30 L80 14 L96 30 M68 30 V50 H92 V30 M77 38 h6 v12 h-6 z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>';

  var reduce = function () {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
  var fine = function () {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth > 980;
  };
  var raf = window.requestAnimationFrame.bind(window);

  /* ------------------------------------------------ page transition curtain */
  function transition() {
    if (document.querySelector(".transition")) return;
    var el = document.createElement("div");
    el.className = "transition";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = "<span></span><span></span><span></span><span></span><span></span>" +
                   '<div class="t-mark">' + MARK + "</div>";
    document.body.appendChild(el);

    if (!reduce()) {
      document.body.classList.add("t-enter");
      setTimeout(function () { document.body.classList.remove("t-enter"); }, 1100);
    }

    document.addEventListener("click", function (e) {
      if (reduce()) return;
      var a = e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || a.target === "_blank") return;
      if (/^(https?:|mailto:|tel:|data:)/i.test(href)) return;
      if (a.hasAttribute("download") || href.indexOf(".pdf") > -1) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (window.__unePreview) return;              // the preview navigates in place
      e.preventDefault();
      document.body.classList.add("t-leave");
      setTimeout(function () { window.location.href = href; }, 620);
    });

    // returning via the back button should never leave the curtain down
    window.addEventListener("pageshow", function () { document.body.classList.remove("t-leave"); });
  }

  /* ------------------------------------------------------------ cursor */
  /* Gold-outlined arrow pointer is applied via CSS (see .styles cursor rules).
     The old floating circle ring has been removed per request. */
  function cursor() { return; }

  /* --------------------------------------------------- scroll progress rail */
  function rail() {
    if (reduce() || document.querySelector(".scroll-rail")) return;
    var el = document.createElement("div");
    el.className = "scroll-rail";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="rail-fill"></div><div class="rail-mark">' + MARK + "</div>";
    document.body.appendChild(el);
    var fill = el.querySelector(".rail-fill"), mark = el.querySelector(".rail-mark"), ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      fill.style.width = (p * 100) + "%";
      mark.style.left = (p * 100) + "%";
      mark.style.opacity = p > 0.01 ? "1" : "0";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------- split text reveal */
  function splitWords(node) {
    var out = [];
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var parts = child.textContent.split(/(\s+)/);
        parts.forEach(function (part) {
          if (!part.trim()) { out.push(document.createTextNode(part)); return; }
          var wrap = document.createElement("span");
          wrap.className = "split-line";
          var inner = document.createElement("i");
          inner.textContent = part;
          wrap.appendChild(inner);
          out.push(wrap);
        });
      } else if (child.nodeType === 1) {
        var clone = child.cloneNode(false);
        splitWords(child).forEach(function (n) { clone.appendChild(n); });
        out.push(clone);
      }
    });
    return out;
  }

  function splitText() {
    if (reduce()) return;
    var sel = ".hero .display, .page-hero h1, .section-head .h2, .cta h2, .editorial-text .h2, .measure > .h2";
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      var nodes = splitWords(el);
      el.innerHTML = "";
      nodes.forEach(function (n) { el.appendChild(n); });
      var i = 0;
      el.querySelectorAll(".split-line > i").forEach(function (w) {
        w.style.animationDelay = (i * 0.045) + "s"; i++;
      });
      el.classList.add("text-split");
      if (el.closest(".hero, .page-hero")) {
        setTimeout(function () { el.classList.add("in"); }, reduce() ? 0 : 620);
      } else if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
          });
        }, { threshold: 0.25 });
        io.observe(el);
      } else {
        el.classList.add("in");
      }
    });
  }

  /* ------------------------------------------------------------- parallax */
  function parallax() {
    if (reduce() || !("IntersectionObserver" in window)) return;
    var figs = [];
    document.querySelectorAll(".figure.r-16x9, .figure.r-3x2").forEach(function (f) {
      if (f.closest(".cover") || f.dataset.px) return;
      f.dataset.px = "1";
      f.classList.add("px");
      figs.push(f);
    });
    if (!figs.length) return;
    var active = [], ticking = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = active.indexOf(e.target);
        if (e.isIntersecting && i === -1) active.push(e.target);
        if (!e.isIntersecting && i > -1) active.splice(i, 1);
      });
    }, { rootMargin: "80px 0px" });
    figs.forEach(function (f) { io.observe(f); });

    function update() {
      var vh = window.innerHeight;
      active.forEach(function (f) {
        var r = f.getBoundingClientRect();
        var p = (r.top + r.height / 2 - vh / 2) / vh;   // -1 .. 1
        var img = f.querySelector("img");
        if (img) img.style.transform = "scale(1.14) translate3d(0," + (p * -3.4).toFixed(2) + "%,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------- odometer */
  function odometer() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    els.forEach(function (el) {
      if (el.dataset.odo) return;
      el.dataset.odo = "1";
      var value = String(parseInt(el.getAttribute("data-count"), 10));
      if (reduce() || !("IntersectionObserver" in window)) { el.textContent = value; return; }
      var wrap = document.createElement("span");
      wrap.className = "odo";
      value.split("").forEach(function (d) {
        var col = document.createElement("span");
        col.className = "odo-col";
        var strip = document.createElement("span");
        strip.className = "odo-strip";
        for (var n = 0; n <= 9; n++) {
          var s = document.createElement("span");
          s.textContent = String(n);
          strip.appendChild(s);
        }
        col.appendChild(strip);
        col.dataset.target = d;
        wrap.appendChild(col);
      });
      el.textContent = "";
      el.appendChild(wrap);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          wrap.querySelectorAll(".odo-col").forEach(function (col, i) {
            var strip = col.querySelector(".odo-strip");
            setTimeout(function () {
              strip.style.transform = "translateY(-" + (parseInt(col.dataset.target, 10) * 10) + "%)";
            }, i * 90);
          });
          io.unobserve(e.target);
        });
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* -------------------------------------------------------------- marquee */
  function marquee() {
    var host = document.querySelector("[data-marquee]");
    if (!host || host.dataset.done) return;
    host.dataset.done = "1";
    var items = Array.prototype.map.call(host.querySelectorAll("span"), function (s) {
      return s.textContent.trim();
    }).filter(Boolean);
    if (!items.length) return;
    var run = items.map(function (t) { return "<span>" + t + "</span>"; }).join("");
    host.classList.add("marquee");
    host.innerHTML = '<div class="marquee-track">' + run + run + "</div>";
  }

  /* ------------------------------------------------- magnetic + radial fill */
  function labelButtons() {
    // The radial hover fill is a pseudo element, which paints over bare text
    // nodes. Wrapping the label lets it sit above the fill.
    document.querySelectorAll(".btn").forEach(function (btn) {
      if (btn.dataset.lab) return;
      btn.dataset.lab = "1";
      Array.prototype.slice.call(btn.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var span = document.createElement("span");
          span.className = "btn-t";
          span.textContent = n.textContent;
          btn.replaceChild(span, n);
        }
      });
    });
  }

  function magnetic() {
    if (!fine() || reduce()) return;
    document.querySelectorAll(".btn").forEach(function (btn) {
      if (btn.dataset.mag) return;
      btn.dataset.mag = "1";
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.28).toFixed(1) + "px)";
        btn.style.setProperty("--mx", (e.clientX - r.left) + "px");
        btn.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* --------------------------------------------------------- cover framing */
  function coverFrames() {
    document.querySelectorAll(".cover").forEach(function (c) {
      if (c.querySelector(".cover-frame")) return;
      var f = document.createElement("span");
      f.className = "cover-frame";
      f.setAttribute("aria-hidden", "true");
      f.innerHTML = '<span class="t"></span><span class="r"></span><span class="b"></span><span class="l"></span>';
      c.appendChild(f);
    });
  }

  /* ------------------------------------------------------------ safety net
     Observers can be outrun by fast scrolling or restored scroll positions.
     Nothing on this site is allowed to stay invisible, so anything that has
     reached the viewport is force-revealed. */
  function safety() {
    var sel = ".reveal, .unveil, .rooflines, .text-split";
    var ticking = false;
    function sweep() {
      var vh = window.innerHeight;
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.classList.contains("in")) return;
        var r = el.getBoundingClientRect();
        // anything that has reached, or already passed, the viewport
        if (r.top < vh * 1.05) el.classList.add("in");
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(sweep); }
    }, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
    window.addEventListener("load", sweep);
    var ticks = 0;
    var poll = setInterval(function () {
      sweep();
      if (++ticks > 20) clearInterval(poll);   // ten seconds of insurance
    }, 500);
    sweep();
  }

  function init() {
    transition(); cursor(); rail(); splitText(); parallax();
    odometer(); marquee(); labelButtons(); magnetic(); coverFrames(); safety();
  }

  window.UNEMotion = { init: init };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
