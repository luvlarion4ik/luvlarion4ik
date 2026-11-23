(() => {
  const hero = document.querySelector('.hero');
  const mobileBar = document.querySelector('.mobilebar');
  if (hero && mobileBar && 'IntersectionObserver' in window) {
    const headerHeight = document.querySelector('header').offsetHeight;
    const observer = new IntersectionObserver(([entry]) => {
      mobileBar.classList.toggle('is-visible', entry.boundingClientRect.bottom <= headerHeight);
    }, { rootMargin: '-' + headerHeight + 'px 0px 0px' });
    observer.observe(hero);
  }

  const footer = document.querySelector('body > footer');
  if (footer && mobileBar && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      mobileBar.classList.toggle('is-at-footer', entry.isIntersecting);
    }, { threshold: 0.15 }).observe(footer);
  }

  const filter = document.querySelector('[data-case-filter]');
  if (filter) {
    const articles = [...document.querySelectorAll('[data-case-people]')];
    const groups = [...document.querySelectorAll('[data-case-group]')];
    const options = Array.from(filter.querySelectorAll('input'));
    const update = () => {
      const { hash } = location;
      const id = hash.startsWith('#people=') ? hash.slice('#people='.length) : '';
      const selected = options.find(option => option.value === id) ?? options[0];
      selected.checked = true;
      articles.forEach(article => {
        article.hidden = selected.value !== '' && !article.dataset.casePeople.split(' ').includes(selected.value);
      });
      groups.forEach(group => { group.hidden = !group.querySelector('article:not([hidden])'); });
    };
    filter.hidden = false;
    filter.addEventListener('change', event => {
      if (!options.includes(event.target)) return;
      const id = event.target.value;
      history.replaceState(history.state, '', id ? '#people=' + id : '#work');
      update();
    });
    addEventListener('hashchange', update);
    update();
  }

  const share = document.getElementById('share-options');
  if (!share) return;

  let sharedUrl;
  let trigger;
  const field = share.querySelector('[data-share-field]');
  const fieldLabel = field.closest('label');
  const confirmation = share.querySelector('[data-share-status]');
  const showManual = () => {
    fieldLabel.hidden = false;
    field.focus();
    field.select();
  };

  function showShareOptions() {
    const encoded = encodeURIComponent(sharedUrl.href);
    share.querySelector('[data-share-telegram]').href = 'https://t.me/share/url?url=' + encoded;
    share.querySelector('[data-share-vk]').href = 'https://vk.com/share.php?url=' + encoded;
    share.querySelector('[data-share-email]').href = 'mailto:?body=' + encoded;
    field.value = sharedUrl.href;
    fieldLabel.hidden = true;
    confirmation.textContent = '';
    share.showModal();
  }

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-share]');
    if (!button) return;

    trigger = button;
    const customUrl = button.dataset.shareUrl;
    sharedUrl = customUrl ? new URL(customUrl, location.href) : new URL(location.pathname, location.origin);
    if (sharedUrl.origin !== location.origin) return;
    if (!customUrl) {
      sharedUrl.hash = button.dataset.shareAnchor || '';
      sharedUrl.searchParams.set('utm_source', 'share');
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: sharedUrl.href });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    showShareOptions();
  });

  share.querySelector('[data-share-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl.href);
      confirmation.textContent = document.documentElement.lang === 'ru' ? 'Ссылка скопирована.' : 'Link copied.';
    } catch {
      showManual();
    }
  });
  share.addEventListener('close', () => {
    if (trigger?.closest('dialog:not([open])')) document.querySelector('[data-menu]').focus();
    else trigger?.focus();
  });
})();
