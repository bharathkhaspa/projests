/**
 * India-wide location autocomplete.
 * Attach to any text input with [data-location-input]; it writes the chosen
 * location id into the hidden input named by data-target and lat/lng into
 * data-lat-target / data-lng-target if present.
 */
(function () {
  const SEARCH_URL = "/api/locations/search";

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function initInput(input) {
    const wrap = input.closest(".ac-wrap");
    if (!wrap) return;
    const results = wrap.querySelector(".ac-results");
    const hidden = document.getElementById(input.dataset.target);
    const latEl = input.dataset.latTarget ? document.getElementById(input.dataset.latTarget) : null;
    const lngEl = input.dataset.lngTarget ? document.getElementById(input.dataset.lngTarget) : null;
    let items = [];
    let active = -1;

    function close() { results.classList.remove("show"); active = -1; }
    function clearChoice() { if (hidden) hidden.value = ""; }

    const run = debounce(function () {
      const q = input.value.trim();
      clearChoice();
      if (q.length < 2) { close(); return; }
      fetch(`${SEARCH_URL}?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data) => {
          items = data.results || [];
          if (!items.length) { results.innerHTML = '<div class="ac-item text-muted">No matches</div>'; results.classList.add("show"); return; }
          results.innerHTML = items
            .map((it, i) => `<div class="ac-item" data-i="${i}"><div>${it.short}</div><small>${it.label}</small></div>`)
            .join("");
          results.classList.add("show");
          results.querySelectorAll(".ac-item[data-i]").forEach((el) => {
            el.addEventListener("click", () => choose(parseInt(el.dataset.i, 10)));
          });
        })
        .catch(() => close());
    }, 220);

    function choose(i) {
      const it = items[i];
      if (!it) return;
      input.value = it.label;
      if (hidden) hidden.value = it.id;
      if (latEl) latEl.value = it.lat;
      if (lngEl) lngEl.value = it.lng;
      close();
      input.dispatchEvent(new CustomEvent("location:selected", { bubbles: true, detail: it }));
    }

    input.addEventListener("input", run);
    input.addEventListener("keydown", (e) => {
      const els = results.querySelectorAll(".ac-item[data-i]");
      if (!results.classList.contains("show") || !els.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, els.length - 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); }
      else if (e.key === "Enter") { if (active >= 0) { e.preventDefault(); choose(active); } return; }
      else return;
      els.forEach((el, i) => el.classList.toggle("active", i === active));
    });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-location-input]").forEach(initInput);
  });
})();
