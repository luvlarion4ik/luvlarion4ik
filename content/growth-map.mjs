import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { esc } from './site.mjs';

const window = {};
runInNewContext(readFileSync(new URL('../docs/assets/growth-map/gm-copy.js', import.meta.url), 'utf8'), { window });
const { copy } = window.DevlarionGM;
export const growthMapText = (lang, key) => copy[lang][key];

export const growthMapAssets = [
  'gm-copy.js', 'gm-catalog.js', 'gm-icons.js', 'gm-engine.js',
  'gm-canvas.js', 'gm-panel.js', 'gm-app.js'
].map(name => 'growth-map/' + name);

const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');

export function renderGrowthMapPreview(lang) {
  const t = key => esc(growthMapText(lang, key));
  const stops = [
    ['traffic', '#8bd3e6'], ['entry', '#aaadf2'], ['process', '#dfa278'],
    ['pay', '#f0ca83'], ['retain', '#97d8ad']
  ];
  return `<svg class="gm-preview-art" viewBox="0 0 560 175" width="560" height="175" role="img" aria-label="${t('intro.eyebrow')}">
    <path class="gm-preview-rail" d="M51 75H509M509 95C509 160 150 160 150 95" fill="none" stroke="#9bd0b1" stroke-opacity=".42" stroke-width="2"/>
    <path class="gm-preview-flow" d="M51 75H509M509 95C509 160 150 160 150 95" fill="none" stroke="#f3dda7" stroke-width="2" stroke-dasharray="2 10"/>
    ${stops.map(([stage, color], index) => {
      const x = 51 + index * 114.5;
      return `<g transform="translate(${x} 75)"><rect x="-43" y="-24" width="86" height="48" rx="10" fill="#252825" stroke="${color}" stroke-opacity=".6"/>
        <circle cy="-3" r="6" fill="${color}"/><path d="M-12 11H12" stroke="${color}" stroke-width="2" stroke-opacity=".55" stroke-linecap="round"/>
        <text y="-39" text-anchor="middle" fill="#f3eee4">${t(stage)}</text></g>`;
    }).join('')}
  </svg>`;
}

export function renderGrowthMapTeaser(lang, home) {
  const t = key => esc(growthMapText(lang, key));
  return `<section id="growth-map-teaser" class="section wrap gm-teaser">
    <div><h2>${t('home.teaser.title')}</h2>
      <p>${t('home.teaser.text')}</p>
      <a class="button" href="${home}growth-map/" data-goal="growthmap_teaser">${t('home.teaser.cta')} <span aria-hidden="true">↗</span></a>
    </div>
    <div class="gm-teaser-art">${renderGrowthMapPreview(lang)}</div>
  </section>`;
}

export function renderGrowthMapPage(lang, { home, tg, icons, estimator, growthMap, region, exchangeRates }) {
  const t = key => esc(growthMapText(lang, key));
  const action = (id, label, icon) => `<button type="button" data-gm-action="${id}" title="${t(label)}" aria-label="${t(label)}">${icon ?? t(label)}</button>`;
  const variants = ['now', 'base', 'boost', 'auto'];
  return `<div class="gm-page">
    <div class="wrap gm-intro">
      <p class="eyebrow">${t('intro.eyebrow')}</p>
      <h1>${t('intro.h1')}</h1>
      <p class="intro">${t('intro.lead')}</p>
      <ol class="gm-intro-steps">
        ${[1, 2, 3].map(index => `<li>${t('intro.step' + index)}</li>`).join('')}
      </ol>
    </div>
    <div class="wrap gm-app ym-hide-content" data-gm-app data-telegram="${esc(tg)}" data-portal="${home}cabinet/" data-phase="choose" hidden>
      <div class="gm-workbench">
        <div class="gm-main">
          <div class="gm-toolbar" data-gm-toolbar>
            <div class="gm-variants" role="group" aria-label="${t('intro.eyebrow')}">
              ${variants.map(key => `<button type="button" data-gm-variant="${key}" aria-pressed="false">${t('v.' + key)}${key === 'boost' ? `<small>${t('v.recommended')}</small>` : ''}</button>`).join('')}
            </div>
            <div class="gm-tools">
              ${action('undo', 'tb.undo', '↶')}
              ${action('redo', 'tb.redo', '↷')}
              ${action('layout', 'tb.layout', icons.layers)}
              ${action('fit', 'tb.fit', '⤢')}
              <div class="gm-zoom">
                ${action('minus', 'tb.zoomOut', '−')}
                <output data-gm-zoom>100%</output>
                ${action('plus', 'tb.zoomIn', '+')}
              </div>
              ${action('3d', 'tb.3d', icons.mini)}
              ${action('list', 'tb.list', '☷')}
              <details class="gm-menu"><summary aria-label="${t('tb.more')}">…</summary><div>
                ${action('import', 'act.import')}
                ${action('reset', 'tb.reset')}
              </div></details>
            </div>
          </div>
          <div class="gm-scene">
            <div class="gm-stage" data-gm-stage tabindex="0" role="application" aria-label="${t('intro.eyebrow')}" aria-describedby="gm-keyboard-help"></div>
            <p class="gm-sr" id="gm-keyboard-help">${t('canvas.keys')}</p>
            <div class="gm-overlay" data-gm-overlay></div>
          </div>
          <div class="gm-economy" data-gm-economy></div>
        </div>
        <aside class="gm-panel" data-gm-panel aria-label="${t('intro.eyebrow')}">
          <div class="gm-panel-content" data-gm-panel-content></div>
          <div class="gm-panel-currency" data-gm-currency hidden>${region}</div>
          <div class="gm-panel-actions" data-gm-actions hidden>
            <button type="button" class="button gm-handoff" data-gm-action="handoff">${icons.telegram}${t('act.handoff')}</button>
            <div class="gm-action-links">
              ${action('download', 'act.download')}
              ${action('share', 'act.share')}
              ${action('save', 'act.cabinet')}
            </div>
          </div>
        </aside>
      </div>
      <div class="gm-feedback" hidden data-gm-feedback>
        <p role="status" data-gm-status></p>
        <input type="url" data-gm-share-field aria-label="${t('act.share')}" readonly hidden>
        <a href="${home}cabinet/" data-gm-portal hidden>${t('act.openPortal')}</a>
        <button type="button" data-gm-action="dismiss" aria-label="${t('tb.close')}">×</button>
      </div>
      <input type="file" data-gm-import accept="application/json,.json" hidden>
    </div>
    <noscript><section class="wrap gm-no-script">
      <h2>${t('mode.example')}</h2>${renderGrowthMapPreview(lang)}
      <p>${t('act.noScript')}</p>
      <a class="button" href="${esc(tg)}">${t('act.handoff')}</a>
    </section></noscript>
    <script type="application/json" id="gm-pricing">${json(estimator)}</script>
    <script type="application/json" id="gm-config">${json(growthMap ?? {})}</script>
    <script type="application/json" id="gm-fx">${json(exchangeRates)}</script>
  </div>`;
}
