import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { identity as id, copy } from "../content/profile.mjs";
import { cases, products, contacts } from "../content/work.mjs";
import { starterPackages, serviceCards, renderQuiz } from "../content/pricing.mjs";
const root=new URL("../",import.meta.url), files={}, icons={};
for(const f of await readdir(new URL("docs/assets/icons/",root))) icons[f.slice(0,-4)]=await readFile(new URL("docs/assets/icons/"+f,root),"utf8");
const base=id.portfolio, asset=base+"assets/", brand=asset+"brand/";
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const link=(label,url,style="link",goal="")=>`<a class="${style}" href="${esc(url)}" ${goal?'data-goal="'+goal+'"':''}>${esc(label)} ${icons.diagonal}</a>`;
const routes=["","links/","aurawatch/","privacy/"];
const url=(l,r="")=>base+(l==="ru"?"ru/":"")+r;
const serviceIcon={agents:"ai","private-ai":"server",web:"web",platform:"layers",mini:"mini",mobile:"mobile",automation:"bot",design:"design",custom:"spark",support:"support"};
const pic=(file,alt,size)=>`<img loading="lazy" width="${size[0]}" height="${size[1]}" src="${asset+file}" alt="${esc(alt)}">`;
for(const lang of ["ru","en"]){
 const ru=lang==="ru", other=ru?"en":"ru", t=copy[lang], l=(a,b)=>ru?a:b, home=url(lang), person=id.founder[lang];
 const tg=link(t.cta,id.telegram,"button","telegram"), beta=link(l("Хочу в закрытую бету","Join the closed beta"),id.telegram+"?text="+encodeURIComponent(l("Хочу участвовать в закрытой бете AuraWatch.","I'd like to join the AuraWatch closed beta.")),"button","beta");
 const work=cases[lang], lab=products[lang], services=serviceCards(lang);
 const socials=[["Telegram",id.telegram,"telegram"],["Threads",id.threads,"threads"],["GitHub",id.github,"github"],["Email","mailto:"+contacts.email,"email"]].filter(x=>x[1]);
 const channelSlot='<span data-channel hidden></span>';
 const social=channelSlot+socials.map(([k,v,g])=>link(k,v,"link",g)).join("");
 const featured = work.find(c => c.name === "Orient Logic");
 const casePreview = `<a class="featured-case" href="#orient-logic">
   <div class="featured-stage">
     <div class="featured-browser"><span aria-hidden="true">orientlogic.ru</span><img src="${asset+featured.image}" width="1440" height="900" alt="" fetchpriority="high"></div>
     <img class="featured-phone" src="${asset+featured.mobile}" width="390" height="844" alt="">
   </div>
   <div class="featured-caption"><div><small>${l("Клиентский проект · Логистика","Client project · Logistics")}</small><strong>Orient Logic</strong><span>${l("Расчёт доставки с сайта в Telegram","From freight enquiry to Telegram")}</span></div><span class="featured-arrow" aria-hidden="true">↓</span></div>
 </a>`;
 const nav=t.nav.map((a,i)=>`<a href="${home}#${["services","work","bureau","contact"][i]}">${a}</a>`).join("");
 const logo=`<a class="wordmark" href="${home}"><img src="${brand}mark.svg" alt="">Devlarion</a>`;
 const themeNames=l(["Авто","Медь","Тёмно-синяя","Шалфей"],["Auto","Copper","Midnight","Sage"]);
 const themeLabel=l("Цветовая тема","Colour theme");
 const themes=`<div class="theme-picker" hidden>
   <button type="button" id="theme" aria-label="${themeLabel}" title="${themeLabel}" aria-expanded="false" aria-controls="theme-choices">
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><g class="theme-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"></path></g><path class="theme-moon" d="M20.5 14A8.8 8.8 0 0 1 10 3.5 8.8 8.8 0 1 0 20.5 14Z"></path></svg>
   </button>
   <fieldset id="theme-choices" hidden><legend>${themeLabel}</legend>${["auto","copper","midnight","sage"].map((v,i)=>`<label><input type="radio" name="theme-choice" value="${v}"><span>${themeNames[i]}</span></label>`).join("")}</fieldset>
 </div>`;
 const foot=`<footer class="wrap"><div class="row">${logo}<div class="social">${social}</div></div><div class="row fine"><span>${l("Разработка","Built by")} · Devlarion</span><a href="${home}privacy/">${l("Конфиденциальность","Privacy")}</a><a href="${asset}licenses/animateicons.txt">${l("Лицензии","Licences")}</a><button hidden data-preferences>${l("Настройки аналитики","Analytics preferences")}</button><button data-share>${l("Поделиться","Share")} ↗</button></div></footer>`;
 const mobileBar=route=>route==="links/"?"":`<div class="mobilebar">${route==="aurawatch/"?beta:tg}${link("Threads",id.threads,"link","threads")}</div>`;
 const section=(key,title,content,cls="")=>`<section id="${key}" class="section wrap ${cls}"><h2>${title}</h2>${content}</section>`;
 const watch=`<div class="watch" role="img" aria-label="${l("Демонстрация экрана AuraWatch","AuraWatch screen demo")}"><div><small>AuraWatch</small><b data-watch>${l("Какие следующие шаги?","What are the next steps?")}</b><i></i></div></div>`;
 const watchIntro=l("Ассистент для iPhone и Apple Watch в закрытом бета-тестировании. В режиме «Тихий суфлёр» подсказка появляется на затемнённом экране часов.","An assistant for iPhone and Apple Watch, currently in closed beta. Silent Prompter displays a suggestion on the dimmed watch face.");
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
 const renderCases = items => items.map(c => {
   return `<article class="case exhibit"${c.name === "Orient Logic" ? ' id="orient-logic"' : ""}>
     <a class="case-cover" href="${esc(c.href)}" aria-label="${esc(c.name)}">
       <div class="case-window">${pic(c.image,c.alt,c.size)}</div>
       <img class="case-mobile" src="${asset+c.mobile}" width="390" height="844" alt="" loading="lazy">
     </a>
     <div class="exhibit-copy"><small>${esc(c.type)}</small><h4>${esc(c.name)}</h4>
       <p>${esc(c.result)}</p><details><summary>${l("Задача и решение","Project details")}</summary>
       <dl><dt>${l("Задача","Brief")}</dt><dd>${esc(c.task)}</dd><dt>${l("Решение","Build")}</dt><dd>${esc(c.solution)}</dd></dl></details>
       <div class="exhibit-foot"><span class="tags">${c.tags.map(esc).join(" · ")}</span>${link(l("Смотреть","View project"),c.href)}</div>
     </div></article>`;
 }).join("");
 const caseHTML = [
   [l("Клиентские проекты", "Client projects"), work.filter(c => !c.concept)],
   [l("Концепты", "Concept studies"), work.filter(c => c.concept)]
 ].map(([title, items]) => `<h3 class="work-subheading">${title}</h3><div class="work-gallery">${renderCases(items)}</div>`).join("");

 const packages = starterPackages(lang);
 const homeHTML=`<section class="hero"><div class="wrap hero-grid"><div class="hero-copy"><p class="eyebrow"><i></i>${t.eyebrow}</p><h1>${t.title}</h1><p class="intro">${t.intro}</p><div class="actions"><a class="button" href="#small-business">${l("Для малого бизнеса","For small businesses")} ↓</a><a class="ghost" href="#companies">${l("Для компаний","For companies")} ↓</a></div><a class="byline" href="#bureau">${person} · ${t.about}</a></div>${casePreview}</div></section>
 <div class="stack"><div class="wrap stack-rail">${[false,true].map(repeat=>`<div class="stack-track" ${repeat?'aria-hidden="true"':""}>Python <i>/</i> FastAPI <i>/</i> SwiftUI <i>/</i> Next.js <i>/</i> Telegram <i>/</i> On-premise AI <i>/</i></div>`).join("")}</div></div>
 ${section("services",t.services,`<div id="small-business" class="service-group"><h3>${l("Стартовые пакеты для малого бизнеса","Starter packages for small businesses")}</h3><p>${l("Для самозанятых, ИП и небольших команд. В каждом пакете один сценарий. Если нужны оплата, CRM или дополнительные функции, оценим их отдельно.","For freelancers, sole proprietors and small teams. Each package covers one workflow. We quote payment processing, CRM integrations and extra features separately.")}</p><div class="service-grid">${packages.map(p=>`<article><span class="service-mark">${icons[serviceIcon[p.id]]}</span><h4>${esc(p.title)}</h4><p>${esc(p.description)}</p><div class="rate"><strong>${esc(p.price)}</strong></div>${link(l("Обсудить пакет","Discuss this package"),id.telegram+"?text="+encodeURIComponent(l("Хочу обсудить пакет «","I'd like to discuss the “")+p.title+l("» (","” (")+p.price+")."),"link","telegram")}</article>`).join("")}</div></div>
 <div id="companies" class="service-group"><h3>${l("Индивидуальные проекты для компаний","Tailored projects for companies")}</h3><p>${l("Работаем с небольшими, средними и крупными компаниями. На созвоне обсудим задачи, интеграции и сроки. Подберём условия, учтём возможную персональную скидку и после созвона пришлём смету с итоговой стоимостью.","We work with small, mid-sized and large companies. On a call, we’ll discuss your goals, integrations and timeline. After the call, you’ll receive a written quote with your final price and any discount we can offer for your project.")}</p><div class="service-grid">${services.map(s=>`<article><span class="service-mark">${icons[serviceIcon[s.id]]}</span><h4>${esc(s.title)}</h4><p>${esc(s.description)}</p></article>`).join("")}</div><p>${link(l("Договориться о созвоне","Arrange a call"),id.telegram+"?text="+encodeURIComponent(l("Хочу обсудить проект компании и получить индивидуальную смету.","I'd like to arrange a call for a tailored company quote.")),"link","telegram")}</p></div>
 <aside class="service-support"><div><strong>${l("Два месяца поддержки","Two months of support")}</strong><p>${l("Исправления в согласованном объёме входят в каждый проект.","Every project includes fixes within the agreed scope.")}</p></div>${link(t.estimate,"#quiz")}</aside>`)}
 ${section("work",t.work,caseHTML)}
 ${section("process",t.process,`<ol class="steps">${t.steps.map(([h,p])=>`<li><h3>${h}</h3><p>${p}</p></li>`).join("")}</ol>`)}
 <section class="product-feature wrap"><div><small>watchOS / iOS</small><h2>AuraWatch</h2><p>${watchIntro}</p><div class="actions">${beta}${link(l("Подробнее","Explore"),home+"aurawatch/")}</div></div>${watch}</section>
 ${section("products",t.products,`<div class="lab product-list">${lab.map(p=>`<article class="${p.preview?"product-card":"product-lead"}">${productPreviews[p.preview] ?? ""}<div><small>${esc(p.status)}</small><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p>${p.links.length?`<div class="product-links">${p.links.map(a=>link(a.label,a.href)).join("")}</div>`:""}</div></article>`).join("")}</div>`)}
 ${section("bureau",t.bureau,`<div class="founder-grid"><div><h3>${person}</h3><small>${t.about}</small><p class="intro">${t.bio}</p><p>${l("ДАНО · грант Центрального университета · «Артек»","DANO · Central University grant · Artek")}</p><div class="founder-contact">${link(l("Написать Илье","Contact Ilia"),id.telegram,"link","telegram")}</div></div><aside class="discovery"><h3>${l("На первом созвоне","On the first call")}</h3><ol>
   <li>${l("Вы показываете, как клиент оставляет заявку сегодня.","Show us how a customer makes an enquiry today.")}</li>
   <li>${l("Разбираем, на каких шагах команда теряет время.","Identify the steps that take up your team’s time.")}</li>
   <li>${l("Выбираем, что войдёт в первую версию проекта.","Decide what belongs in the first release.")}</li>
 </ol></aside></div>`)}
 ${section("faq",t.faq,t.faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join(""))}
 ${section("quiz",t.estimate,renderQuiz(lang,id.telegram))}
 ${section("contact",t.ask,`<p class="intro">${t.close}</p><div class="actions">${tg}${channelSlot}${link("Threads",id.threads,"link","threads")}</div>`)}`;
 const privacy=l("Конфиденциальность","Privacy");
 const privacyText=l(["На этом сайте","Калькулятор обрабатывает ответы в вашем браузере. Выбранная тема сохраняется локально. Сайт размещён на GitHub Pages. Для доставки страниц хостинг обрабатывает технические сведения о соединении.","Переход в Telegram","По нажатию кнопки вы открываете Telegram. Вы сами решаете, отправить ли сообщение и какие сведения указать.","Аналитика","Счётчик Яндекс Метрики и запись сеансов отключены. По вопросам обработки данных напишите основателю."],["On this site","The estimator processes answers in your browser. Your theme preference is saved locally. GitHub Pages hosts this site and processes technical connection information to serve its pages.","Opening Telegram","Contact buttons open Telegram. You choose whether to send a message and which information to include.","Analytics","Yandex Metrica and session recording are disabled. Contact the founder with questions about data handling."]);
 const auBody=`<div class="wrap sub"><small>Devlarion / iOS + watchOS</small><h1>AuraWatch</h1><div class="product-feature"><div><p class="intro">${watchIntro}</p>${beta}</div>${watch}</div><h2>${l("Как работает суфлёр","How Silent Prompter works")}</h2><ol class="steps">${l([["Начать","Пользователь включает сеанс на часах."],["Получить подсказку","Звук передаётся на сервер для обработки и расшифровки. Ответ появляется на запястье."],["Завершить","Три нажатия на Digital Crown останавливают сеанс."]],[["Start","The wearer starts a session on the watch."],["Read the suggestion","Audio is sent to the server for processing and transcription. The response appears on the wrist."],["Finish","Press the Digital Crown three times to stop the session."]]).map(([a,b])=>`<li><h3>${a}</h3><p>${b}</p></li>`).join("")}</ol><h2>${privacy}</h2><p>${l("Материалы сеанса хранятся в базе до удаления пользователем или до истечения 180 дней. Включайте микрофон с согласия участников разговора.","Session data is stored until the user deletes it or 180 days have passed. Obtain participants’ consent before turning on the microphone.")}</p><details><summary>${l("Какие устройства поддерживаются?","Which devices are supported?")}</summary><p>${l("Первый релиз рассчитан на iOS и watchOS. Android и часы других брендов — в планах.","The first release targets iOS and watchOS. Android and other watch brands are planned.")}</p></details>${beta}</div>`;
 const otherPages={"links/":`<div class="wrap sub links"><small>${t.eyebrow}</small><h1>Devlarion</h1><p class="intro">${t.intro}</p>${tg}${link(t.cases,home+"#work","ghost")}${link(t.estimate,home+"#quiz","ghost")}${link("AuraWatch",home+"aurawatch/","ghost")}${channelSlot}${socials.filter(([, ,goal])=>goal!=="telegram").map(([label,href,goal])=>link(label,href,"link",goal)).join("")}</div>`,"aurawatch/":auBody,"privacy/":`<div class="wrap sub"><h1>${privacy}</h1>${[0,2,4].map(i=>`<h3>${privacyText[i]}</h3><p ${i===4?"data-analytics-policy":""}>${privacyText[i+1]}</p>`).join("")}<div data-operator></div>${link("Email","mailto:"+contacts.email)}</div>`};
 for(const route of [...routes,"404.html"]){
 const dest=url(lang,route),title=(route==="aurawatch/"?"AuraWatch":route==="privacy/"?privacy:route==="404.html"?"404":route==="links/"?l("Контакты","Links"):t.title.replace("<br>"," "))+" — Devlarion";
 const alternate=url(other,route);
 const schema={"@context":"https://schema.org","@graph":route==="aurawatch/"?[{"@type":"SoftwareApplication",name:"AuraWatch",operatingSystem:"iOS, watchOS",applicationCategory:"BusinessApplication"}]:[{"@type":"ProfessionalService",name:id.brand,url:home,sameAs:[id.telegram,id.github,id.threads],founder:{"@type":"Person",name:person}},...(!route?[{"@type":"FAQPage",mainEntity:t.faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}]:[])]};
 files["docs/"+(ru?"ru/":"")+route+(route.endsWith(".html")?"":"index.html")]=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${esc(route==="aurawatch/"?watchIntro:t.intro)}"><link rel="canonical" href="${dest}">${["en","ru","x-default"].map(k=>`<link rel="alternate" hreflang="${k}" href="${url(k==="ru"?"ru":"en",route)}">`).join("")}<meta property="og:title" content="${title}"><meta property="og:description" content="${esc(route==="aurawatch/"?watchIntro:t.intro)}"><meta property="og:type" content="website"><meta property="og:url" content="${dest}"><meta property="og:locale" content="${ru?"ru_RU":"en_US"}"><meta property="og:image" content="${brand}og-${lang}.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(t.title)} — Devlarion"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${brand}favicon.svg"><link rel="apple-touch-icon" href="${brand}apple-touch-icon.png"><link rel="manifest" href="${brand}site.webmanifest"><link rel="stylesheet" href="${brand}fonts.css"><link rel="stylesheet" href="${asset}portfolio.css"><script src="${asset}theme.js"></script><script type="application/ld+json">${JSON.stringify(schema).replaceAll("<","\\u003c")}</script><script defer src="${asset}settings.js"></script><script defer src="${asset}studio.js"></script>${!route?`<link rel="stylesheet" href="${asset}quiz.css"><link rel="stylesheet" href="${asset}home.css"><link rel="stylesheet" href="${asset}cases.css"><script defer src="${asset}quiz.js"></script>`:""}</head><body data-privacy-url="${home}privacy/"><a class="skip" href="#main">${l("К содержанию","Skip to content")}</a><header><div class="wrap bar">${logo}<nav>${nav}</nav><div class="tools"><button class="menu" data-menu aria-label="${l("Меню","Menu")}">☰</button><a class="header-social" href="${id.threads}" data-goal="threads" aria-label="Threads">@</a>${channelSlot}${themes}<a href="${alternate}">${ru?"EN":"RU"}</a>${tg}</div></div></header><main id="main">${route==="404.html"?`<div class="wrap sub notfound"><h1>404</h1><p>${l("Страница не найдена.","Page not found.")}</p>${link(l("На главную","Back to homepage"),home,"button")}</div>`:otherPages[route]??homeHTML}</main>${foot}${mobileBar(route)}<div id="progress" aria-hidden="true"></div><dialog id="commands" aria-label="${l("Быстрые действия","Quick actions")}"><form method="dialog"><button aria-label="${l("Закрыть","Close")}">×</button></form><nav>${nav}<a href="${home}#quiz">${t.estimate}</a><a href="${alternate}">${ru?"English":"Русский"}</a><button class="select-theme">${l("Сменить тему","Change theme")}</button>${tg}</nav></dialog></body></html>`;
 }
 files[ru?"README.ru.md":"README.md"]=`# Devlarion\n\n${t.eyebrow} · ${person}\n\n${t.intro}\n\n[${t.cases}](${home}#work) · [${t.estimate}](${home}#quiz) · [${t.cta}](${id.telegram}) · [Threads](${id.threads}) · [${ru?"English":"Русский"}](${ru?"README.md":"README.ru.md"})\n\n## ${l("Стоимость разработки","Project pricing")}\n\n${packages.map(p=>`- [${p.title}](${home}#small-business) — ${p.price}`).join("\n")}\n\n${l("Для компаний любого размера подбираем условия и возможную скидку индивидуально. Итоговую стоимость сообщим после созвона.","For companies of any size, we tailor the terms and discuss any applicable discount. We send the final quote after our call.")}\n\n## ${t.work}\n\n${work.map(c=>`- [${c.name}](${c.href}) — ${c.result}`).join("\n")}\n\n## ${t.products}\n\n- [AuraWatch](${home}aurawatch/) — ${watchIntro}\n${lab.filter(p=>p.name!=="AuraWatch").map(p=>`- **${p.name}** — ${p.summary}`).join("\n")}\n`;
}
files["docs/sitemap.xml"]='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+["en","ru"].flatMap(l=>routes.map(r=>"<url><loc>"+url(l,r)+"</loc></url>")).join("")+"</urlset>";
files["docs/robots.txt"]="User-agent: *\nAllow: /\nSitemap: "+base+"sitemap.xml\n";
for(const [path,data] of Object.entries(files)){
 const f=new URL(path,root);
 if(process.argv.includes("--check")){if(await readFile(f,"utf8").catch(()=>null)!==data)throw Error("Out of date: "+path);}
 else {await mkdir(new URL(".",f),{recursive:true});await writeFile(f,data);}
}
