import { esc } from './site.mjs';

const matchingCases = {
  'self-employed/': 'kitchens',
  'business/': 'orient-logic',
  'enterprise/': 'orient-logic',
  'why-website/': 'kitchens',
};

export function pageArt(lang, route, { asset, home, work }) {
  const caseId = matchingCases[route];
  if (!caseId) return '';
  const project = work.find(({ id }) => id === caseId);
  if (!project || project.concept) return '';

  const [width, height] = project.size;
  const label = lang === 'ru' ? 'Читать кейс' : 'Read the case study';
  return `<figure class="page-art case-preview">
    <a href="${home}work/${esc(project.id)}/">
      <img src="${asset}${esc(project.image)}" alt="${esc(project.alt)}" width="${width}" height="${height}" fetchpriority="high">
      <span class="case-preview-caption"><strong>${esc(project.name)}</strong><span>${label}</span></span>
    </a>
  </figure>`;
}
