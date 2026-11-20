/*! devlarion-logo — веб-компонент логотипа Devlarion (знак, слово, знак+слово) с hover-анимацией.
 * Подключение:  <script src="/assets/devlarion-logo.js" defer></script>
 * Использование: <devlarion-logo variant="full|mark|word" height="40" intro></devlarion-logo>
 * Цвет: из CSS `color` или --logo-color. Размер можно переопределить через --logo-height.
 * При наведении, клавиатурном фокусе и касании ссылки проигрывается анимация логотипа.
 * Движение отключается при prefers-reduced-motion.
 * Шрифт слова: Golos Text 600, уже в контурах. Знак: D с вырезом L. */
(() => {
  const GLYPHS = [[0.0, "M81 0V-700H324Q430 -700 505 -662Q580 -624 620 -549Q659 -475 659 -365V-345Q659 -233 618 -156Q577 -79 500 -40Q422 0 314 0ZM230 -124H304Q359 -124 404 -145Q449 -166 476 -214Q504 -263 504 -345V-365Q504 -443 479 -490Q454 -536 410 -556Q367 -576 314 -576H230Z"], [26.22, "M300 12Q228 12 167 -18Q107 -47 71 -108Q35 -168 35 -260V-280Q35 -368 70 -426Q104 -484 162 -513Q220 -542 290 -542Q415 -542 480 -476Q545 -410 545 -285V-229H170Q172 -182 190 -153Q209 -123 238 -110Q267 -96 300 -96Q351 -96 377 -111Q403 -126 414 -155H535Q519 -72 456 -30Q393 12 300 12ZM295 -434Q264 -434 235 -424Q206 -414 189 -388Q172 -363 170 -321H417Q416 -366 399 -391Q383 -415 356 -425Q329 -434 295 -434Z"], [47.5, "M234 0 10 -530H158L302 -164L433 -530H570L366 0Z"], [68.78, "M240 6Q179 6 140 -10Q102 -27 84 -66Q66 -106 66 -177V-700H197V-193Q197 -142 212 -124Q226 -106 269 -106Q280 -106 288 -106Q296 -107 304 -108V2Q299 4 287 5Q275 6 262 6Q249 6 240 6Z"], [80.56, "M219 12Q162 12 122 -10Q82 -31 61 -69Q40 -107 40 -155Q40 -235 88 -275Q135 -315 230 -315H388V-340Q388 -392 364 -413Q341 -434 290 -434Q245 -434 225 -418Q205 -403 202 -380H70Q73 -426 100 -462Q126 -499 176 -520Q225 -542 295 -542Q363 -542 414 -522Q464 -502 492 -457Q520 -413 520 -338V-135Q520 -93 522 -62Q523 -30 527 0H404Q400 -22 399 -34Q399 -45 399 -68Q378 -36 333 -12Q288 12 219 12ZM260 -90Q292 -90 322 -102Q351 -113 370 -137Q388 -162 388 -200V-225H255Q217 -225 195 -207Q174 -190 174 -160Q174 -128 196 -109Q218 -90 260 -90Z"], [101.65, "M61 0V-530H181V-451Q192 -474 211 -494Q230 -514 258 -528Q286 -542 320 -542Q339 -542 352 -540Q366 -538 370 -536V-419Q360 -423 344 -426Q329 -430 303 -430Q263 -430 239 -413Q214 -396 203 -368Q192 -341 192 -309V0Z"], [115.71, "M71 0V-530H202V0ZM136 -581Q101 -581 79 -603Q56 -625 56 -660Q56 -695 79 -717Q101 -739 136 -739Q171 -739 194 -717Q216 -695 216 -660Q216 -625 194 -603Q171 -581 136 -581Z"], [125.25, "M300 12Q228 12 167 -18Q107 -47 71 -108Q35 -168 35 -260V-280Q35 -367 71 -425Q107 -483 167 -512Q228 -542 300 -542Q372 -542 433 -512Q493 -483 529 -425Q565 -367 565 -280V-260Q565 -170 529 -110Q493 -49 433 -18Q372 12 300 12ZM300 -100Q338 -100 367 -118Q397 -135 414 -171Q431 -207 431 -260V-280Q431 -329 414 -362Q397 -395 367 -413Q338 -430 300 -430Q262 -430 233 -413Q203 -395 186 -362Q169 -329 169 -280V-260Q169 -206 186 -171Q203 -135 233 -118Q262 -100 300 -100Z"], [147.29, "M61 0V-530H181V-452Q201 -488 243 -515Q285 -542 358 -542Q455 -542 503 -490Q550 -438 550 -340V0H418V-310Q418 -369 393 -400Q369 -430 310 -430Q268 -430 242 -413Q216 -396 204 -369Q192 -342 192 -310V0Z"]];
  const D = "M8 6h20c18 0 30 10 30 26S46 58 28 58H8V6Z";
  const SC = 0.038;            // 38 px кегль / 1000 upm
  const CSS = `
:host{display:inline-block;line-height:0;color:var(--logo-color,currentColor);height:var(--logo-height,var(--h,40px));aspect-ratio:var(--ar);cursor:inherit;-webkit-tap-highlight-color:transparent}
svg{height:100%;width:auto;display:block;overflow:visible}
.carve,.wipe,.wwipe{stroke-dasharray:1;stroke-dashoffset:0}
.dwrap{transform-box:fill-box;transform-origin:50% 50%}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes hop{0%{transform:translateY(0)}38%{transform:translateY(-95px)}100%{transform:translateY(0)}}
@keyframes settle{0%{transform:scale(1)}35%{transform:scale(1.045)}100%{transform:scale(1)}}
@keyframes slide{from{transform:translateX(-5px)}to{transform:none}}
:host([data-logo-motion]) .carve{animation:draw .55s cubic-bezier(.5,0,.2,1)}
:host([data-logo-motion]) .dwrap{animation:settle .55s cubic-bezier(.3,.7,.3,1)}
:host([data-logo-motion]) .gl{animation:hop .5s cubic-bezier(.3,.7,.3,1) calc(var(--wd,0ms) + var(--i) * 32ms)}
.intro .wipe{animation:draw .7s cubic-bezier(.3,.6,.2,1) .1s backwards}
.intro .carve{animation:draw .5s cubic-bezier(.5,0,.2,1) .55s backwards}
.intro .wwipe{animation:draw .6s cubic-bezier(.3,.6,.2,1) .8s backwards}
.intro .wslide{animation:slide .6s cubic-bezier(.3,.6,.2,1) .8s backwards}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
  const V = {                    // viewBox, соотношение сторон
    mark: ["8 6 50 52", 50 / 52],
    word: ["0 0 170.3 34", 170.3 / 34],
    full: ["8 6 235.3 52", 235.3 / 52],
  };
  let uid = 0;
  class DevlarionLogo extends HTMLElement {
    static get observedAttributes() { return ["variant", "height", "intro"]; }

    connectedCallback() {
      this.render();
      const trigger = this.closest("a, button") || this;
      this.events = new AbortController();
      const options = { signal: this.events.signal };
      trigger.addEventListener("pointerenter", event => {
        if (event.pointerType === "mouse") this.play();
      }, options);
      trigger.addEventListener("focusin", event => {
        if (event.target.matches(":focus-visible")) this.play();
      }, options);
      trigger.addEventListener("pointerdown", event => {
        if (event.pointerType !== "mouse" && event.isPrimary) this.play();
      }, options);
    }

    disconnectedCallback() {
      this.events?.abort();
      clearTimeout(this.motionTimer);
      this.removeAttribute("data-logo-motion");
    }

    attributeChangedCallback(name, before, after) {
      if (this.isConnected && this.shadowRoot && before !== after) this.render();
    }

    play() {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      this.removeAttribute("data-logo-motion");
      // Flush the previous style so a second interaction can replay the animation.
      void this.offsetWidth;
      this.setAttribute("data-logo-motion", "");
      clearTimeout(this.motionTimer);
      this.motionTimer = setTimeout(() => this.removeAttribute("data-logo-motion"), 960);
    }

    render() {
      const variant = this.getAttribute("variant");
      const v = Object.hasOwn(V, variant) ? variant : "full";
      const id = "dl" + ++uid;
      const [vb, ar] = V[v];
      const height = Number(this.getAttribute("height"));
      const h = Number.isFinite(height) && height > 0 ? height : 40;
      this.style.setProperty("--h", h + "px");
      this.style.setProperty("--ar", ar);
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", "Devlarion");
      const hasMark = v !== "word", hasWord = v !== "mark";
      const wx = v === "full" ? 73 : 0, base = v === "full" ? 45.3 : 30;
      let defs = "", body = "";
      if (hasMark) {
        defs += `<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">` +
          `<path class="wipe" pathLength="1" d="M0 32H64" stroke="#fff" stroke-width="70" fill="none"/>` +
          `<path class="carve" pathLength="1" d="M24.5 16V43.5H42" stroke="#000" stroke-width="9" fill="none"/></mask>`;
        body += `<g mask="url(#${id}m)"><path class="dwrap" fill="currentColor" d="${D}"/></g>`;
      }
      if (hasWord) {
        defs += `<mask id="${id}w" maskUnits="userSpaceOnUse" x="${wx - 4}" y="-10" width="182" height="80">` +
          `<path class="wwipe" pathLength="1" d="M${wx - 4} 32H${wx + 175}" stroke="#fff" stroke-width="120" fill="none"/></mask>`;
        const wd = v === "full" ? 140 : 0;
        const gl = GLYPHS.map(([x, d], i) =>
          `<g transform="translate(${(wx + x).toFixed(2)} ${base}) scale(${SC})"><path class="gl" style="--i:${i};--wd:${wd}ms" fill="currentColor" d="${d}"/></g>`).join("");
        body += `<g mask="url(#${id}w)"><g class="wslide">${gl}</g></g>`;
      }
      const root = this.shadowRoot || this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${CSS}</style><svg viewBox="${vb}" class="${this.hasAttribute("intro") ? "intro" : ""}" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;
    }
  }
  if (!customElements.get("devlarion-logo")) customElements.define("devlarion-logo", DevlarionLogo);
})();
