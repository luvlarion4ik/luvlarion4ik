(() => {
  const key = 'devlarion-style';
  const { body } = document;
  const onHome = body.hasAttribute('data-version-home');
  const motionUrl = body.dataset.motionUrl;
  const prompt = document.querySelector('[data-version-prompt]');
  const params = new URLSearchParams(location.search);
  let choice;
  let timer;

  try { choice = localStorage.getItem(key); } catch {}
  if (!['classic', 'motion', 'dismissed'].includes(choice)) choice = null;

  function endPrompt() {
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    if (prompt) prompt.hidden = true;
  }

  function save(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch {}
    endPrompt();
  }

  if (onHome && params.has('classic')) save('classic');
  if (onHome && choice === 'motion' && !location.hash) {
    location.replace(motionUrl);
    return;
  }

  document.addEventListener('click', event => {
    const control = event.target.closest('[data-site-version]');
    if (!control) return;
    const value = control.dataset.siteVersion;
    const fromPrompt = prompt?.contains(control);
    save(value);
    if (value !== 'motion' && fromPrompt && event.detail === 0) {
      document.getElementById('theme')?.focus({ preventScroll: true });
    }
  });

  function showPrompt() {
    if (choice || !prompt) return;
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    prompt.hidden = false;
  }

  function onScroll() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    if (distance > 0 && window.scrollY / distance >= 0.3) showPrompt();
  }

  if (onHome && !choice) {
    timer = setTimeout(showPrompt, 4000);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
