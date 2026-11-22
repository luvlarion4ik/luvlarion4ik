// Unique hero artwork for every segment and topic page.
// Only theme variables are used, so copper / midnight / sage all work.
const frame = (label, inner) => `<svg class="page-art-svg" viewBox="0 0 480 360" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="pa-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
  <circle class="pa-ring" cx="240" cy="180" r="168" fill="none" stroke="var(--rule)" stroke-dasharray="3 9"/>
  <circle class="pa-ring pa-ring-2" cx="240" cy="180" r="118" fill="none" stroke="var(--rule)"/>
  ${inner}
</svg>`;

const card = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="var(--paper)" stroke="var(--rule)" ${extra}/>`;
const line = (x, y, w, o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3.5" fill="var(--sub)" opacity="${0.28 * o}"/>`;
const dot = (x, y, r = 5, c = 'var(--accent)') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;

const art = {
  'self-employed/': ['Телефон с заявками клиентов', 'Phone with client enquiries', `
    <g class="pa-float">
      <rect x="170" y="36" width="140" height="288" rx="26" fill="var(--surface)" stroke="var(--ink)" stroke-opacity=".55" stroke-width="2"/>
      <rect x="226" y="46" width="28" height="6" rx="3" fill="var(--rule)"/>
      <rect x="184" y="68" width="112" height="34" rx="12" fill="var(--paper)" stroke="var(--rule)"/>${line(194, 80, 70)}${line(194, 91, 40, .7)}
      <rect x="196" y="116" width="100" height="34" rx="12" fill="var(--accent)" opacity=".92"/><rect x="206" y="128" width="64" height="7" rx="3.5" fill="var(--paper)" opacity=".85"/>
      <rect x="184" y="164" width="112" height="34" rx="12" fill="var(--paper)" stroke="var(--rule)"/>${line(194, 176, 84)}${line(194, 187, 52, .7)}
      <rect x="184" y="212" width="112" height="46" rx="12" fill="var(--paper)" stroke="var(--rule)"/>${line(194, 224, 60)}<rect x="194" y="238" width="52" height="12" rx="6" fill="var(--accent)" opacity=".8"/>
      <rect x="196" y="282" width="88" height="26" rx="13" fill="var(--accent)"/><rect x="214" y="292" width="52" height="6" rx="3" fill="var(--paper)"/>
    </g>
    <g class="pa-drift">${card(300, 74, 128, 52)}${dot(322, 100, 9)}<path d="M318 100l3 3 6-7" stroke="var(--paper)" stroke-width="2" fill="none" stroke-linecap="round"/>${line(340, 92, 70)}${line(340, 106, 44, .7)}</g>
    <g class="pa-drift pa-d2">${card(52, 210, 124, 52)}<rect x="66" y="224" width="44" height="22" rx="8" fill="var(--accent)" opacity=".85"/>${line(120, 228, 42)}${line(120, 242, 28, .7)}</g>`],

  'business/': ['Сайт, CRM и бот в одном окне', 'Website, CRM and bot in one view', `
    <g class="pa-float">
      ${card(70, 52, 340, 256)}
      <rect x="70" y="52" width="340" height="30" rx="14" fill="var(--surface)" stroke="var(--rule)"/>${dot(90, 67, 4, 'var(--rule)')}${dot(104, 67, 4, 'var(--rule)')}${dot(118, 67, 4, 'var(--accent)')}
      ${[0, 1, 2].map(i => `<g><rect x="${88 + i * 108}" y="98" width="96" height="196" rx="10" fill="var(--surface)" stroke="var(--rule)"/>
        <rect x="${96 + i * 108}" y="108" width="40" height="7" rx="3.5" fill="var(--ink)" opacity=".5"/>
        ${[0, 1, 2].slice(0, 3 - i).map(j => `<rect x="${96 + i * 108}" y="${126 + j * 52}" width="80" height="42" rx="8" fill="var(--paper)" stroke="var(--rule)"/>${line(104 + i * 108, 136 + j * 52, 52)}${line(104 + i * 108, 150 + j * 52, 34, .7)}${dot(166 + i * 108, 152 + j * 52, 4)}`).join('')}</g>`).join('')}
      <g class="pa-slide"><rect x="96" y="126" width="80" height="42" rx="8" fill="var(--accent)" opacity=".92"/><rect x="104" y="136" width="52" height="7" rx="3.5" fill="var(--paper)"/><rect x="104" y="150" width="34" height="7" rx="3.5" fill="var(--paper)" opacity=".7"/></g>
    </g>
    <g class="pa-drift">${card(340, 232, 110, 56)}${dot(362, 260, 10)}<path d="M356 260l4 4 8-9" stroke="var(--paper)" stroke-width="2.2" fill="none" stroke-linecap="round"/>${line(380, 252, 54)}${line(380, 266, 32, .7)}</g>`],

  'enterprise/': ['Защищённый контур с интеграциями', 'Secure perimeter with integrations', `
    <g class="pa-float">
      <path d="M240 46l96 34v82c0 66-42 108-96 132-54-24-96-66-96-132V80z" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5"/>
      <path d="M240 70l72 26v66c0 50-30 84-72 104-42-20-72-54-72-104V96z" fill="url(#pa-fade)" stroke="var(--rule)"/>
      <rect x="214" y="150" width="52" height="44" rx="8" fill="var(--paper)" stroke="var(--ink)" stroke-opacity=".6" stroke-width="2"/>
      <path d="M224 150v-12a16 16 0 0 1 32 0v12" fill="none" stroke="var(--ink)" stroke-opacity=".6" stroke-width="2.4"/>
      ${dot(240, 171, 5)}<rect x="238" y="173" width="4" height="10" rx="2" fill="var(--accent)"/>
    </g>
    ${[[70, 90], [60, 200], [410, 100], [420, 214]].map(([x, y], i) => `<g class="pa-drift ${i % 2 ? 'pa-d2' : ''}"><path d="M${x} ${y}L240 ${y < 150 ? 130 : 190}" stroke="var(--rule)" stroke-dasharray="4 6"/><rect x="${x - 30}" y="${y - 20}" width="60" height="40" rx="10" fill="var(--paper)" stroke="var(--rule)"/>${line(x - 20, y - 8, 40)}${line(x - 20, y + 5, 24, .7)}${dot(x + 18, y + 8, 3.5)}</g>`).join('')}`],

  'why-website/': ['Поиск, карта и заявки в одном потоке', 'Search, map and enquiries in one flow', `
    <g class="pa-float">
      ${card(60, 58, 360, 52)}<circle cx="94" cy="84" r="11" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="M102 92l10 10" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>${line(124, 80, 150)}
      ${card(60, 126, 360, 54, 'stroke="var(--accent)" stroke-width="2"')}${dot(88, 153, 12)}<path d="M82 153l4 4 8-9" stroke="var(--paper)" stroke-width="2.4" fill="none" stroke-linecap="round"/>${line(112, 142, 120)}${line(112, 157, 190, .7)}<rect x="350" y="140" width="52" height="26" rx="13" fill="var(--accent)" opacity=".9"/>
      ${card(60, 196, 360, 40, '')}${line(84, 212, 110, .8)}${line(84, 224, 160, .5)}
      ${card(60, 248, 360, 40, '')}${line(84, 264, 90, .8)}${line(84, 276, 140, .5)}
    </g>
    <g class="pa-drift"><path d="M352 238c0-20 22-20 22 0 0 14-11 26-11 26s-11-12-11-26z" fill="var(--accent)"/>${dot(363, 238, 4, 'var(--paper)')}</g>
    <g class="pa-drift pa-d2">${card(300, 296, 130, 40)}${dot(322, 316, 8)}${line(338, 310, 74)}${line(338, 322, 44, .7)}</g>`],

  'seo/': ['Рост позиций сайта в поиске', 'Rising search rankings', `
    <g class="pa-float">
      ${card(64, 52, 352, 256)}
      ${[0, 1, 2, 3].map(i => `<line x1="88" x2="392" y1="${110 + i * 50}" y2="${110 + i * 50}" stroke="var(--rule)" stroke-dasharray="3 6"/>`).join('')}
      ${[44, 76, 62, 112, 96, 150, 184].map((h, i) => `<rect class="pa-bar" style="--i:${i}" x="${92 + i * 42}" y="${278 - h}" width="26" height="${h}" rx="6" fill="${i > 4 ? 'var(--accent)' : 'var(--surface)'}" stroke="${i > 4 ? 'var(--accent)' : 'var(--rule)'}"/>`).join('')}
      <path class="pa-trend" d="M104 232L146 204 188 214 230 176 272 184 314 134 356 104" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${dot(356, 104, 6)}${line(88, 68, 90)}${line(88, 82, 56, .6)}
    </g>
    <g class="pa-drift">${card(320, 36, 112, 46)}<rect x="332" y="48" width="22" height="22" rx="7" fill="var(--accent)"/><text x="343" y="64" text-anchor="middle" font-size="14" font-weight="700" fill="var(--paper)">1</text>${line(364, 52, 52)}${line(364, 64, 32, .7)}</g>`],

  'geo/': ['Бренд в ответе ИИ-ассистента', 'A brand cited in an AI answer', `
    <g class="pa-float">
      <rect x="64" y="58" width="260" height="46" rx="16" fill="var(--surface)" stroke="var(--rule)"/>${line(84, 76, 170)}${line(84, 88, 96, .6)}
      <rect x="110" y="122" width="306" height="146" rx="18" fill="var(--paper)" stroke="var(--accent)" stroke-width="2"/>
      <path d="M134 150l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="var(--accent)"/>
      ${line(164, 146, 200)}${line(164, 162, 230, .8)}${line(164, 178, 170, .6)}
      <rect x="134" y="198" width="120" height="26" rx="13" fill="var(--accent)" opacity=".92"/><rect x="148" y="208" width="72" height="7" rx="3.5" fill="var(--paper)"/>
      <rect x="264" y="198" width="86" height="26" rx="13" fill="var(--surface)" stroke="var(--rule)"/>${line(276, 208, 50)}
      ${line(134, 240, 140, .5)}
    </g>
    <g class="pa-drift"><path d="M410 70l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="var(--accent)" opacity=".85"/></g>
    <g class="pa-drift pa-d2"><path d="M70 290l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="var(--accent)" opacity=".6"/>${card(300, 288, 120, 40)}${dot(322, 308, 7)}${line(336, 302, 70)}${line(336, 314, 40, .7)}</g>`],

  'support/': ['Сайт под постоянным присмотром', 'A website under continuous care', `
    <g class="pa-float">
      ${card(70, 70, 340, 220)}
      <path d="M92 190h56l14-44 22 84 20-62 14 22h70" fill="none" stroke="var(--accent)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" class="pa-trend"/>
      ${line(92, 94, 100)}${line(92, 108, 62, .6)}
      <rect x="318" y="88" width="74" height="26" rx="13" fill="var(--accent)" opacity=".9"/><rect x="332" y="98" width="46" height="6" rx="3" fill="var(--paper)"/>
      ${[0, 1, 2].map(i => `<g>${dot(100 + i * 112, 256, 7, i === 1 ? 'var(--accent)' : 'var(--surface)')}<circle cx="${100 + i * 112}" cy="256" r="7" fill="none" stroke="var(--rule)"/>${line(114 + i * 112, 253, 62)}</g>`).join('')}
    </g>
    <g class="pa-spin"><circle cx="400" cy="70" r="26" fill="var(--paper)" stroke="var(--rule)"/><path d="M400 54v8m0 16v8m-16-16h8m16 0h8" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>${dot(400, 70, 6)}</g>
    <g class="pa-drift pa-d2">${card(48, 300, 120, 40)}${dot(70, 320, 9)}<path d="M65 320l4 4 7-8" stroke="var(--paper)" stroke-width="2.2" fill="none" stroke-linecap="round"/>${line(86, 314, 64)}${line(86, 326, 40, .7)}</g>`],
  'bundle/': ['Пять частей одной системы', 'Five parts of one system', `
    <g class="pa-float">
      <path d="M92 258L170 120 240 200 312 96 388 168" fill="none" stroke="var(--rule)" stroke-width="2" stroke-dasharray="4 7"/>
      <path class="pa-trend" d="M92 258L170 120 240 200 312 96 388 168" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${[[92, 258, 'var(--surface)'], [170, 120, 'var(--accent)'], [240, 200, 'var(--surface)'], [312, 96, 'var(--accent)'], [388, 168, 'var(--surface)']].map(([x, y, f], i) => `<g class="pa-drift ${i % 2 ? 'pa-d2' : ''}"><circle cx="${x}" cy="${y}" r="30" fill="${f}" stroke="var(--accent)" stroke-width="2"/><circle cx="${x}" cy="${y}" r="42" fill="none" stroke="var(--rule)"/>${line(x - 14, y - 4, 28, 1.6)}${line(x - 8, y + 8, 16, 1.2)}</g>`).join('')}
    </g>`],

  'private-ai/': ['Серверы в российском контуре с журналом запросов', 'Servers inside a Russian perimeter with a request log', `
    <g class="pa-float">
      ${[0, 1, 2].map(i => `<g>${card(118, 70 + i * 74, 170, 60)}${[0, 1, 2, 3].map(j => `<rect x="${134 + j * 22}" y="${86 + i * 74}" width="14" height="28" rx="3" fill="var(--surface)" stroke="var(--rule)"/>`).join('')}${dot(258, 100 + i * 74, 5, i === 1 ? 'var(--accent)' : 'var(--ok, var(--accent))')}<circle class="pa-blink" style="--b:${i}" cx="272" cy="100" r="3" transform="translate(0 ${i * 74})" fill="var(--accent)"/></g>`).join('')}
      <path d="M100 52h206v240H100z" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 6"/>
      <rect x="86" y="40" width="64" height="22" rx="11" fill="var(--accent)"/><text x="118" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="var(--paper)">RU</text>
    </g>
    <g class="pa-drift">${card(320, 96, 128, 132)}${[0, 1, 2, 3, 4].map(i => `${line(334, 114 + i * 20, 70 - (i % 2) * 22, i === 0 ? 1.6 : 1)}${dot(426, 117 + i * 20, 3.5)}`).join('')}</g>
    <g class="pa-drift pa-d2"><path d="M360 262l30-30 30 30-30 30z" fill="var(--paper)" stroke="var(--accent)" stroke-width="2"/><path d="M378 262l8 8 16-16" stroke="var(--accent)" stroke-width="3" fill="none" stroke-linecap="round"/></g>`],

  'hardware/': ['GPU-сервер с вентиляторами', 'GPU server with fans', `
    <g class="pa-float">
      ${card(70, 110, 340, 140)}
      <rect x="70" y="110" width="340" height="26" rx="14" fill="var(--surface)" stroke="var(--rule)"/>${line(88, 120, 90)}${dot(388, 123, 4)}
      ${[0, 1, 2, 3].map(i => `<g transform="translate(${118 + i * 76} 196)"><circle r="30" fill="var(--surface)" stroke="var(--rule)"/><g class="pa-fan"><path d="M0-24c8 6 8 16 0 20M24 0c-6 8-16 8-20 0M0 24c-8-6-8-16 0-20M-24 0c6-8 16-8 20 0" fill="var(--accent)" opacity=".75"/></g><circle r="5" fill="var(--paper)" stroke="var(--accent)"/></g>`).join('')}
    </g>
    <g class="pa-drift">${card(300, 40, 140, 52)}${line(316, 56, 60)}<rect x="316" y="70" width="108" height="8" rx="4" fill="var(--surface)"/><rect class="pa-load" x="316" y="70" width="76" height="8" rx="4" fill="var(--accent)"/></g>
    <g class="pa-drift pa-d2">${card(54, 274, 150, 46)}${dot(76, 297, 8)}${line(92, 290, 90)}${line(92, 303, 54, .7)}</g>`],

  'shop/': ['Корзина, в которую падают услуги', 'A basket that services drop into', `
    <path d="M118 150h244l-22 118H140z" fill="var(--surface)" stroke="var(--rule)" stroke-width="2" stroke-linejoin="round"/>
    ${[[168, 'var(--accent)', 0], [226, 'var(--paper)', 1], [284, 'var(--paper)', 2]].map(([x, f, i]) => `<g class="pa-drop2" style="--i:${i}"><rect x="${x}" y="40" width="52" height="64" rx="9" fill="${f}" stroke="var(--accent)" stroke-width="2"/>${line(x + 9, 54, 30, f === 'var(--accent)' ? 0 : 1)}${line(x + 9, 67, 20, f === 'var(--accent)' ? 0 : .8)}<circle cx="${x + 40}" cy="92" r="6" fill="${f === 'var(--accent)' ? 'var(--paper)' : 'var(--accent)'}"/></g>`).join('')}
    <path d="M112 176h256l-26 118H138z" fill="var(--paper)" stroke="var(--ink)" stroke-opacity=".55" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M150 204h180M146 232h188M142 260h196" stroke="var(--rule)" stroke-width="2"/>
    <path d="M84 150h28l26 144" fill="none" stroke="var(--ink)" stroke-opacity=".55" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="170" cy="318" r="13" fill="var(--paper)" stroke="var(--ink)" stroke-opacity=".55" stroke-width="2.5"/><circle cx="314" cy="318" r="13" fill="var(--paper)" stroke="var(--ink)" stroke-opacity=".55" stroke-width="2.5"/>
    <g class="pa-badge"><circle cx="372" cy="150" r="20" fill="var(--accent)"/><text x="372" y="156" text-anchor="middle" font-size="16" font-weight="700" fill="var(--paper)">3</text></g>`],

  industry: ['Документы под защитой', 'Documents under protection', `
    <g class="pa-float">
      ${card(110, 60, 190, 240)}${line(132, 86, 120, 1.6)}${[0, 1, 2, 3, 4, 5].map(i => line(132, 112 + i * 22, 146 - (i % 3) * 30)).join('')}
      <rect x="132" y="250" width="80" height="26" rx="13" fill="var(--accent)" opacity=".9"/>
      <g class="pa-scan"><rect x="112" y="80" width="186" height="3" fill="var(--accent)" opacity=".8"/></g>
    </g>
    <g class="pa-drift"><path d="M352 96l58 20v48c0 40-26 64-58 78-32-14-58-38-58-78v-48z" fill="var(--paper)" stroke="var(--accent)" stroke-width="2.5"/><path d="M334 166l12 12 24-26" stroke="var(--accent)" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
    <g class="pa-drift pa-d2">${card(300, 262, 140, 46)}${dot(322, 285, 8)}${line(338, 278, 80)}${line(338, 291, 50, .7)}</g>`],

};

export function pageArt(lang, route) {
  const item = art[route] ?? (route?.startsWith('industries/') ? art.industry : null);
  if (!item) return '';
  const [ru, en, inner] = item;
  return `<div class="page-art" aria-hidden="false">${frame(lang === 'ru' ? ru : en, inner)}</div>`;
}
