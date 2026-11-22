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
    if (combo.join() === konami.join()) { combo = []; inspector(); found("konami"); return; }
    if (event.key === "Escape" && root.classList.contains("dl-devmode")) { inspector(false); return; }
    if (event.key.length !== 1) return;
    typed = (typed + event.key.toLowerCase()).slice(-12);
    if (typed.endsWith("devlarion")) { typed = ""; sparks(); found("devlarion"); }
    else if (typed.endsWith("dgx") || typed.endsWith("gpu")) { typed = ""; flyServer(); found("dgx"); }
    else if (typed.endsWith("привет") || typed.endsWith("hello")) { typed = ""; wave(); found("hello"); }
    else if (/(скидк|акци|sale|discount)$/.test(typed)) { typed = ""; sale(); found("sale"); }
    else if (typed.endsWith("152")) { typed = ""; fine152(); found("152"); }
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
    found("logo");
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
      setTimeout(() => found("night"), 0);
      setTimeout(() => note(ru ? "Поздно, а вы всё ещё выбираете подрядчика. Оставьте заявку — утром ответим первым делом." : "It’s late and you’re still choosing a contractor. Leave an enquiry and we’ll reply first thing.", null, 7000), 9000);
    }
  } catch {}

  // ---------- Новые пасхалки ----------
  function sale() {
    note(ru ? "Акции? Только по согласованию. Но раз уж вы так настойчиво печатаете — найдите ещё пару секретов на сайте." : "Discounts? Only by agreement. But since you typed it so insistently, find a couple more secrets on the site.", null, 5600);
    if (reduced) return;
    const tag = document.createElement("div");
    tag.className = "dl-sale";
    tag.setAttribute("aria-hidden", "true");
    tag.innerHTML = '<span>−0%</span>';
    document.body.append(tag);
    setTimeout(() => tag.remove(), 2600);
  }
  function fine152() {
    note(ru ? "152-ФЗ: утечка данных 10–100 тыс. человек — штраф 5–10 млн ₽, повторная — до 3% выручки." : "152-FZ: a leak of 10–100k people’s data means a RUB 5–10m fine; a repeat one, up to 3% of revenue.",
      [ru ? "Как этого избежать" : "How to avoid it", home + "private-ai/"], 6400);
  }
  // Потерянный GPU: крошечный чип в подвале.
  const fineRow = document.querySelector("body > footer .fine");
  if (fineRow) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "dl-chip";
    chip.setAttribute("aria-label", ru ? "Что это?" : "What is this?");
    chip.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 6V3m3 3V3m3 3V3M9 21v-3m3 3v-3m3 3v-3M6 9H3m3 3H3m3 3H3m18-6h-3m3 3h-3m3 3h-3"/></svg>';
    chip.addEventListener("click", () => {
      found("chip");
      note(ru ? "Вы нашли потерянный GPU. В этом году они ценнее золота." : "You found a lost GPU. This year they are worth more than gold.", [ru ? "Ещё в магазине" : "More in the shop", home + "shop/#dgx-spark"], 4800);
      if (!reduced) chip.animate([{ transform: "rotate(0) scale(1)" }, { transform: "rotate(360deg) scale(1.6)" }, { transform: "rotate(360deg) scale(1)" }], { duration: 800, easing: "cubic-bezier(.3,1.3,.5,1)" });
    });
    fineRow.append(chip);
  }

  // ---------- Коллекция секретов и награда ----------
  const EGGS = ["devlarion", "konami", "dgx", "hello", "logo", "night", "sale", "152", "chip"];
  const NEED = 4;
  const store = (() => { try { return JSON.parse(localStorage.getItem("dl-eggs") || "[]"); } catch { return []; } })();
  let pill = null;
  function renderPill() {
    if (!store.length) return;
    if (!pill) {
      pill = document.createElement("button");
      pill.type = "button";
      pill.className = "dl-eggs";
      pill.addEventListener("click", () => store.length >= NEED ? reward() : note(ru ? `Найдено секретов: ${store.length} из ${EGGS.length}. За ${NEED} — подарок.` : `Secrets found: ${store.length} of ${EGGS.length}. ${NEED} unlock a gift.`, null, 3600));
      (document.querySelector("body > footer .fine") || document.body).append(pill);
    }
    pill.textContent = (ru ? "Секреты " : "Secrets ") + store.length + "/" + EGGS.length;
    pill.toggleAttribute("data-ready", store.length >= NEED);
  }
  function found(id) {
    if (store.includes(id)) return;
    store.push(id);
    try { localStorage.setItem("dl-eggs", JSON.stringify(store)); } catch {}
    renderPill();
    if (!reduced && pill) pill.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(.3,1.4,.5,1)" });
    if (store.length === NEED) setTimeout(reward, 1600);
  }
  renderPill();

  function reward() {
    document.querySelector(".dl-reward")?.remove();
    const code = "DL-SECRET-" + (store.slice().sort().join("").length * 37 % 900 + 100);
    const box = document.createElement("dialog");
    box.className = "dl-reward";
    box.innerHTML = `<form method="dialog" class="dl-reward-card">
      <svg class="dl-reward-art" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><path d="M38 34h22c18 0 30 11 30 26S78 86 60 86H38z"/><path class="cut" d="M52 46v26h18"/></svg>
      <p class="dl-reward-eyebrow">${ru ? "Вы нашли " + store.length + " секретов" : "You found " + store.length + " secrets"}</p>
      <h2>${ru ? "Это заслуживает подарка" : "That deserves a gift"}</h2>
      <ul>
        <li>${ru ? "Скидка 5% на первый проект — по согласованию" : "5% off your first project, by agreement"}</li>
        <li>${ru ? "Бесплатный аудит сайта или данных — по согласованию" : "A free website or data audit, by agreement"}</li>
        <li>${ru ? "Именной сертификат исследователя" : "A personal explorer certificate"}</li>
      </ul>
      <p class="dl-reward-code">${ru ? "Код" : "Code"}: <b>${code}</b></p>
      <label class="dl-reward-name"><span>${ru ? "Имя и фамилия для сертификата" : "Name for the certificate"}</span><input name="name" maxlength="80" autocomplete="name" placeholder="${ru ? "Анна Смирнова" : "Anna Smith"}"></label>
      <div class="dl-reward-preview"><img alt="" hidden></div>
      <div class="dl-reward-actions">
        <button type="button" data-cert-download>${ru ? "Скачать сертификат" : "Download certificate"}</button>
        <button type="button" data-cert-tg>${ru ? "Получить в Telegram" : "Get it on Telegram"}</button>
        ${tgLink ? `<a href="${tgLink}?text=${encodeURIComponent((ru ? "Здравствуйте! У меня код " : "Hello! My code is ") + code)}">${ru ? "Написать с кодом" : "Write with the code"}</a>` : ""}
      </div>
      <p class="dl-reward-status" role="status"></p>
      <button class="dl-reward-close" value="close" aria-label="${ru ? "Закрыть" : "Close"}">×</button>
    </form>`;
    document.body.append(box);
    box.showModal();
    const input = box.querySelector("input"), img = box.querySelector(".dl-reward-preview img"), status = box.querySelector(".dl-reward-status");
    let blobUrl = null, latest = null;
    const refresh = async () => {
      const name = input.value.trim();
      if (!name) { img.hidden = true; latest = null; return; }
      latest = await certificate(name, code);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = URL.createObjectURL(latest);
      img.src = blobUrl; img.hidden = false;
    };
    let t; input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(refresh, 250); });
    box.querySelector("[data-cert-download]").addEventListener("click", async () => {
      if (!input.value.trim()) { status.textContent = ru ? "Впишите имя — оно появится на сертификате." : "Enter a name for the certificate."; input.focus(); return; }
      await refresh();
      const a = document.createElement("a");
      a.href = blobUrl; a.download = "devlarion-certificate.png"; a.click();
      status.textContent = ru ? "Сертификат скачан." : "Certificate downloaded.";
    });
    box.querySelector("[data-cert-tg]").addEventListener("click", async () => {
      if (!input.value.trim()) { status.textContent = ru ? "Впишите имя — оно появится на сертификате." : "Enter a name for the certificate."; input.focus(); return; }
      status.textContent = ru ? "Готовим сертификат…" : "Preparing…";
      try {
        await refresh();
        const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(latest); });
        const res = await fetch("/account/api/certificate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: input.value.trim(), code, png: data }) });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || "error");
        status.textContent = ru ? "Откройте бота и нажмите «Запустить» — сертификат придёт в чат." : "Open the bot and press Start — the certificate will arrive in the chat.";
        open(out.bot, "_blank", "noopener");
      } catch (e) { status.textContent = (ru ? "Не получилось отправить. Скачайте файл и сохраните его. " : "Could not send it. Please download the file. ") + (e.message === "error" ? "" : e.message); }
    });
    box.addEventListener("close", () => { if (blobUrl) URL.revokeObjectURL(blobUrl); box.remove(); });
  }

  // Сертификат рисуется в браузере: SVG → canvas → PNG. Имя любой длины подгоняется по ширине.
  async function certificate(name, code) {
    const W = 1600, H = 1131;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const serif = 'Georgia, "Times New Roman", serif', sans = 'system-ui, -apple-system, "Segoe UI", sans-serif';
    const fit = (text, max, start, min) => { let size = start; ctx.font = `${size}px ${serif}`; while (ctx.measureText(text).width > max && size > min) { size -= 2; ctx.font = `${size}px ${serif}`; } return size; };
    let lines = [name];
    let size = fit(name, 1240, 104, 56);
    ctx.font = `${size}px ${serif}`;
    if (ctx.measureText(name).width > 1240) {
      const words = name.split(/\s+/);
      let best = [name, ""], diff = Infinity;
      for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(" "), b = words.slice(i).join(" "); const d = Math.abs(a.length - b.length); if (d < diff) { diff = d; best = [a, b]; } }
      if (!best[1]) { const mid = Math.ceil(name.length / 2); best = [name.slice(0, mid) + "-", name.slice(mid)]; }
      lines = best;
      size = Math.min(fit(lines[0], 1240, 84, 34), fit(lines[1], 1240, 84, 34));
    }
    ctx.fillStyle = "#121820"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W * .2, H * .15, 40, W * .2, H * .15, W * .9);
    g.addColorStop(0, "rgba(232,172,140,.22)"); g.addColorStop(1, "rgba(232,172,140,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e8ac8c"; ctx.lineWidth = 3; ctx.strokeRect(48, 48, W - 96, H - 96);
    ctx.strokeStyle = "rgba(232,172,140,.35)"; ctx.lineWidth = 1; ctx.strokeRect(66, 66, W - 132, H - 132);
    // знак D
    ctx.save(); ctx.translate(W / 2 - 40, 120); ctx.scale(1.25, 1.25);
    ctx.fillStyle = "#e8ac8c"; ctx.beginPath(); ctx.moveTo(8, 6); ctx.lineTo(28, 6); ctx.bezierCurveTo(46, 6, 58, 16, 58, 32); ctx.bezierCurveTo(58, 48, 46, 58, 28, 58); ctx.lineTo(8, 58); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#121820"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(24.5, 16); ctx.lineTo(24.5, 43.5); ctx.lineTo(42, 43.5); ctx.stroke(); ctx.restore();
    ctx.textAlign = "center"; ctx.fillStyle = "#e8ac8c";
    ctx.font = `600 26px ${sans}`; ctx.fillText((ru ? "СЕРТИФИКАТ ИССЛЕДОВАТЕЛЯ" : "EXPLORER CERTIFICATE").split("").join(String.fromCharCode(8202)), W / 2, 270);
    ctx.fillStyle = "#c4c8cd"; ctx.font = `30px ${sans}`;
    ctx.fillText(ru ? "Настоящим подтверждается, что" : "This certifies that", W / 2, 360);
    ctx.fillStyle = "#f3ede2";
    ctx.font = `${size}px ${serif}`;
    if (lines.length === 1) ctx.fillText(lines[0], W / 2, 500);
    else { ctx.fillText(lines[0], W / 2, 470); ctx.fillText(lines[1], W / 2, 470 + size * 1.08); }
    ctx.fillStyle = "#e8ac8c"; ctx.fillRect(W / 2 - 160, 580, 320, 3);
    ctx.fillStyle = "#c4c8cd"; ctx.font = `30px ${sans}`;
    ctx.fillText(ru ? `нашёл(ла) ${store.length} секретов на сайте Devlarion` : `found ${store.length} secrets on the Devlarion website`, W / 2, 660);
    ctx.fillText(ru ? "и получает скидку 5% на первый проект и бесплатный аудит — по согласованию" : "and receives 5% off a first project and a free audit, by agreement", W / 2, 710);
    ctx.textAlign = "left"; ctx.fillStyle = "#aeb4ba"; ctx.font = `24px ${sans}`;
    ctx.fillText((ru ? "Дата: " : "Date: ") + new Date().toLocaleDateString(ru ? "ru-RU" : "en-GB"), 130, H - 150);
    ctx.fillText((ru ? "Код: " : "Code: ") + code, 130, H - 112);
    ctx.textAlign = "right";
    ctx.fillStyle = "#f3ede2"; ctx.font = `italic 40px ${serif}`; ctx.fillText(ru ? "Илья Ларионов" : "Ilia Larionov", W - 130, H - 150);
    ctx.fillStyle = "#aeb4ba"; ctx.font = `24px ${sans}`; ctx.fillText(ru ? "основатель Devlarion · devlarion.ru" : "founder of Devlarion · devlarion.ru", W - 130, H - 112);
    return new Promise(r => canvas.toBlob(r, "image/png"));
  }
  window.devlarionCertificate = certificate;

  // Послание тем, кто открыл консоль.
  try {
    console.log("%cDevlarion", "font:700 28px Georgia,serif;color:#e8ac8c");
    console.log(ru ? "Сайт без фреймворков: статический генератор на Node, чистый CSS и немного JS. Секретов на сайте девять. Подсказка: попробуйте что-нибудь напечатать." : "No frameworks: a Node static generator, plain CSS and a little JS. There are nine secrets on the site. Hint: try typing something.");
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

})();

