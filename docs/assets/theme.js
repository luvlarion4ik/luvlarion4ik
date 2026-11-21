(() => {
  const system = matchMedia('(prefers-color-scheme: dark)');
  const key = 'devlarion-theme';
  const themes = ['auto', 'copper', 'midnight', 'sage'];
  let choice = 'auto';
  try {
    const saved = localStorage.getItem(key);
    if (themes.includes(saved)) choice = saved;
  } catch {}

  function apply() {
    document.documentElement.dataset.theme = choice === 'auto' ? (system.matches ? 'midnight' : 'copper') : choice;
  }
  apply();
  if (system.addEventListener) system.addEventListener('change', apply);
  else system.addListener?.(apply);

  addEventListener('DOMContentLoaded', () => {
    const picker = document.querySelector('.theme-picker');
    if (!picker) return;
    const button = picker.querySelector('button');
    const options = picker.querySelector('#theme-choices');
    picker.querySelector('input[value="' + choice + '"]').checked = true;
    picker.hidden = false;

    function toggle(open, moveFocus = false) {
      options.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open && moveFocus) (picker.querySelector('input:checked') || picker.querySelector('input')).focus();
    }

    button.addEventListener('click', event => toggle(options.hidden, event.detail === 0));
    options.addEventListener('change', event => {
      if (event.target.name !== 'theme-choice') return;
      choice = event.target.value;
      try { localStorage.setItem(key, choice); } catch {}
      apply();
    });
    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !options.hidden) {
        toggle(false);
        button.focus();
      }
    });
    document.addEventListener('focusin', event => {
      if (!options.hidden && !picker.contains(event.target)) toggle(false);
    });
    document.addEventListener('pointerdown', event => {
      if (!picker.contains(event.target) && !options.hidden) toggle(false);
    });

    let clicks = 0;
    document.querySelector('footer .wordmark')?.addEventListener('click', event => {
      if (!event.detail || location.href !== event.currentTarget.href) return;
      if (++clicks <= 5) event.preventDefault();
      if (clicks === 5) {
        choice = 'bordeaux';
        const selected = picker.querySelector('input:checked');
        if (selected) selected.checked = false;
        apply();
        clicks = 0;
      }
    });
  });
})();
