(() => {
  const system = matchMedia('(prefers-color-scheme: dark)');
  const key = 'devlarion-theme';
  let choice = 'auto';
  try {choice = localStorage.getItem(key) || choice;} catch {}
  function apply() {
    document.documentElement.dataset.theme = choice === 'auto' ? (system.matches ? 'midnight' : 'copper') : choice;
  }
  apply();
  system.addEventListener('change', apply);
  addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector('#theme');
    select.value = choice === 'bordeaux' ? 'auto' : choice;
    select.onchange = () => {
      choice = select.value;
      try {localStorage.setItem(key, choice);} catch {}
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply);
      else apply();
    };
    let clicks = 0;
    document.querySelector('footer .wordmark').addEventListener('click', e => {
      if (!e.detail || !location.href.startsWith(e.currentTarget.href)) return;
      if (++clicks < 5 && !location.hash && location.href === e.currentTarget.href) e.preventDefault();
      if (clicks === 5) {e.preventDefault(); choice = 'bordeaux'; apply(); clicks = 0;}
    });
  });
})();
