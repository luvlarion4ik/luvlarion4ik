(() => {
  const gallery = document.getElementById("aura-screens");
  if (!gallery) return;

  const controls = document.querySelector(".aura-gallery-controls");
  const previous = controls.querySelector('[data-step="-1"]');
  const next = controls.querySelector('[data-step="1"]');
  const range = controls.querySelector("output");
  const cards = Array.from(gallery.children);
  const end = () => gallery.scrollWidth - gallery.clientWidth;

  function updateControls() {
    const stride = cards[1].offsetLeft - cards[0].offsetLeft;
    const first = 1 + Math.round(gallery.scrollLeft / stride);
    const visible = Math.round(gallery.clientWidth / stride);
    const last = Math.min(cards.length, first + visible - 1);
    const label = (first === last ? first : first + "–" + last) + " / " + cards.length;
    if (range.value !== label) range.value = label;
    previous.disabled = gallery.scrollLeft <= 1;
    next.disabled = gallery.scrollLeft >= end() - 1;
  }

  function move(step) {
    const offsets = cards.map(card => card.offsetLeft);
    const target = step > 0
      ? offsets.find(offset => offset > gallery.scrollLeft + 2)
      : offsets.reverse().find(offset => offset < gallery.scrollLeft - 2);
    gallery.scrollTo({left: target ?? (step > 0 ? end() : 0)});
  }

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  gallery.addEventListener("keydown", event => {
    if (event.target !== gallery || event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case "ArrowLeft": move(-1); break;
      case "ArrowRight": move(1); break;
      case "Home": gallery.scrollTo({left: 0}); break;
      case "End": gallery.scrollTo({left: end()}); break;
      default: return;
    }
    event.preventDefault();
  });
  gallery.addEventListener("scroll", updateControls, {passive: true});
  new ResizeObserver(updateControls).observe(gallery);
  updateControls();
  controls.hidden = false;
})();
