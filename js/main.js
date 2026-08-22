/* Urban Nest Estates. All behaviour is progressive; the site works without JS. */

/* ---------------------------------------------------------------------------
   ENQUIRY FORM DELIVERY
   ---------------------------------------------------------------------------
   Leave both blank and the enquiry form opens the visitor's own mail app with
   the message pre-filled. That works, but a lot of people never send it.

   To have enquiries arrive in the inbox directly, sign up for a free form
   service and paste its details here. Two that need no server:

     Web3Forms  https://web3forms.com   free, generous limits
       UNE_FORM_ENDPOINT   = "https://api.web3forms.com/submit";
       UNE_FORM_ACCESS_KEY = "the access key they email you";

     Formspree  https://formspree.io    free for a small number each month
       UNE_FORM_ENDPOINT   = "https://formspree.io/f/YOUR_FORM_ID";
       UNE_FORM_ACCESS_KEY = "";

   Nothing else needs changing. Test it once after going live.
--------------------------------------------------------------------------- */
window.UNE_FORM_ENDPOINT = "https://api.web3forms.com/submit";
window.UNE_FORM_ACCESS_KEY = "";  /* set to your Web3Forms access key */

(function () {
  "use strict";
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header: solid on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("solid", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Our Portfolio dropdown (desktop) ---------- */
  document.querySelectorAll(".nav-drop").forEach(function (drop) {
    var dropBtn = drop.querySelector(".nav-drop-toggle");
    if (!dropBtn) return;
    var closeTimer;
    var setDrop = function (open) {
      clearTimeout(closeTimer);
      drop.classList.toggle("open", open);
      dropBtn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    dropBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setDrop(!drop.classList.contains("open"));
    });
    drop.addEventListener("mouseenter", function () { setDrop(true); });
    drop.addEventListener("mouseleave", function () {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { setDrop(false); }, 220);
    });
    drop.addEventListener("focusin", function () { setDrop(true); });
    drop.addEventListener("focusout", function (e) {
      if (!drop.contains(e.relatedTarget)) setDrop(false);
    });
    drop.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.key === "Esc") {
        setDrop(false);
        dropBtn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!drop.contains(e.target)) setDrop(false);
    });
  });

  /* ---------- Our Portfolio disclosure (mobile) ---------- */
  document.querySelectorAll(".m-drop").forEach(function (mDrop) {
    var mBtn = mDrop.querySelector(".m-drop-toggle");
    if (!mBtn) return;
    mBtn.addEventListener("click", function () {
      var open = mDrop.classList.toggle("open");
      mBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- reveal + unveil + rooflines draw ---------- */
  var io;
  var targets = document.querySelectorAll(".reveal, .unveil, .rooflines");
  if ("IntersectionObserver" in window && targets.length && !reduce) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add("in"); });
  }

  /* stat counters are handled by js/motion.js (odometer) */

  /* ---------- room walkthrough: active index ---------- */
  var roomLinks = document.querySelectorAll(".room-index a[href^='#']");
  var roomSections = [];
  roomLinks.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute("href"));
    if (sec) roomSections.push(sec);
  });
  if (roomSections.length && "IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          roomLinks.forEach(function (a) {
            var on = a.getAttribute("href") === "#" + id;
            a.classList.toggle("active", on);
            if (on && body.clientWidth <= 980) {
              a.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
            }
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    roomSections.forEach(function (s) { rio.observe(s); });
  }
  roomLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var sec = document.querySelector(a.getAttribute("href"));
      if (sec) { e.preventDefault(); sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
    });
  });

  /* ---------- property filters ---------- */
  var filterBar = document.querySelector(".filters");
  if (filterBar) {
    var covers = document.querySelectorAll(".cover[data-location]");
    filterBar.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".filter");
      if (!btn) return;
      filterBar.querySelectorAll(".filter").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var loc = btn.getAttribute("data-filter");
      covers.forEach(function (c) {
        var match = loc === "all" || c.getAttribute("data-location") === loc;
        c.classList.toggle("is-hidden", !match);
      });
    });
  }

  /* ---------- enquiry drawer ---------- */
  var drawer = document.getElementById("enquiry-drawer");
  var backdrop = document.getElementById("enquiry-backdrop");
  if (drawer) {
    var lastFocus = null;
    var openDrawer = function (context) {
      lastFocus = document.activeElement;
      var ctxField = drawer.querySelector(".drawer-context");
      if (ctxField && context) ctxField.textContent = context;
      drawer.classList.add("open");
      if (backdrop) backdrop.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      var first = drawer.querySelector("input, button, .drawer-close");
      if (first) first.focus();
    };
    var closeDrawer = function () {
      drawer.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      if (lastFocus) lastFocus.focus();
    };
    document.querySelectorAll("[data-open-enquiry]").forEach(function (b) {
      b.addEventListener("click", function () { openDrawer(b.getAttribute("data-context") || ""); });
    });
    var dc = drawer.querySelector(".drawer-close");
    if (dc) dc.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });
  }

  /* ---------- contact tabs (guest / owner) ---------- */
  var tabWrap = document.querySelector(".tabs");
  if (tabWrap) {
    var tabs = tabWrap.querySelectorAll(".tab");
    var reasonField = document.getElementById("reason");
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.setAttribute("aria-selected", "false"); });
        t.setAttribute("aria-selected", "true");
        if (reasonField) reasonField.value = t.getAttribute("data-reason");
      });
    });
  }

  /* ---------- prefill enquiry context from URL ---------- */
  var params = new URLSearchParams(window.location.search);
  var prop = params.get("home") || params.get("property");
  var reasonParam = params.get("reason");
  if (reasonParam) {
    var tsel = document.querySelector('.tab[data-reason="' + reasonParam + '"]');
    if (tsel) tsel.click();
  }
  if (prop) {
    var msg = document.getElementById("message");
    if (msg && !msg.value) msg.value = "I would like to enquire about " + prop + ". ";
  }
  if (reasonParam === "acquisition") {
    var amsg = document.getElementById("message");
    if (amsg && !amsg.value) amsg.value = "I have a property that may suit Urban Nest. Location / zone: \nSize (units or bedrooms): \nWhole block? \nGuide price / details: \n";
  }

  /* ---------- forms: validate, and NEVER falsely confirm ---------- */
  function wireForm(form) {
    if (!form) return;
    var setErr = function (input, on) { input.closest(".field").classList.toggle("invalid", on); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var empty = !input.value.trim();
        var badEmail = input.type === "email" && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        var bad = empty || badEmail;
        setErr(input, bad);
        if (bad) ok = false;
      });
      var status = form.querySelector(".form-status");
      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      // The form composes a prefilled email to the office. Nothing is sent
      // silently, so we describe exactly what happens rather than claiming receipt.
      var get = function (n) { var f = form.querySelector("[name=" + n + "]"); return f ? f.value.trim() : ""; };
      var reasonMap = { owner: "Property management enquiry", acquisition: "Property introduction", guest: "Booking enquiry" };
      var reasonVal = reasonMap[get("reason")] || "Booking enquiry";
      var ctxEl = form.closest("#enquiry-drawer") ? form.closest("#enquiry-drawer").querySelector(".drawer-context") : null;
      var ctx = ctxEl ? ctxEl.textContent.trim() : "";
      var subject = reasonVal + (ctx ? " - " + ctx : "") + " - " + get("name");
      var lines = [
        "Name: " + get("name"),
        "Email: " + get("email"),
        get("phone") ? "Phone: " + get("phone") : "",
        get("dates") ? "Preferred dates: " + get("dates") : "",
        get("guests") ? "Guests: " + get("guests") : "",
        ctx ? "Property: " + ctx : "",
        "",
        get("message")
      ].filter(Boolean);
      var say = function (cls, html) {
        if (!status) return;
        status.className = "form-status " + cls + " show";
        status.innerHTML = html;
        status.setAttribute("tabindex", "-1");
        status.focus();
      };
      var FALLBACK = "If nothing happens, please email <strong>info@urbannestestates.co.uk</strong> " +
                     "or call <strong>+44 7832 827 872</strong>.";

      // With FORM_ENDPOINT set (see config at the top of this file), the enquiry is
      // posted straight to the inbox. Without it, we fall back to composing an email
      // in the visitor's own mail app.
      if (window.UNE_FORM_ENDPOINT) {
        var btn = form.querySelector("[type=submit], button:not([type=button])");
        var label = btn ? btn.innerHTML : "";
        if (btn) { btn.disabled = true; btn.innerHTML = "Sending..."; }
        var payload = new FormData(form);
        payload.append("subject", subject);
        if (ctx) payload.append("property", ctx);
        if (window.UNE_FORM_ACCESS_KEY) payload.append("access_key", window.UNE_FORM_ACCESS_KEY);
        fetch(window.UNE_FORM_ENDPOINT, {
          method: "POST",
          body: payload,
          headers: { Accept: "application/json" }
        }).then(function (r) {
          if (!r.ok) throw new Error("bad status");
          form.reset();
          say("ok", "Thank you. Your enquiry has been sent and we will come back to you shortly.");
        }).catch(function () {
          say("info", "We could not send that just now. " + FALLBACK);
        }).then(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
        });
        return;
      }

      var mailto = "mailto:info@urbannestestates.co.uk?subject=" + encodeURIComponent(subject) +
                   "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = mailto;
      say("info", "Your email app should now open with this enquiry ready to send. " + FALLBACK);
    });
    form.querySelectorAll("[required]").forEach(function (input) {
      input.addEventListener("input", function () { setErr(input, false); });
    });
  }
  document.querySelectorAll("form[data-validate]").forEach(wireForm);

  /* ---------- footer year ---------- */
  document.querySelectorAll(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- reviews carousel ---------- */
  document.querySelectorAll("[data-review-carousel]").forEach(function (car) {
    var track = car.querySelector(".rc-track");
    var prev = car.querySelector(".rc-prev");
    var next = car.querySelector(".rc-next");
    if (!track) return;
    var step = function () {
      var card = track.querySelector(".review-card");
      if (!card) return track.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 20) || 20;
      return card.getBoundingClientRect().width + gap;
    };
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  });
})();