/* Мега-меню по наведению, плавающие кнопки не заезжают на подвал, знак в подвале раскрывается в слово. */
(() => {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const nav = document.querySelector(".bar .services-nav");
  if (nav && fine) {
    let timer;
    const place = () => {
      const panel = nav.querySelector(".services-nav-links");
      nav.style.setProperty("--menu-x", "-.8rem");
      const r = panel.getBoundingClientRect();
      const over = r.right - (innerWidth - 16);
      if (over > 0) nav.style.setProperty("--menu-x", `calc(-.8rem - ${Math.ceil(over)}px)`);
    };
    nav.addEventListener("mouseenter", () => { clearTimeout(timer); if (!nav.open) { nav.open = true; place(); } });
    nav.addEventListener("mouseleave", () => { timer = setTimeout(() => { nav.open = false; }, 220); });
    nav.addEventListener("toggle", () => { if (nav.open) place(); });
  }

  const footer = document.querySelector("body > footer");
  if (footer && "IntersectionObserver" in window) {
    const floating = () => document.querySelectorAll(".shop-fab, .dl-top");
    new IntersectionObserver(([entry]) => {
      for (const el of floating()) el.classList.toggle("shop-hide", entry.isIntersecting);
    }, { rootMargin: "0px 0px -40px 0px" }).observe(footer);
  }

  const mark = document.querySelector(".dl-footer-mark");
  if (mark && !mark.querySelector(".dl-footer-word")) {
    const word = document.createElement("span");
    word.className = "dl-footer-word";
    word.setAttribute("aria-hidden", "true");
    [..."evlarion"].forEach((ch, i) => { const s = document.createElement("span"); s.textContent = ch; s.style.setProperty("--i", i); word.append(s); });
    mark.append(word);
    mark.tabIndex = 0;
    mark.setAttribute("aria-label", "Devlarion");
  }
})();

