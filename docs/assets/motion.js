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

  // ---------- Пасхалки ----------
  const tgLink = (document.querySelector('a[href*="t.me/"]')?.href || "").split("?")[0];
  const home = document.querySelector("body > header .wordmark")?.getAttribute("href") || "/";
  let typed = "";
  const konami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let combo = [];
  addEventListener("keydown", event => {
    if (event.target.closest?.("input, textarea, select, [contenteditable]") || event.metaKey || event.ctrlKey || event.altKey) return;
    const k = ({ "и": "b", "ф": "a" })[event.key.toLowerCase()] ?? event.key.toLowerCase();
    combo = [...combo, k].slice(-10);
    if (combo.join() === konami.join()) { combo = []; inspector(); return; }
    if (event.key === "Escape" && root.classList.contains("dl-devmode")) { inspector(false); return; }
    if (event.key.length !== 1) return;
    typed = (typed + event.key.toLowerCase()).slice(-12);
    if (typed.endsWith("devlarion")) { typed = ""; sparks(); }
    else if (typed.endsWith("dgx") || typed.endsWith("gpu")) { typed = ""; flyServer(); }
    else if (typed.endsWith("привет") || typed.endsWith("hello")) { typed = ""; wave(); }
  });

  // Короткая записка внизу экрана: текст и, если нужно, ссылка.
  function note(text, link, ms = 5200) {
    document.querySelector(".dl-note")?.remove();
    const box = document.createElement("div");
    box.className = "dl-note";
    box.setAttribute("role", "status");
    const p = document.createElement("p");
    p.textContent = text;
    box.append(p);
    if (link) {
      const a = document.createElement("a");
      a.href = link[1];
      a.textContent = link[0];
      box.append(a);
    }
    document.body.append(box);
    setTimeout(() => box.classList.add("dl-note-out"), ms - 400);
    setTimeout(() => box.remove(), ms);
  }

  const logoBox = () => document.querySelector("body > header .wordmark");

  // devlarion: логотип заново прорисовывается и из него летят медные искры.
  function sparks() {
    note(ru ? "Вы дочитали до пасхалок. Значит, вам точно есть о чём поговорить с Ильёй." : "You made it to the easter eggs. You clearly have something to discuss with Ilia.",
      tgLink ? [ru ? "Написать в Telegram" : "Message on Telegram", tgLink] : null);
    const logo = logoBox();
    customElements.whenDefined("devlarion-logo").then(() => logo?.querySelector("devlarion-logo")?.play?.());
    if (reduced || !logo) return;
    const r = logo.getBoundingClientRect();
    const ox = r.left + 26, oy = r.top + r.height / 2;
    for (let i = 0; i < 46; i++) {
      const s = document.createElement("i");
      s.className = "dl-spark";
      s.style.left = ox + "px";
      s.style.top = oy + "px";
      document.body.append(s);
      const angle = Math.random() * Math.PI - Math.PI * .05, speed = 120 + Math.random() * 260;
      const dx = Math.cos(angle) * speed, dy = Math.sin(angle) * speed * .55;
      s.animate([
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * .6}px), calc(-50% + ${dy * .6 - 40}px)) scale(.9)`, opacity: 1, offset: .45 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 160}px)) scale(.2)`, opacity: 0 },
      ], { duration: 1100 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.4,1)", delay: Math.random() * 120 }).onfinish = () => s.remove();
    }
  }

  // Konami: «инспектор» — сетка вёрстки и настоящие цифры этой страницы.
  let panel = null;
  function inspector(on = !root.classList.contains("dl-devmode")) {
    root.classList.toggle("dl-devmode", on);
    panel?.remove(); panel = null;
    if (!on) return;
    const nav = performance.getEntriesByType("navigation")[0];
    const kb = n => Math.round(n / 1024) + (ru ? " КБ" : " KB");
    const rows = [
      [ru ? "страница" : "page", location.pathname],
      [ru ? "загрузилась за" : "loaded in", nav ? Math.round(nav.duration) + (ru ? " мс" : " ms") : "—"],
      [ru ? "HTML" : "HTML", nav?.transferSize ? kb(nav.transferSize) : "—"],
      [ru ? "элементов" : "elements", document.getElementsByTagName("*").length.toLocaleString(root.lang)],
      [ru ? "анимаций сейчас" : "running animations", String(document.getAnimations().length)],
      [ru ? "тема" : "theme", root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")],
      [ru ? "фреймворк" : "framework", ru ? "нет, чистый HTML/CSS/JS" : "none, plain HTML/CSS/JS"],
    ];
    panel = document.createElement("div");
    panel.className = "dl-term";
    panel.setAttribute("role", "status");
    const head = document.createElement("p");
    head.className = "dl-term-head";
    head.textContent = "$ devlarion inspect";
    panel.append(head);
    rows.forEach(([k, v], i) => {
      const p = document.createElement("p");
      p.style.animationDelay = (i * 90 + 120) + "ms";
      const a = document.createElement("span"); a.textContent = k;
      const b = document.createElement("b"); b.textContent = v;
      p.append(a, b);
      panel.append(p);
    });
    const hint = document.createElement("p");
    hint.className = "dl-term-hint";
    hint.textContent = ru ? "Esc — закрыть" : "Esc to close";
    panel.append(hint);
    document.body.append(panel);
  }

  // dgx / gpu: через экран проезжает DGX Spark.
  function flyServer() {
    note(ru ? "DGX Spark: 128 ГБ памяти в корпусе размером с книгу." : "DGX Spark: 128 GB of memory in a box the size of a book.",
      [ru ? "Посмотреть в магазине" : "See it in the shop", home + "shop/#dgx-spark"]);
    if (reduced) return;
    const box = document.createElement("div");
    box.className = "dl-server";
    box.setAttribute("aria-hidden", "true");
    let mesh = "";
    for (let i = 0; i < 12; i++) for (let j = 0; j < 6; j++) mesh += `<circle cx="${18 + i * 11 + (j % 2) * 5.5}" cy="${16 + j * 10}" r="3"/>`;
    box.innerHTML = `<svg viewBox="0 0 170 96"><rect x="2" y="2" width="166" height="84" rx="12" class="dl-s-body"/><g class="dl-s-mesh">${mesh}</g><rect x="2" y="74" width="166" height="12" rx="5" class="dl-s-edge"/><circle cx="154" cy="80" r="2.5" class="dl-s-led"/></svg>`;
    document.body.append(box);
    setTimeout(() => box.remove(), 3600);
  }

  // привет / hello: логотип кивает.
  function wave() {
    note(ru ? "Привет. Если есть вопрос — пишите, отвечаю сам." : "Hi. If you have a question, write to me directly.",
      tgLink ? [ru ? "Написать" : "Write", tgLink] : null, 4200);
    const logo = logoBox();
    if (!logo || reduced) return;
    logo.animate([{ transform: "rotate(0)" }, { transform: "rotate(-8deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(-4deg)" }, { transform: "rotate(0)" }],
      { duration: 900, easing: "ease-in-out" });
  }

  // 7 кликов по логотипу на главной: страница «вздрагивает».
  let clicks = 0, clickTimer;
  logoBox()?.addEventListener("click", event => {
    const logo = event.currentTarget;
    if (new URL(logo.href, location.href).pathname !== location.pathname) return;
    event.preventDefault();
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clicks = 0; }, 2500);
    if (++clicks < 7) { if (!reduced) logo.animate([{ transform: "scale(1)" }, { transform: "scale(" + (1 + clicks * .02) + ")" }, { transform: "scale(1)" }], { duration: 220 }); return; }
    clicks = 0;
    note(ru ? "Всё, всё, я понял. Можно просто написать." : "Alright, I get it. You can just write to me.", tgLink ? [ru ? "Написать" : "Write", tgLink] : null, 4000);
    if (reduced) return;
    logo.animate([{ transform: "rotate(0)" }, { transform: "rotate(720deg)" }], { duration: 1100, easing: "cubic-bezier(.3,1.3,.5,1)" });
    document.querySelector("main")?.animate([{ transform: "none" }, { transform: "rotate(-.6deg) translateY(4px)" }, { transform: "rotate(.4deg)" }, { transform: "none" }], { duration: 700, easing: "ease-in-out" });
  });

  // Ночной визит: одна тихая записка за сессию.
  try {
    const hour = new Date().getHours();
    if (hour < 5 && !sessionStorage.getItem("dl-night")) {
      sessionStorage.setItem("dl-night", "1");
      setTimeout(() => note(ru ? "Поздно, а вы всё ещё выбираете подрядчика. Оставьте заявку — утром ответим первым делом." : "It’s late and you’re still choosing a contractor. Leave an enquiry and we’ll reply first thing.", null, 7000), 9000);
    }
  } catch {}

  // Послание тем, кто открыл консоль.
  try {
    console.log("%cDevlarion", "font:700 28px Georgia,serif;color:#e8ac8c");
    console.log(ru ? "Сайт без фреймворков: статический генератор на Node, чистый CSS и немного JS. Пасхалки: devlarion, dgx, привет, Konami-код и 7 кликов по логотипу на главной." : "No frameworks: a Node static generator, plain CSS and a little JS. Easter eggs: devlarion, dgx, hello, the Konami code and 7 logo clicks on the home page.");
    if (tgLink) console.log((ru ? "Связаться: " : "Contact: ") + tgLink);
  } catch {}

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
      heroArt?.style.setProperty("transform", "translate3d(0," + (y * -0.06).toFixed(1) + "px,0) rotate(" + (y * 0.004).toFixed(3) + "deg)");
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
