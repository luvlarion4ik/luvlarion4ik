/* Devlarion motion: орбиты со знаком на первом экране, появление блоков при прокрутке,
   логотип в шапке «здоровается» после перехода на страницу, блик за курсором на карточках.
   При prefers-reduced-motion ничего не запускается: страница остаётся статичной. */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;
  const root = document.documentElement;

  // 1. Первый экран: большой контурный знак D с вырезом L и вращающиеся орбиты.
  const hero = document.querySelector(".hero, .audience-hero");
  if (hero && !hero.querySelector(".dl-orbit")) {
    const ring = (r, cls = "") => `<circle class="ring ${cls}" cx="500" cy="500" r="${r}"/>`;
    const sat = (r, angle, size) => {
      const a = angle * Math.PI / 180, x = (500 + r * Math.cos(a)).toFixed(1), y = (500 + r * Math.sin(a)).toFixed(1);
      return `<circle class="sat" cx="${x}" cy="${y}" r="${size}"/><circle class="sat pulse" cx="${x}" cy="${y}" r="${size}"/>`;
    };
    hero.insertAdjacentHTML("afterbegin", `<svg class="dl-orbit" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      ${ring(210)}${ring(300, "dash")}${ring(410)}${ring(490, "dash")}
      <g class="spin s1">${sat(300, -30, 4)}${sat(300, 150, 2.5)}</g>
      <g class="spin s2">${sat(410, 60, 5)}${sat(410, 200, 3)}</g>
      <g class="spin s3">${sat(210, 110, 3)}</g>
      <g transform="translate(500 500) scale(4.2) translate(-33 -32)">
        <path class="glyph" pathLength="1" d="M8 6h20c18 0 30 10 30 26S46 58 28 58H8V6Z"/>
        <path class="glyph cut" pathLength="1" d="M24.5 16V43.5H42"/>
      </g></svg>`);
    const orbit = hero.querySelector(".dl-orbit");
    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = Math.min(scrollY, innerHeight);
        orbit.style.setProperty("--dl-shift", (y * 0.25).toFixed(1) + "px");
      });
    }, { passive: true });
  }

  // 2. Футер: знак, который прорисовывается, когда до него долистали.
  const footer = document.querySelector("body > footer");
  if (footer && !footer.querySelector(".dl-footer-mark")) {
    footer.insertAdjacentHTML("afterbegin", `<div class="dl-footer-mark" aria-hidden="true"><devlarion-logo variant="mark" height="54" view></devlarion-logo></div>`);
  }

  // 3. Появление блоков при прокрутке, с небольшой задержкой внутри одной сетки.
  if ("IntersectionObserver" in window) {
    const targets = [
      ".section > h2", ".section > p", ".service-group > h3", ".product-feature > *",
      ".product-card", ".offer-panel", ".solution-content", ".exhibit",
      ".home-facts > *", ".home-growth > a", ".home-process > li",
      ".audience-section .service-grid > article", ".loss-grid > article", ".shift", ".trust-strip > div", ".bundle-flow > li", ".bundle-row", ".capacity", ".bundle-teaser", ".audience-related > a",
      ".sub > h2", ".case-gallery-frame", ".ready-solutions-grid > article",
      ".notfound > *", ".pt-section > h2", ".pt-steps > *", ".pt-roles > *",
    ].join(",");
    const seen = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("dl-in");
        seen.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    function observe(container) {
      for (const el of container.querySelectorAll(targets)) {
        if (el.closest(".hero, .audience-hero, .pt-hero, .pt-app, [data-reveal]")) continue;
        // То, что уже видно, не прячем: так нет мигания первого экрана.
        if (el.getBoundingClientRect().top < innerHeight * 0.9) continue;
        const siblings = [...el.parentElement.children].filter(child => child.matches(targets));
        el.style.setProperty("--dl-i", Math.min(siblings.indexOf(el), 5));
        el.setAttribute("data-reveal", "");
        seen.observe(el);
      }
    }
    observe(document);
    document.addEventListener("toggle", event => {
      if (event.target instanceof HTMLDetailsElement && event.target.open) observe(event.target);
    }, true);
    root.classList.add("dl-motion");
  }

  // 4. Блик за курсором на карточках.
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const cards = document.querySelectorAll(".service-grid article, .product-card, .case, .offer-panel, .pt-direction, .segment-card, .home-growth > a, .audience-related > a");
    for (const card of cards) {
      card.setAttribute("data-glow", "");
      card.addEventListener("pointermove", event => {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--gx", (event.clientX - box.left) + "px");
        card.style.setProperty("--gy", (event.clientY - box.top) + "px");
      });
    }
  }

  // 5. Логотип в шапке проигрывает анимацию после перехода на внутреннюю страницу.
  const greet = () => {
    const logo = document.querySelector("header devlarion-logo");
    if (!logo || logo.hasAttribute("intro")) return;
    customElements.whenDefined("devlarion-logo").then(() => setTimeout(() => logo.play?.(), 380));
  };
  if (document.readyState === "complete") greet(); else addEventListener("load", greet, { once: true });
  addEventListener("pageshow", event => { if (event.persisted) greet(); });
})();

