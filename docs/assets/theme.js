(() => {
  const storageKey = "devlarion-theme";
  const themes = ["copper", "midnight", "sage"];
  let selected = "copper";
  try {
    const saved = localStorage.getItem(storageKey);
    if (themes.includes(saved)) selected = saved;
  } catch {
    // Private browsing can disable storage. The switch still works on this page.
  }

  const root = document.documentElement;
  root.dataset.theme = selected;

  addEventListener("DOMContentLoaded", () => {
    const group = document.querySelector("[data-theme-control]");
    const choices = [...group.querySelectorAll("[data-theme-choice]")];
    const update = () => {
      root.dataset.theme = selected;
      for (const choice of choices) {
        choice.setAttribute("aria-pressed", String(choice.dataset.themeChoice === selected));
      }
    };

    group.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-theme-choice]");
      if (!choice) return;
      selected = choice.dataset.themeChoice;
      try {
        localStorage.setItem(storageKey, selected);
      } catch {
        // Selection stays available until the user navigates away.
      }
      update();
    });

    update();
    group.hidden = false;
  });
})();
