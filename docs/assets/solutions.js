const featuredOffers = document.querySelector('[data-featured-offers]');

if (featuredOffers) {
  const list = featuredOffers.querySelector('.offer-tabs');
  const tabs = [...list.querySelectorAll('a')];
  const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));

  function selectOffer(index, updateUrl = false) {
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[tabIndex].hidden = !selected;
    });
    if (updateUrl) history.replaceState(null, '', tabs[index].hash);
  }

  function selectLinkedOffer() {
    const index = tabs.findIndex(tab => tab.hash === location.hash);
    if (index < 0) return false;
    selectOffer(index);
    featuredOffers.scrollIntoView();
    return true;
  }

  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;

    tab.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectOffer(index, true);
    });
    tab.addEventListener('keydown', event => {
      const last = tabs.length - 1;
      const destination = {
        ArrowLeft: index === 0 ? last : index - 1,
        ArrowRight: index === last ? 0 : index + 1,
        Home: 0,
        End: last,
        ' ': index,
      }[event.key];
      if (destination === undefined) return;
      event.preventDefault();
      selectOffer(destination, true);
      tabs[destination].focus();
    });
  });

  list.setAttribute('role', 'tablist');
  featuredOffers.dataset.offersEnhanced = 'true';
  if (!selectLinkedOffer()) selectOffer(0);
  window.addEventListener('hashchange', selectLinkedOffer);
}

const companySolutions = document.querySelector('[data-company-solutions]');

if (companySolutions) {
  const desktop = matchMedia('(min-width: 1024px)');
  const tabList = companySolutions.querySelector('[role="tablist"]');
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const panels = [...companySolutions.querySelectorAll('[data-company-panel]')];
  const summaries = panels.map(panel => panel.querySelector('summary'));
  const ids = new Set(panels.map(panel => panel.dataset.companyPanel));

  function readHash() {
    const match = location.hash.match(/^#(?:solutions=|solution-)([a-z-]+)$/);
    return match && ids.has(match[1]) ? match[1] : null;
  }

  let current = readHash();

  function updateHash(id) {
    const url = new URL(location.href);
    url.hash = id ? `solutions=${id}` : 'companies';
    history.replaceState(null, '', url);
  }

  function render() {
    const active = current || (desktop.matches ? panels[0].dataset.companyPanel : null);
    tabList.hidden = !desktop.matches;
    panels.forEach((panel, index) => {
      const selected = panel.dataset.companyPanel === active;
      const content = panel.querySelector('.solution-content');
      const tab = tabs[index];

      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panel.hidden = desktop.matches && !selected;
      panel.open = desktop.matches || selected;
      summaries[index].hidden = desktop.matches;
      panel.querySelector('.solution-desktop-title').hidden = !desktop.matches;

      if (desktop.matches) {
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', tab.id);
        content.tabIndex = 0;
      } else {
        content.removeAttribute('role');
        content.removeAttribute('aria-labelledby');
        content.removeAttribute('tabindex');
      }
    });
  }

  function select(id, write = true) {
    current = id;
    if (write) updateHash(id);
    render();
  }

  function moveToDeepLink() {
    const id = readHash();
    select(id, false);
    if (id) {
      const target = desktop.matches ? companySolutions : panels.find(panel => panel.dataset.companyPanel === id);
      target.scrollIntoView();
    }
  }

  function focusTab(index) {
    const tab = tabs[index];
    select(tab.dataset.solution);
    tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.solution));
    tab.addEventListener('keydown', event => {
      const last = tabs.length - 1;
      const destination = {
        ArrowUp: index > 0 ? index - 1 : last,
        ArrowDown: index === last ? 0 : index + 1,
        Home: 0,
        End: last,
      }[event.key];
      if (destination !== undefined) {
        event.preventDefault();
        focusTab(destination);
      }
    });
  });

  summaries.forEach((summary, index) => {
    const id = panels[index].dataset.companyPanel;
    summary.addEventListener('click', event => {
      event.preventDefault();
      const opening = !panels[index].open;
      select(opening ? id : null);
      if (opening) summary.scrollIntoView({ block: 'nearest' });
    });
  });

  companySolutions.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const panel = event.target.closest('[data-company-panel]');
    if (!panel || !panel.open) return;

    event.preventDefault();
    const index = panels.indexOf(panel);
    if (desktop.matches) tabs[index].focus();
    else {
      select(null);
      summaries[index].focus();
    }
  });

  desktop.addEventListener('change', render);
  window.addEventListener('hashchange', () => {
    if (readHash()) moveToDeepLink();
    else if (location.hash === '#companies') select(null, false);
  });
  companySolutions.dataset.enhanced = 'true';
  moveToDeepLink();
}