/* Devlarion motion, часть 2: полоса прогресса, «живая» шапка, параллакс первого экрана,
   слова заголовков поднимаются по одному, магнитные кнопки, наклон кейсов, бегущая строка
   ускоряется от прокрутки, линия пакета прорисовывается по мере чтения, кнопка «наверх»
   с кольцом прогресса и пасхалка: наберите на клавиатуре «devlarion». */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const ru = root.lang === "ru";

  // Пасхалка работает всегда; без анимации — только приветствие.
  let typed = "";
  addEventListener("keydown", event => {
    if (event.target.closest?.("input, textarea, select, [contenteditable]") || event.metaKey || event.ctrlKey || event.key.length !== 1) return;
    typed = (typed + event.key.toLowerCase()).slice(-9);
    if (typed === "devlarion") { typed = ""; celebrate(); }
  });
  function celebrate() {
    const note = document.createElement("div");
    note.className = "dl-egg";
    note.setAttribute("role", "status");
    note.textContent = ru ? "Вы нашли пасхалку. Илья передаёт привет 👋" : "You found the easter egg. Ilia says hi 👋";
    document.body.append(note);
    setTimeout(() => note.remove(), 4200);
    if (reduced) return;
    const layer = document.createElement("div");
    layer.className = "dl-confetti";
    layer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 80; i++) {
      const bit = document.createElement("i");
      bit.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "vw");
      bit.style.setProperty("--d", (Math.random() * 40 - 20).toFixed(1) + "vw");
      bit.style.setProperty("--r", (Math.random() * 900 - 450).toFixed(0) + "deg");
      bit.style.setProperty("--t", (1.6 + Math.random() * 1.6).toFixed(2) + "s");
      bit.style.setProperty("--w", (Math.random() * .35).toFixed(2) + "s");
      bit.style.setProperty("--s", (5 + Math.random() * 7).toFixed(0) + "px");
      layer.append(bit);
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 3800);
  }

  if (reduced) return;
  root.classList.add("dl-motion-plus");

  // Полоса прогресса чтения и кнопка «наверх» с кольцом.
  const bar = document.createElement("div");
  bar.className = "dl-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.append(bar);
  const top = document.createElement("button");
  top.type = "button";
  top.className = "dl-top";
  top.setAttribute("aria-label", ru ? "Наверх" : "Back to top");
  top.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="dl-top-track" cx="22" cy="22" r="19"/><circle class="dl-top-ring" cx="22" cy="22" r="19" pathLength="1"/><path d="M22 29V15m0 0l-6 6m6-6l6 6"/></svg>';
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  document.body.append(top);

  const header = document.querySelector("body > header");
  const heroCopy = document.querySelector(".hero-copy, .audience-hero-copy");
  const heroArt = document.querySelector(".featured-case, .page-art");
  const flow = document.querySelector(".bundle-flow");
  const tracks = [...document.querySelectorAll(".stack-track")];

  let lastY = scrollY, velocity = 0, queued = false;
  function frame() {
    queued = false;
    const y = scrollY;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    const p = Math.min(1, y / max);
    bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    top.style.setProperty("--p", p.toFixed(4));
    top.toggleAttribute("data-show", y > innerHeight * 0.9);
    header?.toggleAttribute("data-scrolled", y > 12);
    if (y < innerHeight * 1.2) {
      heroCopy?.style.setProperty("transform", "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)");
      heroArt?.style.setProperty("transform", "translate3d(0," + (y * -0.06).toFixed(1) + "px,0) rotate(" + (y * 0.004).toFixed(3) + "deg)");
      if (heroCopy) heroCopy.style.opacity = String(Math.max(0.15, 1 - y / (innerHeight * 1.1)).toFixed(3));
    }
    if (flow) {
      const box = flow.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (innerHeight * 0.85 - box.top) / (box.height + innerHeight * 0.4)));
      flow.style.setProperty("--dl-flow", k.toFixed(3));
    }
    velocity = velocity * 0.85 + Math.abs(y - lastY) * 0.15;
    lastY = y;
    const rate = 1 + Math.min(velocity / 12, 5);
    for (const track of tracks) for (const anim of track.getAnimations()) anim.playbackRate = rate;
    if (velocity > 0.3) queue();
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue, { passive: true });
  frame();

  // Слова заголовков поднимаются по одному, когда секция входит в экран.
  const heads = document.querySelectorAll(".section > h2, .audience-section > h2, .bundle-teaser h2, .audience-close h2");
  const wordIO = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("dl-words-in"); wordIO.unobserve(entry.target); }
  }, { rootMargin: "0px 0px -10% 0px" });
  for (const h of heads) {
    if (h.closest(".hero, .audience-hero") || h.children.length || h.getBoundingClientRect().top < innerHeight * 0.9) continue;
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.textContent = "";
    words.forEach((word, i) => {
      const outer = document.createElement("span");
      outer.className = "dl-word";
      outer.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.textContent = word;
      inner.style.setProperty("--w", i);
      outer.append(inner);
      h.append(outer, i < words.length - 1 ? " " : "");
    });
    h.classList.add("dl-words");
    wordIO.observe(h);
  }

  // Номера в карточках «Цена ожидания» отсчитываются при появлении.
  const counters = document.querySelectorAll(".loss-index");
  const countIO = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      countIO.unobserve(entry.target);
      const end = Number(entry.target.textContent), t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / 700);
        entry.target.textContent = String(Math.round(end * k)).padStart(2, "0");
        if (k < 1) requestAnimationFrame(tick);
      };
      entry.target.textContent = "00";
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.6 });
  counters.forEach(c => countIO.observe(c));

  if (!fine) return;

  // Магнитные кнопки: тянутся к курсору на несколько пикселей.
  for (const btn of document.querySelectorAll(".button, .hero .ghost, .audience-hero .ghost, .capacity .button, header .cta, .bundle-teaser .ghost")) {
    btn.classList.add("dl-magnet");
    btn.addEventListener("pointermove", event => {
      const box = btn.getBoundingClientRect();
      const dx = (event.clientX - box.left - box.width / 2) / box.width;
      const dy = (event.clientY - box.top - box.height / 2) / box.height;
      btn.style.transform = "translate(" + (dx * 8).toFixed(1) + "px," + (dy * 6).toFixed(1) + "px)";
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  }

  // Объёмный наклон кейсов и карточек сегментов.
  for (const card of document.querySelectorAll(".featured-case, .exhibit-featured, .segment-card, .loss-grid > article, .bundle-plans > article")) {
    card.classList.add("dl-tilt");
    card.addEventListener("pointermove", event => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
      card.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
  }
})();
