(() => {
  const orb = document.querySelector(".aura-orb");
  if (!orb) return;

  const stage = orb.querySelector(".aura-orb-stage");
  const image = stage.querySelector("img");
  const caption = orb.querySelector("[data-orb-caption]");
  const states = orb.querySelector("[data-orb-states]");
  const picker = orb.querySelector("select");
  const download = orb.querySelector("[data-orb-download]");
  const toggle = orb.querySelector("[data-orb-toggle]");
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let playing = !preference.matches;
  let visible = !("IntersectionObserver" in window);
  let character = "classic";
  let request = 0;
  let optInImage;

  async function renderPlayback() {
    const version = ++request;
    const url = download.href;
    const still = picker.value === "orb/stealth";
    toggle.hidden = still;
    toggle.textContent = playing ? toggle.dataset.stop : toggle.dataset.play;
    const animate = playing && visible && !document.hidden && !still;
    let source = url + (animate ? "" : "#still");

    // The original SVGs honour the OS preference internally. Only a visitor’s
    // explicit play action may enable their keyframes on a reduced-motion device.
    if (animate && preference.matches) {
      if (optInImage?.url !== url) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("SVG unavailable");
          const svg = (await response.text()).replace("(prefers-reduced-motion: no-preference)", "all");
          if (version !== request) return;
          if (optInImage) URL.revokeObjectURL(optInImage.src);
          optInImage = { url, src: URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })) };
        } catch {
          if (version !== request) return;
          playing = false;
          renderPlayback();
          return;
        }
      }
      source = optInImage.src;
    }
    if (image.src !== source) image.src = source;
  }

  function selectPreview() {
    const option = picker.selectedOptions[0];
    const [collection, file] = option.value.split("/");
    const [prefix, nativeState] = file.split("-");
    if (collection === "orb" && nativeState) character = prefix;
    for (const radio of states.elements) {
      radio.checked = collection === "orb" && radio.value === (nativeState || prefix);
    }
    caption.textContent = option.parentElement.label + " · " + option.textContent;
    download.href = orb.dataset.motionBase + option.value + ".svg";
    image.width = collection === "orb" ? 224 : 120;
    image.height = collection === "orb" ? 224 : 96;
    renderPlayback();
  }

  function revealPreview() {
    // The site reserves scroll padding for its sticky header and mobile CTA.
    stage.scrollIntoView({ block: "nearest", behavior: "instant" });
  }

  states.addEventListener("change", event => {
    const state = event.target.value;
    const shared = state === "streaming" || state === "stealth";
    picker.value = "orb/" + (shared ? state : character + "-" + state);
    selectPreview();
    revealPreview();
  });
  picker.addEventListener("change", () => {
    selectPreview();
    revealPreview();
  });
  toggle.addEventListener("click", () => {
    playing = !playing;
    if (playing) revealPreview();
    renderPlayback();
  });
  preference.addEventListener("change", () => {
    playing = !preference.matches;
    renderPlayback();
  });
  document.addEventListener("visibilitychange", renderPlayback);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      renderPlayback();
    }).observe(image);
  }

  states.hidden = false;
  orb.querySelector("[data-orb-picker]").hidden = false;
  selectPreview();
})();
