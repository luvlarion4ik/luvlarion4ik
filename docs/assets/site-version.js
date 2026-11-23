(() => {
  const key = 'devlarion-style';
  const { body } = document;

  function save(value) {
    try { localStorage.setItem(key, value); } catch {}
  }

  if (body.hasAttribute('data-version-home')) {
    if (new URLSearchParams(location.search).has('classic')) {
      save('classic');
    } else if (!location.hash && body.dataset.motionUrl) {
      let choice;
      try { choice = localStorage.getItem(key); } catch {}
      if (choice === 'motion') {
        location.replace(body.dataset.motionUrl);
        return;
      }
    }
  }

  document.addEventListener('click', event => {
    const value = event.target.closest('[data-site-version]')?.dataset.siteVersion;
    if (value === 'classic' || value === 'motion') save(value);
  });
})();
