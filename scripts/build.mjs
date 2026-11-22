import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { identity as id, copy, homeCopy, styleCopy, siteBase } from "../content/profile.mjs";
import { cases, products, contacts } from "../content/work.mjs";
import { starterPackages, renderQuiz, packageStartingPrice } from "../content/pricing.mjs";
import { offerPages, renderOfferPage, renderOffers, renderCompanySolutions, renderReadySolutions } from "../content/solutions.mjs";
import { site, esc, formatStartingPrice, regionControl, renderTeam, renderCaseFilter, renderCaseDetails, renderCurators, renderProductDetails, renderReferral, renderLegal } from "../content/site.mjs";
import { segments, topics, pageFAQ, renderSegmentPage, renderTopicPage } from "../content/segments.mjs";
import { renderPortalPage } from "../content/portal.mjs";
import { validateSite } from "./validate-site.mjs";

await validateSite(site);
const root=new URL("../",import.meta.url), files={}, icons={};
for(const f of await readdir(new URL("docs/assets/icons/",root))) icons[f.slice(0,-4)]=await readFile(new URL("docs/assets/icons/"+f,root),"utf8");
const base=siteBase(), asset=base+"assets/", brand=asset+"brand/";
const link=(label,url,style="link",goal="")=>`<a class="${style}" href="${esc(url)}" ${goal?'data-goal="'+goal+'"':''}>${esc(label)} ${icons.diagonal}</a>`;
const versionedAssets = await Promise.all([
  "site-version.js", "studio.js", "currency.js", "commercial.js", "devlarion-logo.js", "solutions.js", "quiz.js", "payback.js", "portal.js", "motion.js",
  "brand/favicon.svg", "brand/favicon-32.png", "brand/favicon-48.png", "brand/apple-touch-icon.png",
  "brand/logo-horizontal-copper-light.svg", "brand/logo-horizontal-copper.svg", "brand/og-ru.png", "brand/og-en.png",
  "exchange-rates.json",
].map(async name => {
  const bytes = await readFile(new URL("docs/assets/" + name, root));
  return [name, createHash("sha256").update(bytes).digest("hex").slice(0, 10)];
}));
const readAsset = name => readFile(new URL("docs/assets/"+name,root),"utf8");
const themeScript = await readAsset("theme.js");
// The browser may resolve an incoming transition while the external CSS is still loading.
const navigationMotion = '<style media="(prefers-reduced-motion: no-preference)">@view-transition { navigation: auto; }</style>';
const styleGroups = {
  common: [],
  home: ["quiz.css","home.css","cases.css"],
  case: ["home.css","cases.css"],
  picker: ["home.css"],
  portal: ["portal.css"],
};
const commonStyles = await Promise.all(["brand/fonts.css","portfolio.css","commercial.css","solutions.css"].map(readAsset));
commonStyles[0] = commonStyles[0].replaceAll("url(fonts/","url(brand/fonts/");
const finalStyles = await Promise.all(["brand-logo.css","motion.css"].map(readAsset));
const styleLinks = Object.fromEntries(await Promise.all(Object.entries(styleGroups).map(async ([group,extras]) => {
  const payload = [...commonStyles,...await Promise.all(extras.map(readAsset)),...finalStyles].join("\n");
  const name = "page-" + group + ".css";
  const version = createHash("sha256").update(payload).digest("hex").slice(0,10);
  files["docs/assets/"+name] = payload;
  return [group,`<link rel="stylesheet" href="${asset}${name}?v=${version}">`];
})));
const serviceIcon = { web: "web", mini: "mini", automation: "bot" };
const caseRoute = project => "work/" + project.id + "/";
const audiencePages = [...segments,...topics];
const routes = ["", "links/", "aurawatch/", "privacy/", "licenses/", "solutions/", "cabinet/", ...Object.keys(offerPages), ...audiencePages.map(page=>page.route), ...cases.ru.map(caseRoute)];
const url=(l,r="")=>base+(l==="ru"?"ru/":"")+r;
const pic=(file,alt,size)=>`<img loading="lazy" width="${size[0]}" height="${size[1]}" src="${asset+file}" alt="${esc(alt)}">`;
for(const lang of ["ru","en"]){
 const ru=lang==="ru", other=ru?"en":"ru", t=copy[lang], l=(a,b)=>ru?a:b, home=url(lang), person=id.founder[lang];
 const tg=link(t.cta,id.telegram,"button","telegram"), beta=link(l("Хочу в закрытую бету","Join the closed beta"),id.telegram+"?text="+encodeURIComponent(l("Хочу участвовать в закрытой бете AuraWatch.","I'd like to join the AuraWatch closed beta.")),"button","beta");
 const work = cases[lang].map(project => {
   const override = site.caseOverrides[project.id]?.[lang];
   return override ? { ...project, ...override } : project;
 });
 const lab = products[lang];
 const socials = [
   ["Threads", id.threads, "threads", "threads"],
   ["GitHub", id.github, "github", "github"],
   ["Telegram", id.telegram, "telegram", "telegram"],
   [l("Почта", "Email"), "mailto:" + contacts.email, "email", "mail"],
 ];
 const channelSlot='<span data-channel hidden></span>';
 const social = `<div class="social social--icons">${channelSlot}${socials.map(([label, href, goal, icon]) =>
   `<a class="social-icon" href="${esc(href)}" aria-label="${label}" title="${label}" data-goal="${goal}">${icons[icon]}</a>`
 ).join("")}</div>`;
 const shareLabel = l("Поделиться", "Share");
 const shareButton = (anchor = "", classes = "share-control", icon = false) => `<button type="button" class="${classes}" data-share data-share-anchor="${esc(anchor)}" ${icon ? `aria-label="${shareLabel}" title="${shareLabel}"` : ""}>${icon ? icons.share : shareLabel}</button>`;
 const shareDialog = `<dialog id="share-options" class="share-actions" aria-labelledby="share-title">
   <form method="dialog"><button aria-label="${l("Закрыть", "Close")}">×</button></form>
   <h2 id="share-title">${shareLabel}</h2>
   <button type="button" class="share-copy" data-share-copy>${l("Скопировать ссылку", "Copy link")}</button>
   <div class="actions"><a data-share-telegram>Telegram</a><a data-share-vk>VK</a><a data-share-email>${l("Почта", "Email")}</a></div>
   <label hidden>${l("Ссылка", "Link")}<input readonly data-share-field></label>
   <p role="status" data-share-status></p>
 </dialog>`;
 const navRest=t.nav.slice(1).map((label,i)=>`<a href="${home}#${["work","bureau","contact"][i]}">${label}</a>`).join("")+`<a href="${home}cabinet/">${l("Кабинет","Portal")}</a>`;
 const servicesMenu = () => {
   const groups = [
     [homeCopy[lang].audience, segments.map(page => [page.route,page[lang].label])],
     [l("Рост","Growth"),topics.map(page => [page.route,page.route==="seo/"?"SEO":page[lang].label])],
     [l("Решения","Solutions"),[
       ["website/",l("Сайт","Website")],
       ["telegram-bot/",l("Бот и мини-приложение","Bot and mini app")],
       ["ai-assistant/",l("ИИ-ассистент","AI assistant")],
       ["solutions/",l("Все решения","All solutions")],
     ]],
   ];
   return `<details class="services-nav"><summary>${t.nav[0]}</summary><div class="services-nav-links">
     ${groups.map(([title,items])=>`<div><strong>${esc(title)}</strong><ul>${items.map(([route,label])=>`<li><a href="${home}${route}">${esc(label)}</a></li>`).join("")}</ul></div>`).join("")}
   </div></details>`;
 };
 const logo = (placement, intro = false) => {
   const fallback = placement === "footer" ? "logo-horizontal-copper.svg" : "logo-horizontal-copper-light.svg";
   return `<a class="wordmark" href="${home}" aria-label="${l("Devlarion — главная", "Devlarion — home")}">
     <devlarion-logo variant="full" height="33" aria-hidden="true" ${intro ? "intro" : ""}></devlarion-logo>
     <img class="wordmark-fallback" src="${brand}${fallback}" alt="" width="235" height="52">
   </a>`;
 };
 const motionSite=siteBase(process.env.DEVLARION_MOTION_URL || "https://luvlarion4ik.github.io/devlarion-motion/")+(ru?"":"en/");
 const studioSite=process.env.DEVLARION_STUDIO_URL ? siteBase(process.env.DEVLARION_STUDIO_URL) : "";
 const studioLink=studioSite ? link(l("Конструктор «Сборка»","Sborka site builder"),studioSite,"link","studio") : "";
 const styles=styleCopy[lang];
 const styleChoices=(prompt=false)=>`<button type="button" class="btn" data-site-version="classic">${styles.classic}${prompt?' <span aria-hidden="true">✓</span>':""}</button>
   <a class="btn" href="${motionSite}" data-site-version="motion">${styles.motion} <span aria-hidden="true">→</span></a>`;
 const stylePrompt=`<aside class="version-prompt" aria-label="${styles.label}" data-version-prompt hidden>
   <p>${styles.prompt}</p><div class="version-prompt-actions">${styleChoices(true)}</div>
   <button type="button" class="version-dismiss" aria-label="${styles.dismiss}" data-site-version="dismissed">×</button>
 </aside>`;
 const themeNames=l(["Авто","Медь","Тёмно-синяя","Шалфей"],["Auto","Copper","Midnight","Sage"]);
 const themeLabel=l("Цветовая тема","Colour theme");
 const themes=`<div class="theme-picker" hidden>
   <button type="button" id="theme" aria-label="${themeLabel}" title="${themeLabel}" aria-expanded="false" aria-controls="theme-choices">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><g class="theme-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"></path></g><path class="theme-moon" d="M20.5 14A8.8 8.8 0 0 1 10 3.5 8.8 8.8 0 1 0 20.5 14Z"></path></svg>
   </button>
   <div id="theme-choices" hidden><fieldset><legend>${themeLabel}</legend>${["auto","copper","midnight","sage"].map((v,i)=>`<label><input type="radio" name="theme-choice" value="${v}"><span>${themeNames[i]}</span></label>`).join("")}</fieldset><fieldset class="version-choices"><legend>${styles.label}</legend>${styleChoices()}</fieldset></div>
 </div>`;
 const foot=`<footer class="wrap"><div class="row">${logo("footer")}${social}</div>
   <div class="row fine"><span>© 2026 Devlarion · ${renderLegal(lang)}</span>
     <a href="${home}privacy/">${l("Конфиденциальность","Privacy")}</a>
     <a href="${home}cabinet/">${l("Кабинет","Client portal")}</a>
     <a href="${home}licenses/">${l("Лицензии","Licences")}</a>
     <a href="${motionSite}" data-goal="motion" data-site-version="motion">${styles.link}</a>
     ${studioLink}
     <button hidden data-preferences>${l("Настройки аналитики","Analytics preferences")}</button>
     ${shareButton()}
   </div></footer>`;
 const mobileBar=route=>route==="links/"?"":`<div class="mobilebar">${route==="aurawatch/"?beta:tg}${link("Threads",id.threads,"link","threads")}</div>`;
 const section=(key,title,content,cls="")=>`<section id="${key}" class="section wrap ${cls}"><h2>${title}</h2>${content}</section>`;
 const watch=`<div class="watch" role="img" aria-label="${l("Демонстрация экрана AuraWatch","AuraWatch screen demo")}"><div><small>AuraWatch</small><b data-watch>${l("Какие следующие шаги?","What are the next steps?")}</b><i></i></div></div>`;
 const watchIntro=l("Ассистент для iPhone и Apple Watch в закрытом бета-тестировании. В режиме «Тихий суфлёр» подсказка появляется на затемнённом экране часов.","An assistant for iPhone and Apple Watch, currently in closed beta. Silent Prompter displays a suggestion on the dimmed watch face.");
 const portalIntro=l("Заявка, смета, версии работы, счета и поддержка в личном кабинете Devlarion.","Your request, estimate, work versions, invoices and support in the Devlarion client portal.");
 const productPreviews = {
   city: `<div class="product-preview systems-preview" role="group" aria-label="${l("Схема интеграции", "Integration diagram")}">
     <div class="system-node">${icons.layers}<span>${l("Госплатформа", "Public platform")}</span></div>
     <span class="connection" aria-hidden="true"></span>
     <div class="system-node">${icons.server}<span>${l("Коммерческий сервис", "Commercial service")}</span></div>
   </div>`,
   cognivue: `<div class="product-preview audience-preview" role="group" aria-label="${l("Пример оценки макета", "Example design review")}">
     <div class="creative-sample" aria-hidden="true"><i></i><span></span></div>
     <div class="review-prompt">${l("Что первым привлекло внимание?", "What caught your eye first?")}</div>
   </div>`,
   axenta: `<div class="product-preview tutor-preview" role="group" aria-label="${l("Пример разбора уравнения", "Example equation walkthrough")}">
     <div class="equation">2<i>x</i> + 4 = 10</div>
     <div class="tutor-step"><span>${l("Вычтем 4 из обеих частей", "Subtract 4 from both sides")}</span><strong>2<i>x</i> = 6</strong></div>
   </div>`
 };
 const demoBadge = project => project.concept ? `<small class="demo-badge">${l("Демо-данные","Demo data")}</small>` : "";
 const caseCover = (project, href, featured = false) => `<a class="case-cover${featured ? " featured-stage" : ""}" href="${esc(href)}" aria-label="${esc(project.name)}">
   <div class="${featured ? "featured-browser" : "case-window"}">${featured ? `<span aria-hidden="true">${esc(new URL(project.href).hostname)}</span>` : ""}${pic(project.image, project.alt, project.size)}</div>
   <img class="${featured ? "featured-phone" : "case-mobile"}" src="${asset+project.mobile}" width="390" height="844" alt="" loading="lazy">
 </a>`;
 const caseTerms = project => `<dl>
   <dt>${l("Задача","Brief")}</dt><dd>${esc(project.task)}</dd>
   <dt>${l("Решение","Build")}</dt><dd>${esc(project.solution)}</dd>
 </dl>`;
 const renderCases = items => items.map(project => {
   const people = (project.curators ?? []).map(curator => curator.person).join(" ");
   const details = home + caseRoute(project);
   const featured = project.id === "orient-logic";
   return `<article class="case exhibit${featured ? " exhibit-featured" : ""}" id="${esc(project.id)}" data-case-people="${esc(people)}">
     ${caseCover(project,details,featured)}
     <div class="exhibit-copy"><div><small>${esc(project.type)}</small> ${demoBadge(project)}</div>
       <h3>${esc(project.name)}</h3><p>${esc(project.result)}</p>
       ${project.demoNote ? `<p class="demo-note">${esc(project.demoNote)}</p>` : ""}
       <details><summary>${l("Задача и решение","Project details")}</summary>${caseTerms(project)}</details>
       ${renderCaseDetails(lang,project)}${renderCurators(lang,project)}
       <div class="exhibit-foot">${link(project.concept ? l("Открыть демо","Open demo") : l("Читать кейс","Read case study"),details)}${shareButton(project.id)}</div>
     </div></article>`;
 }).join("");
 const caseGallery = items => `<div data-case-group class="work-gallery">${renderCases(items)}</div>`;
 const caseHTML = renderCaseFilter(lang,work) + [
   [l("Клиентские проекты", "Client projects"), work.filter(project => !project.concept)],
   [l("Демонстрационные проекты", "Demo projects"), work.filter(project => project.concept)]
 ].map(([title, items]) => `<div data-case-group><h3 class="work-subheading">${title}</h3><div class="work-gallery">${renderCases(items)}</div></div>`).join("");

 const casePages = Object.fromEntries(work.map(project => {
   const gallery = project.gallery;
   const supportingShot = gallery ? `<figure class="case-gallery-frame">${pic(gallery.image,gallery.alt,gallery.size)}<figcaption>${l("Галерея и переход в MAX","Gallery and MAX entry point")}</figcaption></figure>` : "";
   return [caseRoute(project), `<article class="wrap sub case-detail">
     <small>${esc(project.type)}</small> ${demoBadge(project)}
     <h1>${esc(project.name)}</h1><p class="intro">${esc(project.result)}</p>
     ${project.demoNote ? `<p class="demo-note">${esc(project.demoNote)}</p>` : ""}
     ${caseCover(project,project.href)}
     <h2>${l("Задача и решение","Brief and build")}</h2>
     ${caseTerms(project)}${renderCaseDetails(lang,project)}${supportingShot}
     <div class="actions">${link(project.concept ? l("Открыть сайт демо","Open demo website") : l("Открыть сайт проекта","Open the project website"),project.href,"button")}${shareButton()}</div>
   </article>`];
 }));

 const packages = starterPackages(lang,site.pricing);
 const front = homeCopy[lang];
 const segmentPicker = `<div class="segment-picker" aria-label="${esc(front.audience)}">${segments.map(segment => {
   const { label, card } = segment[lang];
   const rubles = packageStartingPrice(segment.starting, site.pricing);
   const prefix = segment.route === "enterprise/" ? l("пилот от","pilot from") : l("от","from");
   return `<a class="segment-card" href="${home}${segment.route}" data-segment="${segment.route.slice(0,-1)}">
     <span class="service-mark" aria-hidden="true">${icons[segment.icon]}</span>
     <div>
       <small class="segment-visited" hidden>${front.visited}</small>
       <strong class="segment-label">${esc(label)}</strong>
       <p>${esc(card)}</p>
       ${rubles === null ? "" : `<span class="segment-price" data-region-price-row>${prefix} <span data-region-price="${rubles}">${formatStartingPrice(rubles,lang)}</span></span>`}
       <span class="segment-action">${front.segmentAction} <span aria-hidden="true">→</span></span>
     </div>
   </a>`;
 }).join("")}</div>`;
 const stack = `<div class="stack"><div class="wrap stack-rail" role="region" tabindex="0" aria-label="${l("Технологии студии","Studio technologies")}">${[false,true].map(repeat=>`<div class="stack-track" ${repeat?'aria-hidden="true"':""}>Python <i>/</i> FastAPI <i>/</i> SwiftUI <i>/</i> Next.js <i>/</i> Telegram <i>/</i> On-premise AI <i>/</i></div>`).join("")}</div></div>`;
 const featured = work.find(c => c.name === "Orient Logic");
 const casePreview = `<a class="featured-case" href="#orient-logic">
   <div class="featured-stage">
     <div class="featured-browser"><span aria-hidden="true">orientlogic.ru</span><img src="${asset+featured.image}" width="1440" height="900" alt="" fetchpriority="high"></div>
     <img class="featured-phone" src="${asset+featured.mobile}" width="390" height="844" alt="">
   </div>
   <div class="featured-caption"><div><small>${l("Клиентский проект · Логистика","Client project · Logistics")}</small><strong>Orient Logic</strong><span>${l("Ассистент, заявки, CRM и личные кабинеты","Assistant, enquiries, CRM and customer accounts")}</span></div><span class="featured-arrow" aria-hidden="true">↓</span></div>
 </a>`;
 const homeHTML=`<section class="hero"><div class="wrap hero-grid"><div class="hero-copy"><p class="eyebrow"><i></i>${t.eyebrow}</p><h1>${t.title}</h1><p class="intro">${t.intro}</p><div class="actions"><a class="button" href="#small-business">${l("Цены для малого бизнеса","Prices for small business")} ↓</a><a class="ghost" href="#companies">${l("Решения для компаний","Company solutions")} ↓</a></div><a class="byline" href="#bureau">${person} · ${t.about}</a></div>${casePreview}</div></section>
 <div class="stack"><div class="wrap stack-rail">${[false,true].map(repeat=>`<div class="stack-track" ${repeat?'aria-hidden="true"':""}>Python <i>/</i> FastAPI <i>/</i> SwiftUI <i>/</i> Next.js <i>/</i> Telegram <i>/</i> On-premise AI <i>/</i></div>`).join("")}</div></div>
 <section class="wrap segment-strip" aria-label="${esc(front.audience)}"><h2 class="segment-strip-title">${esc(front.audience)}</h2>${segmentPicker}</section>
 ${stylePrompt}
 <div id="services">${renderOffers(lang,icons,site.ready)}</div>
 ${section("services",t.services,`<div id="small-business" class="service-group"><h3>${l("Фиксированные цены: самозанятые, ИП и небольшие команды","Fixed prices: freelancers, sole traders and small teams")}</h3><p>${l("Для самозанятых, ИП и небольших команд. В каждом пакете один сценарий. Если нужны оплата, CRM или дополнительные функции, оценим их отдельно.","For freelancers, sole proprietors and small teams. Each package covers one workflow. We quote payment processing, CRM integrations and extra features separately.")}</p><p><a class="link" href="${home}self-employed/">${l("Все пакеты для самозанятых и ИП →","All packages for freelancers and sole proprietors →")}</a> <a class="link" href="${home}business/">${l("Малому и среднему бизнесу →","Small and medium business →")}</a></p><div class="service-grid">${packages.map(p=>`<article><span class="service-mark">${icons[serviceIcon[p.id]]}</span><h4>${esc(p.title)}</h4><p>${esc(p.description)}</p><div class="rate"><div class="starter-price" data-region-price-row><span class="starter-price-prefix">${l("от", "from")}</span><strong class="starter-price-amount" data-region-price="${p.rub}">${formatStartingPrice(p.rub,lang)}</strong></div></div>${link(l("Обсудить пакет","Discuss this package"),id.telegram+"?text="+encodeURIComponent(l("Хочу обсудить пакет «","I'd like to discuss the “")+p.title+l("».","”.")),"link","telegram")}</article>`).join("")}</div></div>
 <p data-region-note hidden></p>
 <div id="companies" class="service-group"><h3>${l("Крупные задачи: ИИ, интеграции и сервисы под ключ","Larger projects: AI, integrations and bespoke services")}</h3>
   <p>${l("Выберите направление, чтобы посмотреть состав работ, варианты внедрения и ориентир по бюджету.","Choose a service to see the scope, deployment options and starting price.")}</p>
   ${renderCompanySolutions(lang,icons,site.pricing)}<p><a class="link" href="${home}enterprise/">${l("Крупным компаниям: диагностика и пилот →","Large companies: discovery and pilot →")}</a></p></div>
 <aside class="service-support"><div><strong>${l("Два месяца поддержки","Two months of support")}</strong><p>${l("Исправления в согласованном объёме входят в каждый проект.","Every project includes fixes within the agreed scope.")}</p></div>${link(t.estimate,"#quiz")}</aside>`)}
 ${section("why",front.why,`<div class="home-facts">${front.whyFacts.map(([title,body])=>`<article><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join("")}</div>${link(front.whyLink,home+"why-website/")}`)}
 ${section("growth",front.growth,`<div class="home-growth">${["seo/","geo/","support/"].map((route,index)=>{
   const [title,body]=front.growthLinks[index];
   return `<a href="${home}${route}"><strong>${esc(title)} <span aria-hidden="true">→</span></strong><span>${esc(body)}</span></a>`;
 }).join("")}</div>`)}
 <aside class="wrap bundle-teaser"><span class="service-mark" aria-hidden="true">${icons.layers}</span><div><h2>${l("Сайт, SEO, GEO и бот лучше брать пакетом","Website, SEO, GEO and bot work best as a bundle")}</h2><p>${l("Одна команда вместо четырёх подрядчиков: части усиливают друг друга, вам не нужно склеивать результаты, а цена ниже, чем по отдельности.","One team instead of four suppliers: the parts reinforce each other, you do not stitch results together, and the price is lower than buying separately.")}</p></div><a class="ghost" href="${home}bundle/">${l("Как работает пакет","How the bundle works")} <span aria-hidden="true">→</span></a></aside>
 ${site.sales?.capacity?.enabled===false?"":`<aside class="wrap capacity"><div class="capacity-pulse" aria-hidden="true"><i></i></div><div><strong>${esc(site.sales?.capacity?.[lang]?.title||l("Мы берём ограниченное число проектов в месяц","We take a limited number of projects each month"))}</strong><p>${esc(site.sales?.capacity?.[lang]?.text||l("Каждый проект я веду лично, поэтому не набираю больше, чем могу сделать хорошо. Хотите запуститься в ближайшие недели — напишите сейчас.","I run every project personally, so I only take on what I can do well. If you want to launch in the next few weeks, write now."))}</p></div>${link(l("Занять место в очереди","Reserve a slot"),id.telegram+"?text="+encodeURIComponent(l("Здравствуйте! Хочу занять место в очереди на проект.","Hello! I’d like to reserve a project slot.")),"button","telegram")}</aside>`}
 ${section("work",t.work,caseHTML)}
 ${section("process",t.process,`<ol class="steps">${t.steps.map(([h,p])=>`<li><h3>${h}</h3><p>${p}</p></li>`).join("")}</ol>`)}
 <section class="product-feature wrap"><div><small>watchOS / iOS</small><h2>AuraWatch</h2><p>${watchIntro}</p><div class="actions">${beta}${link(l("Подробнее","Explore"),home+"aurawatch/")}</div></div><div class="product-visual">${pic("brand/watch.webp","Apple Watch",[1050,700])}</div></section>
 ${section("products",t.products,`<div class="lab product-list">${lab.map(p=>`<article class="${p.preview?"product-card":"product-lead"}">${productPreviews[p.preview] ?? ""}<div><small>${esc(p.status)}</small><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p>${renderProductDetails(lang,p.details)}${p.links.length?`<div class="product-links">${p.links.map(a=>link(a.label,a.href)).join("")}</div>`:""}</div></article>`).join("")}</div>`)}
 ${section("about",l("Формат работы и договор","How we work and contract"),`<p class="intro">${l("Devlarion разрабатывает сайты, ботов, мобильные приложения и ИИ-сервисы для бизнеса. Ведём проект от аналитики и дизайна до запуска и поддержки. Работаем по договору с ИП. Состав, смету и этапы согласуем до начала работ.","Devlarion builds websites, bots, mobile apps and AI services for businesses. We cover discovery, design, delivery and support, with the scope, budget and milestones agreed before work begins.")}</p>`)}
 ${section("bureau",t.bureau,renderTeam(lang,{bio:t.bio,work,home,asset,link}))}
 ${section("faq",t.faq,t.faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join(""))}
 ${section("quiz",t.estimate,renderQuiz(lang,id.telegram,site.pricing,site.portal)+renderReferral(lang,id.telegram)+social)}
 ${section("contact",t.ask,`<p class="intro">${t.close}</p><div class="actions">${tg}</div>${social}`)}`;
 const privacy=l("Конфиденциальность","Privacy");
 const hosting = base === id.portfolio
   ? l("Сайт размещён на GitHub Pages.", "GitHub Pages hosts this site.")
   : l("Сайт размещён на сервере Devlarion.", "Devlarion hosts this site.");
 const privacyText=l(["На этом сайте","Калькулятор обрабатывает ответы в вашем браузере. Настройки темы и валюты сохраняются в браузере. При необходимости браузер запрашивает справочные курсы у Frankfurter. "+hosting+" Для доставки страниц хостинг обрабатывает технические сведения о соединении.","Переход в Telegram","Кнопка отправки расчёта открывает Telegram с черновиком. В него могут попасть выбранные услуги, регион и реферальный код. Вы решаете, отправлять ли сообщение.","Аналитика","Счётчик Яндекс Метрики и запись сеансов отключены. По вопросам обработки данных напишите основателю."],["On this site","The estimator processes answers in your browser. Theme and currency preferences are saved in your browser. When needed, your browser requests reference rates from Frankfurter. "+hosting+" The host processes technical connection information to serve the pages.","Opening Telegram","The estimate button opens a Telegram draft with your selected services, region and any referral code. You decide whether to send it.","Analytics","Yandex Metrica and session recording are disabled. Contact the founder with questions about data handling."]);
 const auBody=`<div class="wrap sub"><small>Devlarion / iOS + watchOS</small><h1>AuraWatch</h1><div class="product-feature"><div><p class="intro">${watchIntro}</p>${beta}</div>${watch}</div><h2>${l("Как работает суфлёр","How Silent Prompter works")}</h2><ol class="steps">${l([["Начать","Пользователь включает сеанс на часах."],["Получить подсказку","Звук передаётся на сервер для обработки и расшифровки. Ответ появляется на запястье."],["Завершить","Три нажатия на Digital Crown останавливают сеанс."]],[["Start","The wearer starts a session on the watch."],["Read the suggestion","Audio is sent to the server for processing and transcription. The response appears on the wrist."],["Finish","Press the Digital Crown three times to stop the session."]]).map(([a,b])=>`<li><h3>${a}</h3><p>${b}</p></li>`).join("")}</ol><h2>${privacy}</h2><p>${l("Материалы сеанса хранятся в базе до удаления пользователем или до истечения 180 дней. Включайте микрофон с согласия участников разговора.","Session data is stored until the user deletes it or 180 days have passed. Obtain participants’ consent before turning on the microphone.")}</p><details><summary>${l("Какие устройства поддерживаются?","Which devices are supported?")}</summary><p>${l("Первый релиз рассчитан на iOS и watchOS. Android и часы других брендов — в планах.","The first release targets iOS and watchOS. Android and other watch brands are planned.")}</p></details>${beta}</div>`;
 const licencePage = `<div class="wrap sub"><h1>${l("Лицензии","Licences")}</h1>
   <p>${l("© 2026 Devlarion. Все права на оригинальные материалы и дизайн защищены.","© 2026 Devlarion. All rights reserved for original materials and design.")}</p>
   <h2>${l("Компоненты сайта","Site components")}</h2>
   <ul>
     <li>${link("Golos Text · SIL OFL 1.1",brand+"fonts/golostext-OFL.txt")}</li>
     <li>${link("Source Serif 4 · SIL OFL 1.1",brand+"fonts/sourceserif4-OFL.txt")}</li>
     <li>${link("Animateicons · MIT",asset+"licenses/animateicons.txt")}</li>
     <li>${link("Simple Icons · CC0",asset+"licenses/simple-icons.txt")}</li>
   </ul><p>${l("Названия и знаки сторонних сервисов принадлежат их владельцам.","Third-party names and marks belong to their owners.")}</p>
 </div>`;
 const audienceContext={sales:site.sales,home,tg:id.telegram,icons,pricing:site.pricing,work,segmentPicker,llmsUrl:base+"llms.txt"};
 const otherPages={"cabinet/":renderPortalPage(lang,{home,tg:id.telegram,icons,portal:site.portal,referral:site.referral}),"licenses/":licencePage,"solutions/":renderReadySolutions(lang,id.telegram,site.ready,home),...casePages,...Object.fromEntries(segments.map(page=>[page.route,renderSegmentPage(lang,page.route,audienceContext)])),...Object.fromEntries(topics.map(page=>[page.route,renderTopicPage(lang,page.route,audienceContext)])),...Object.fromEntries(Object.keys(offerPages).map(route=>[route,renderOfferPage(lang,route,home,site.pricing)])),"links/":`<div class="wrap sub links"><small>${t.eyebrow}</small><h1>Devlarion</h1><p class="intro">${t.intro}</p>${tg}${link(t.cases,home+"#work","ghost")}${link(t.estimate,home+"#quiz","ghost")}${link("AuraWatch",home+"aurawatch/","ghost")}${channelSlot}${socials.filter(([, ,goal])=>goal!=="telegram").map(([label,href,goal])=>link(label,href,"link",goal)).join("")}<h2>${front.audience}</h2>${segments.map(page=>link(page[lang].label,home+page.route,"link")).join("")}</div>`,"aurawatch/":auBody,"privacy/":`<div class="wrap sub"><h1>${privacy}</h1>${[0,2,4].map(i=>`<h3>${privacyText[i]}</h3><p ${i===4?"data-analytics-policy":""}>${privacyText[i+1]}</p>`).join("")}<div data-operator></div>${link("Email","mailto:"+contacts.email)}</div>`};
 for(const route of [...routes,"404.html"]){
 const caseProject = work.find(project => caseRoute(project) === route);
 const audience = audiencePages.find(page=>page.route===route);
 const offer = offerPages[route]?.[lang] ?? audience?.[lang];
 const dest=url(lang,route),title=(caseProject?.name ?? offer?.title ?? (route==="licenses/"?l("Лицензии","Licences"):route==="solutions/"?l("Готовые решения","Ready-made solutions"):route==="cabinet/"?l("Личный кабинет","Client portal"):route==="aurawatch/"?"AuraWatch":route==="privacy/"?privacy:route==="404.html"?"404":route==="links/"?l("Контакты","Links"):!route?front.title:t.title.replace("<br>"," ")))+" — Devlarion";
 const alternate=url(other,route);
 const audienceSchema = audience ? (() => {
   const price = packageStartingPrice(audience.starting, site.pricing);
   return [
     {
       "@type":"Service",
       name:audience[lang].title,
       description:audience[lang].description,
       url:dest,
       provider:{"@type":"Organization",name:id.brand,url:home},
       ...(price === null ? {} : {offers:{"@type":"Offer",price,priceCurrency:"RUB",url:dest}}),
     },
     {
       "@type":"FAQPage",
       mainEntity:pageFAQ(lang,audience,audienceContext).map(([question,answer])=>({
         "@type":"Question", name:question, acceptedAnswer:{"@type":"Answer",text:answer},
       })),
     },
     {
       "@type":"BreadcrumbList",
       itemListElement:[
         {"@type":"ListItem",position:1,name:l("Главная","Home"),item:home},
         {"@type":"ListItem",position:2,name:audience[lang].label,item:dest},
       ],
     },
   ];
 })() : [];
 const schema={"@context":"https://schema.org","@graph":route==="aurawatch/"?[{"@type":"SoftwareApplication",name:"AuraWatch",operatingSystem:"iOS, watchOS",applicationCategory:"BusinessApplication"}]:[{"@type":"ProfessionalService",name:id.brand,url:home,logo:brand+"icon-512.png",sameAs:[id.telegram,id.github,id.threads],founder:{"@type":"Person",name:person}},...audienceSchema,...(!route?[{"@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]:[])]};
 files["docs/"+(ru?"ru/":"")+route+(route.endsWith(".html")?"":"index.html")]=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${navigationMotion}<title>${title}</title><meta name="description" content="${esc(caseProject?.result ?? offer?.description ?? (route==="cabinet/"?portalIntro:route==="aurawatch/"?watchIntro:!route?front.intro:t.intro))}"><link rel="canonical" href="${dest}">${["en","ru","x-default"].map(k=>`<link rel="alternate" hreflang="${k}" href="${url(k==="ru"?"ru":"en",route)}">`).join("")}<meta property="og:title" content="${title}"><meta property="og:description" content="${esc(caseProject?.result ?? offer?.description ?? (route==="cabinet/"?portalIntro:route==="aurawatch/"?watchIntro:!route?front.intro:t.intro))}"><meta property="og:type" content="website"><meta property="og:url" content="${dest}"><meta property="og:locale" content="${ru?"ru_RU":"en_US"}"><meta property="og:image" content="${brand}og-${lang}.png"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(t.title)} — Devlarion"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/svg+xml" href="${brand}favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="${brand}favicon-32.png"><link rel="icon" type="image/png" sizes="48x48" href="${brand}favicon-48.png"><link rel="apple-touch-icon" href="${brand}apple-touch-icon.png"><link rel="manifest" href="${brand}site.webmanifest"><script>${themeScript}</script>${(ru?["cyrillic","latin"]:["latin"]).map(subset=>`<link rel="preload" href="${brand}fonts/source-serif-4-${subset}.woff2" as="font" type="font/woff2" crossorigin>`).join("")}${styleLinks[!route?"home":caseProject?"case":route==="why-website/"?"picker":route==="cabinet/"?"portal":"common"]}<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<","\\u003c")}</script><script defer src="${asset}settings.js"></script><script defer src="${asset}site-version.js"></script><script defer src="${asset}studio.js"></script><script defer src="${asset}devlarion-logo.js"></script><script defer src="${asset}currency.js"></script><script defer src="${asset}commercial.js"></script><script defer src="${asset}solutions.js"></script>${audience?.paybackPackages?`<script defer src="${asset}payback.js"></script>`:""}${!route?`<script defer src="${asset}quiz.js"></script>`:""}${route==="cabinet/"?`<script defer src="${asset}portal.js"></script>`:""}<script defer src="${asset}motion.js"></script></head><body ${!route?'class="hero-page"':""} data-privacy-url="${home}privacy/" data-motion-url="${motionSite}" ${!route?'data-version-home':""}><a class="skip" href="#main">${l("К содержанию","Skip to content")}</a><header><div class="wrap bar">${logo("header",!route)}<nav>${servicesMenu()}${navRest}</nav><div class="tools"><button class="menu" data-menu aria-label="${l("Меню","Menu")}">☰</button><a class="header-social" href="${id.threads}" data-goal="threads" aria-label="Threads">${icons.threads}</a>${channelSlot}${regionControl(lang,asset)}${themes}${shareButton("","header-share",true)}<a href="${alternate}">${ru?"EN":"RU"}</a>${tg}</div></div></header><main id="main">${route==="404.html"?`<div class="wrap sub notfound"><devlarion-logo variant="mark" height="72" view aria-hidden="true"></devlarion-logo><h1>404</h1><p>${l("Страница не найдена.","Page not found.")}</p>${link(l("На главную","Back to homepage"),home,"button")}</div>`:otherPages[route]??homeHTML}</main>${foot}${mobileBar(route)}<div id="progress" aria-hidden="true"></div><dialog id="commands" aria-label="${l("Быстрые действия","Quick actions")}"><form method="dialog"><button aria-label="${l("Закрыть","Close")}">×</button></form><nav>${servicesMenu()}${navRest}<a href="${home}#quiz">${t.estimate}</a><a href="${motionSite}" data-site-version="motion">${styles.link}</a>${studioLink}${link("Threads",id.threads,"link","threads")}<a href="${alternate}">${ru?"English":"Русский"}</a><button type="button" class="select-theme">${l("Сменить тему","Change theme")}</button>${shareButton()}${tg}</nav></dialog>${shareDialog}</body></html>`;
 }
 files[ru?"README.ru.md":"README.md"]=`# Devlarion\n\n${t.eyebrow} · ${person}\n\n${t.intro}\n\n[${t.cases}](${home}#work) · [${t.estimate}](${home}#quiz) · [${t.cta}](${id.telegram}) · [Threads](${id.threads}) · [${ru?"English":"Русский"}](${ru?"README.md":"README.ru.md"})\n\n## ${homeCopy[lang].audience}\n\n${segments.map(page=>`- [${page[lang].label}](${home}${page.route})`).join("\n")}\n\n## ${l("Рост","Growth")}\n\n${topics.map(page=>`- [${page[lang].label}](${home}${page.route})`).join("\n")}\n\n## ${l("Стоимость разработки","Project pricing")}\n\n${packages.map(p=>`- [${p.title}](${home}#small-business) — ${l("от", "from")} ${formatStartingPrice(p.rub,lang)}`).join("\n")}\n\n${l("Для компаний любого размера подбираем условия и возможную скидку индивидуально. Итоговую стоимость сообщим после созвона.","For companies of any size, we tailor the terms and discuss any applicable discount. We send the final quote after our call.")}\n\n## ${t.work}\n\n${work.map(c=>`- [${c.name}](${c.href}) — ${c.result}`).join("\n")}\n\n## ${t.products}\n\n- [AuraWatch](${home}aurawatch/) — ${watchIntro}\n${lab.filter(p=>p.name!=="AuraWatch").map(p=>`- **${p.name}** — ${p.summary}`).join("\n")}\n\n${l("Редактирование сайта и учёт рефералов описаны в [инструкции](scripts/README.md).","See the [site maintenance guide](scripts/README.md) for the editor and referral ledger.")}\n`;
}
files["docs/sitemap.xml"]='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+["en","ru"].flatMap(l=>routes.map(r=>"<url><loc>"+url(l,r)+"</loc></url>")).join("")+"</urlset>";
const robotsAgents = ["*", "GPTBot", "OAI-SearchBot", "PerplexityBot", "YandexBot", "Google-Extended"];
files["docs/robots.txt"] = robotsAgents.map(agent => `User-agent: ${agent}\nAllow: /\n`).join("\n") + `\nSitemap: ${base}sitemap.xml\n`;
const llmsServices = [
  ["Сайт для заявок", "Enquiry website", "website/", ["landing","small"]],
  ["Сайт компании с админкой", "Company website with CMS", "business/", ["web","small"]],
  ["Интернет-магазин", "Online shop", "business/", ["shop","small"]],
  ["Telegram- или MAX-бот", "Telegram or MAX bot", "telegram-bot/", ["automation","small"]],
  ["Мини-приложение с каталогом", "Catalogue mini app", "telegram-bot/", ["mini","small"]],
  ["ИИ-ассистент", "AI assistant", "ai-assistant/", ["assistant","small"]],
  ["Пилот мультиагентной системы", "Multi-agent pilot", "enterprise/", ["agents","medium"]],
  ["SEO-оптимизация", "SEO", "seo/", ["seo","small"]],
  ["GEO-аудит", "GEO audit", "geo/", ["geo","small"]],
  ["Сопровождение", "Support", "support/", ["support","small"]],
];
const llmsPrices = llmsServices.map(([ru,en,route,reference]) => {
  const price = packageStartingPrice(reference, site.pricing);
  const quote = price === null ? "по смете / on request" : "от " + formatStartingPrice(price, "ru") + (route==="support/"?" / мес.":"");
  return `- [${ru} / ${en}](${url("ru",route)}): ${quote}`;
}).join("\n");
const llmsPages = pages => pages.map(page => `- [${page.ru.label}](${url("ru",page.route)}) · [${page.en.label}](${url("en",page.route)})`).join("\n");
files["docs/llms.txt"] = `# Devlarion

> Студия разработки Ильи Ларионова. Сайты, боты, мини-приложения, ИИ и интеграции, SEO, GEO и сопровождение.
> Ilia Larionov’s development studio builds websites, bots, mini apps, AI tools and integrations and offers SEO, GEO and ongoing support.

## Услуги и стартовые цены / Services and starting prices

${llmsPrices}

## Для кого / Who we work with

${llmsPages(segments)}

## Рост / Growth

${llmsPages(topics)}

## Контакты / Contact

- [Telegram](${id.telegram})
- [Threads](${id.threads})
- [Сайт](${url("ru")}) · [Website](${url("en")})
`;

if (base === "https://devlarion.ru/") {
  files["docs/yandex_f3f4cfac969a4d65.html"] = `<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: f3f4cfac969a4d65</body>
</html>
`;
}
for(const [path,raw] of Object.entries(files)){
 const data = path.endsWith(".html")
   ? versionedAssets.reduce((html, [name, version]) => html.replaceAll(
       `="${asset}${name}"`, `="${asset}${name}?v=${version}"`
     ), raw.replace(/[ 	]+$/gm,""))
   : raw;
 const f=new URL(path,root);
 if(process.argv.includes("--check")){if(await readFile(f,"utf8").catch(()=>null)!==data)throw Error("Out of date: "+path);}
 else {await mkdir(new URL(".",f),{recursive:true});await writeFile(f,data);}
}
