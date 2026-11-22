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