/* Карта услуг: поиск раскрывает нужные ветки. Кадры с пометкой data-theme-frame подстраиваются под тему. */
(() => {
  const tree = document.querySelector('[data-svc]');
  if (tree) {
    const input = tree.querySelector('[data-svc-search]'), none = tree.querySelector('[data-svc-none]');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let total = 0;
      tree.querySelectorAll('.svc-branch').forEach(b => {
        let shown = 0;
        b.querySelectorAll('.svc-leaves li').forEach(li => { const ok = !q || li.textContent.toLowerCase().includes(q) || b.querySelector('summary').textContent.toLowerCase().includes(q); li.hidden = !ok; if (ok) shown++; });
        b.hidden = !shown; total += shown;
        if (q) b.querySelector('details').open = shown > 0;
      });
      none.hidden = total > 0;
    });
  }
  const frames = document.querySelectorAll('img[data-theme-frame]');
  if (!frames.length) return;
  const themeOf = () => { const t = document.documentElement.dataset.theme; if (t === 'copper') return 'copper-light'; if (['midnight', 'sage', 'bordeaux'].includes(t)) return t; return matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'copper-light'; };
  const apply = () => frames.forEach(img => { const base = img.src.replace(/\/photos\/.*$/, '/photos/'); img.src = base + 'themes/' + themeOf() + '/' + img.dataset.themeFrame + '.jpg'; });
  apply();
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
