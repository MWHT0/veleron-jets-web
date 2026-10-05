(function () {
  var doc = document.documentElement;
  doc.classList.add("js");

  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  var dock = document.querySelector(".dock");
  var hero = document.querySelector(".hero");

  function onScroll() {
    var y = window.scrollY || 0;
    var heroH = hero ? hero.offsetHeight : 600;
    nav.classList.toggle("is-solid", y > 40);
    if (dock) dock.classList.toggle("is-shown", y > heroH * 0.7);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    nav.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  // flight request -> email copy to the team (background, never blocks), then prefilled WhatsApp message
  var WA = "447424861470";
  var MAIL = "https://formsubmit.co/ajax/8349ebe5a73cd96d6b4d5e0b99803c30";
  function emailCopy(f) {
    try {
      if (f._honey && f._honey.value) return Promise.resolve();
      var d = new FormData();
      d.append("_subject", "New flight request — veleron.co.uk");
      d.append("_template", "table");
      d.append("_captcha", "false");
      d.append("Urgent", f.urgent.checked ? "YES, within 24 hours" : "No");
      d.append("From", f.from.value.trim());
      d.append("To", f.to.value.trim());
      d.append("Trip", f.trip.value);
      d.append("Date", f.date.value || "-");
      d.append("Passengers", f.pax.value || "-");
      d.append("Name", f.name.value.trim() || "-");
      d.append("Notes", f.notes.value.trim() || "-");
      d.append("Submitted", new Date().toString());
      d.append("Page", window.location.href);
      var sent = fetch(MAIL, { method: "POST", body: d, headers: { Accept: "application/json" }, keepalive: true })
        .catch(function () {});
      var timeout = new Promise(function (r) { setTimeout(r, 1500); });
      return Promise.race([sent, timeout]).catch(function () {});
    } catch (err) { return Promise.resolve(); }
  }
  var form = document.getElementById("flight-form");
  var msg = document.getElementById("form-msg");
  var dateInput = document.getElementById("f-date");
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var ok = true;
    ["from", "to"].forEach(function (n) {
      var field = f[n].closest(".field");
      var bad = !f[n].value.trim();
      field.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      msg.textContent = "Add where you’re flying from and to, then try again.";
      (f.from.value.trim() ? f.to : f.from).focus();
      return;
    }
    var lines = ["Hello VELERON — I'd like to request a private flight."];
    if (f.urgent.checked) lines.push("URGENT: travelling within 24 hours.");
    lines.push("From: " + f.from.value.trim());
    lines.push("To: " + f.to.value.trim());
    lines.push("Trip: " + f.trip.value);
    if (f.date.value) lines.push("Date: " + f.date.value);
    if (f.pax.value) lines.push("Passengers: " + f.pax.value);
    if (f.notes.value.trim()) lines.push("Notes: " + f.notes.value.trim());
    if (f.name.value.trim()) lines.push("Name: " + f.name.value.trim());
    var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));
    msg.textContent = "Opening WhatsApp with your request…";
    var go = function () { window.location.href = url; };
    emailCopy(f).then(go, go);
  });

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

(function () {
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".ac");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-filter");
      chips.forEach(function (x) { var on = x === c; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", String(on)); });
      cards.forEach(function (card) {
        card.hidden = !(f === "all" || card.getAttribute("data-make") === f);
        card.classList.add("is-in");
      });
    });
  });
})();

(function () {
  var dock = document.querySelector(".dock");
  var req = document.getElementById("request");
  if (!dock || !req || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(function (en) {
    dock.classList.toggle("is-hidden", en[0].isIntersecting);
  }, { threshold: 0.15 }).observe(req);
})();
