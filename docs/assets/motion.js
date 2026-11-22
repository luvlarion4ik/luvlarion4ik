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
  const konami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let combo = [];
  addEventListener("keydown", event => {
    if (event.target.closest?.("input, textarea, select, [contenteditable]") || event.metaKey || event.ctrlKey || event.altKey) return;
    const k = ({ "и": "b", "ф": "a" })[event.key.toLowerCase()] ?? event.key.toLowerCase();
    combo = [...combo, k].slice(-10);
    if (combo.join() === konami.join()) { combo = []; devMode(); return; }
    if (event.key === "Escape" && root.classList.contains("dl-devmode")) { devMode(false); return; }
    if (event.key.length !== 1) return;
    typed = (typed + event.key.toLowerCase()).slice(-12);
    if (typed.endsWith("devlarion")) { typed = ""; celebrate(); }
    else if (typed.endsWith("dgx") || typed.endsWith("gpu")) { typed = ""; flyServer(); }
    else if (typed.endsWith("привет") || typed.endsWith("hello")) { typed = ""; wave(); }
  });

  function say(text, ms = 3600) {
    const note = document.createElement("div");
    note.className = "dl-egg";
    note.setAttribute("role", "status");
    note.textContent = text;
    note.style.animationDuration = ms + "ms";
    document.body.append(note);
    setTimeout(() => note.remove(), ms);
  }

  // Konami-код: «режим разработчика» — сетка вёрстки и терминал с логами студии.
  let term = null, termTimer = null;
  function devMode(on = !root.classList.contains("dl-devmode")) {
    root.classList.toggle("dl-devmode", on);
    clearInterval(termTimer);
    term?.remove(); term = null;
    if (!on) return;
    say(ru ? "Режим разработчика включён. Esc — выключить" : "Developer mode on. Press Esc to exit");
    term = document.createElement("div");
    term.className = "dl-term";
    term.setAttribute("aria-hidden", "true");
    document.body.append(term);
    const lines = ru ? [
      "$ devlarion status", "✓ кофе: 3 чашки", "✓ сборка сайта: зелёная", "✓ GPU: греются, но держатся",
      "… Илья отвечает клиенту в Telegram", "✓ дедлайны: под контролем", "! найдено 0 багов (пока)", "$ sudo make it beautiful", "✓ готово"
    ] : [
      "$ devlarion status", "✓ coffee: 3 cups", "✓ site build: green", "✓ GPUs: warm but holding",
      "… Ilia is replying to a client on Telegram", "✓ deadlines: under control", "! 0 bugs found (so far)", "$ sudo make it beautiful", "✓ done"
    ];
    let i = 0;
    termTimer = setInterval(() => {
      const row = document.createElement("p");
      row.textContent = lines[i % lines.length];
      term.append(row);
      while (term.children.length > 7) term.firstChild.remove();
      i++;
    }, reduced ? 1200 : 650);
  }

  // dgx / gpu: через экран пролетает сервер с крутящимися вентиляторами.
  function flyServer() {
    say(ru ? "DGX уже в пути. Шутка: поставляем под заказ 😉" : "A DGX is on its way. Kidding, we supply to order 😉");
    if (reduced) return;
    const box = document.createElement("div");
    box.className = "dl-server";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<svg viewBox="0 0 220 90"><rect x="2" y="2" width="216" height="86" rx="10"/><rect class="dl-s-top" x="2" y="2" width="216" height="18" rx="9"/>' +
      [0, 1, 2, 3].map(n => `<g transform="translate(${40 + n * 47} 56)"><circle r="20"/><g class="dl-fan"><path d="M0-16c5 4 5 10 0 13M16 0c-4 5-10 5-13 0M0 16c-5-4-5-10 0-13M-16 0c4-5 10-5 13 0"/></g></g>`).join("") + '</svg>';
    document.body.append(box);
    setTimeout(() => box.remove(), 3300);
  }

  // привет / hello: логотип в шапке машет рукой.
  function wave() {
    const logo = document.querySelector("body > header .wordmark");
    say(ru ? "И вам привет! 👋" : "Hello to you too! 👋", 2600);
    if (!logo || reduced) return;
    const hand = document.createElement("span");
    hand.className = "dl-hand";
    hand.setAttribute("aria-hidden", "true");
    hand.textContent = "👋";
    logo.append(hand);
    logo.classList.add("dl-wiggle");
    setTimeout(() => { hand.remove(); logo.classList.remove("dl-wiggle"); }, 2200);
  }

  // 7 кликов по логотипу на главной: логотип раскручивается и «устаёт», тема на миг меняется.
  let clicks = 0, clickTimer;
  document.querySelector("body > header .wordmark")?.addEventListener("click", event => {
    const logo = event.currentTarget;
    if (new URL(logo.href, location.href).pathname !== location.pathname) return;
    event.preventDefault();
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clicks = 0; }, 2500);
    if (++clicks < 7) { if (!reduced) logo.animate([{ transform: "rotate(0)" }, { transform: "rotate(" + clicks * 8 + "deg)" }, { transform: "rotate(0)" }], { duration: 260 }); return; }
    clicks = 0;
    say(ru ? "Ой, голова закружилась… 😵‍💫" : "Whoa, I’m dizzy… 😵‍💫", 3000);
    if (reduced) return;
    logo.animate([{ transform: "rotate(0)" }, { transform: "rotate(1080deg) scale(1.1)" }, { transform: "rotate(1060deg) scale(.95)" }, { transform: "rotate(1080deg)" }], { duration: 1600, easing: "cubic-bezier(.2,.8,.3,1)" });
    root.classList.add("dl-flash");
    setTimeout(() => root.classList.remove("dl-flash"), 900);
  });

  // Послание для тех, кто открыл консоль.
  try {
    console.log("%c\n  ██████╗ ██╗\n  ██╔══██╗██║\n  ██║  ██║██║\n  ██║  ██║██║\n  ██████╔╝███████╗\n  ╚═════╝ ╚══════╝\n", "color:#e8ac8c;font-family:monospace");
    console.log("%c" + (ru ? "Привет, коллега! Раз ты здесь — тебе точно интересно, как это сделано." : "Hi, fellow developer! If you are here, you want to know how this was built."), "font-size:14px;font-weight:700");
    console.log(ru ? "Пасхалки: наберите devlarion, dgx или привет; Konami-код; 7 кликов по логотипу на главной. Написать Илье: " + (document.querySelector('a[href*="t.me/"]')?.href.split("?")[0] ?? "") : "Easter eggs: type devlarion, dgx or hello; the Konami code; click the logo 7 times on the home page.");
  } catch {}
  function celebrate() {
    say(ru ? "Вы нашли пасхалку. Илья передаёт привет 👋" : "You found the easter egg. Ilia says hi 👋", 4200);
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
