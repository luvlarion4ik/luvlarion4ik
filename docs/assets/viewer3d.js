// Ленивая загрузка 3D: модуль Three.js подгружается, только когда блок появляется на экране.
(() => {
  const base = (document.currentScript?.src || '').replace(/viewer3d\.js.*$/, 'models/viewer.js');
  let mod = null;
  const load = () => (mod ??= import(base));
  const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e8ac8c';

  async function mount(box, name) {
    box.classList.add('v3d-loading');
    try {
      const { mountViewer } = await load();
      box._viewer?.dispose?.();
      box.querySelector('.v3d-canvas')?.replaceChildren();
      const target = box.querySelector('.v3d-canvas') || box;
      box._viewer = await mountViewer(target, name, { accent: accent(), autoRotate: true });
      if (!box._viewer) box.classList.add('v3d-fallback');
    } catch (e) { box.classList.add('v3d-fallback'); }
    box.classList.remove('v3d-loading');
  }

  // Встроенные просмотрщики с переключателем моделей.
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); mount(e.target, e.target.dataset.model3d); }
  }, { rootMargin: '200px' }) : null;
  for (const box of document.querySelectorAll('[data-model3d]')) {
    io ? io.observe(box) : mount(box, box.dataset.model3d);
    box.parentElement.querySelectorAll('[data-model-pick]').forEach(btn => btn.addEventListener('click', () => {
      box.parentElement.querySelectorAll('[data-model-pick]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      box.dataset.model3d = btn.dataset.modelPick;
      const cap = box.parentElement.querySelector('[data-model-caption]');
      if (cap) cap.textContent = btn.dataset.caption || '';
      mount(box, btn.dataset.modelPick);
    }));
  }

  // Кнопки «Покрутить в 3D» в карточках магазина открывают окно с моделью.
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-open3d]');
    if (!btn) return;
    let dlg = document.querySelector('.v3d-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'v3d-dialog';
      dlg.innerHTML = '<div class="v3d-dialog-card"><div class="v3d-head"><strong data-v3d-title></strong><button type="button" class="v3d-close" aria-label="Закрыть">×</button></div><div class="v3d-box"><div class="v3d-canvas"></div><p class="v3d-hint"></p></div></div>';
      document.body.append(dlg);
      dlg.querySelector('.v3d-close').addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', ev => { if (ev.target === dlg) dlg.close(); });
      dlg.addEventListener('close', () => { const b = dlg.querySelector('.v3d-box'); b._viewer?.dispose?.(); b._viewer = null; });
    }
    dlg.querySelector('[data-v3d-title]').textContent = btn.dataset.title || '';
    dlg.querySelector('.v3d-hint').textContent = document.documentElement.lang === 'ru' ? 'Тяните, чтобы вращать. Колесо — приблизить. Модель схематичная.' : 'Drag to rotate, scroll to zoom. Schematic model.';
    dlg.showModal();
    mount(dlg.querySelector('.v3d-box'), btn.dataset.open3d);
  });
})();
