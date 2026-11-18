import { mkdir, readFile, writeFile } from "node:fs/promises";
import { copy, identity, work } from "../content/profile.mjs";

const check = process.argv.includes("--check");
const projectRoot = new URL("../", import.meta.url);
const sendIcon = (await readFile(new URL("docs/assets/contact-send.svg", projectRoot), "utf8")).trim();
const sendIconSource = "https://21st.dev/@avijit07x/components/hu-send";
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
);
const telegram = (lang) => identity.telegram + "?start=contact_" + lang;
const external = (label, href, className = "text-link") =>
  '<a class="' + className + '" href="' + escapeHtml(href) + '">' + escapeHtml(label) + ' <span aria-hidden="true">↗</span></a>';
const tags = (items) => '<ul class="tags">' + items.map((tag) => "<li>" + escapeHtml(tag) + "</li>").join("") + "</ul>";
const navIds = ["work", "studio", "milestones"];
const identityLabel = identity.name + " | " + identity.nameRu + " ‣ " + identity.brand;
const profileUrl = (lang) => identity.portfolio ? new URL(lang === "ru" ? "ru/" : "./", identity.portfolio).href : identity.github;
const localeName = (lang) => lang === "en" ? identity.name : identity.nameRu;

function page(lang, text) {
  const prefix = lang === "en" ? "./" : "../";
  const alternate = lang === "en" ? "./ru/" : "../";
  const alternateLang = lang === "en" ? "ru" : "en";
  const projects = text.projects.map((project) => {
    const { href, image } = work[project.id];
    const preview = image
      ? '<figure class="project-figure"><img class="project-image" src="' + prefix + 'assets/' + image.file
        + '" width="' + image.width + '" height="' + image.height + '" alt="' + escapeHtml(project.imageAlt || "") + '" loading="lazy">'
        + (project.imageCaption ? '<figcaption>' + escapeHtml(project.imageCaption) + '</figcaption>' : "") + '</figure>'
      : "";
    const link = href ? external(text.projectLink, href) : "";
    return '<article class="project" id="' + project.id + '"><header class="project-header"><p class="project-type">'
      + escapeHtml(project.type) + '</p><h3>' + escapeHtml(project.title) + '</h3></header>' + preview
      + '<div class="project-content"><p class="project-lead">' + escapeHtml(project.lead) + '</p><p>'
      + escapeHtml(project.detail) + '</p>' + tags(project.tags) + link + '</div></article>';
  }).join("\n");
  const current = text.current.map(([id, name, caption]) =>
    '<li><a href="#' + id + '"><strong>' + escapeHtml(name) + '</strong> <span aria-hidden="true">↓</span>'
      + '<span class="current-caption">' + escapeHtml(caption) + '</span></a></li>'
  ).join("\n");
  const lab = text.lab.map((project) => {
    const link = project.link ? external(...project.link) : "";
    const story = project.story
      ? '<details class="case-detail"><summary aria-label="' + escapeHtml(text.caseLabel + " · " + project.name) + '">'
        + escapeHtml(text.caseLabel) + '</summary><div class="case-body">'
        + project.story.map(([heading, detail]) =>
          '<div><h4>' + escapeHtml(heading) + '</h4><p>' + escapeHtml(detail) + '</p></div>'
        ).join("") + '</div></details>'
      : "";
    return '<li id="' + project.id + '"><h3>' + escapeHtml(project.name) + '</h3><p class="project-status">'
      + escapeHtml(project.status) + '</p><p>' + escapeHtml(project.summary) + '</p>' + story + link + '</li>';
  }).join("\n");
  const milestones = text.milestones.map(([name, detail, href]) =>
    '<li><h3>' + (href ? external(name, href) : escapeHtml(name)) + '</h3><p>' + escapeHtml(detail) + '</p></li>'
  ).join("\n");
  const challenges = text.challenges.map(([name, detail]) =>
    '<li><h3>' + escapeHtml(name) + '</h3><p>' + escapeHtml(detail) + '</p></li>'
  ).join("\n");
  const sectionNav = text.nav.map((label, index) => '<a href="#' + navIds[index] + '">' + escapeHtml(label) + '</a>').join("");
  const contact = '<a class="button button-contact" href="' + escapeHtml(telegram(lang)) + '">'
    + escapeHtml(text.contact) + sendIcon + '</a>';
  const themeChoices = Object.entries(text.theme).filter(([key]) => key !== "label").map(([key, label]) =>
    '<button type="button" data-theme-choice="' + key + '" aria-pressed="' + String(key === "copper") + '">' + escapeHtml(label) + '</button>'
  ).join("");
  const shareUrl = profileUrl(lang);
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(identityLabel)}</title>
  <meta name="description" content="${escapeHtml(text.intro)}">
  <link rel="alternate" hreflang="${alternateLang}" href="${alternate}">
  <script src="${prefix}assets/theme.js"></script>
  <script src="${prefix}assets/share.js" defer></script>
  <link rel="stylesheet" href="${prefix}assets/portfolio.css">
</head>
<body>
  <a class="skip" href="#main">${escapeHtml(text.skip)}</a>
  <header class="site-header wrap">
    <a class="wordmark" href="${prefix}" aria-label="${escapeHtml(identity.brand)}">${escapeHtml(identity.brand)}</a>
    <nav aria-label="${lang === "en" ? "Portfolio" : "Портфолио"}">${sectionNav}</nav>
    <div class="header-actions">
      <div class="themes" role="group" aria-label="${escapeHtml(text.theme.label)}" data-theme-control hidden>
        ${themeChoices}
      </div>
      <a class="language" href="${alternate}" lang="${alternateLang}" hreflang="${alternateLang}">${text.language} <span aria-hidden="true">↗</span></a>
    </div>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <h1 id="hero-title" aria-label="${escapeHtml(identityLabel)}" class="identity-banner">
            <span class="identity-name" lang="en">${escapeHtml(identity.name)}</span>
            <span class="identity-line"><span aria-hidden="true">|</span> <span lang="ru">${escapeHtml(identity.nameRu)}</span> <span aria-hidden="true">‣</span> <span class="identity-brand">${escapeHtml(identity.brand)}</span></span>
          </h1>
          <p class="hero-role">${escapeHtml(text.role)}</p>
          <p class="hero-intro">${escapeHtml(text.intro)}</p>
          <div class="hero-actions">${contact}<a class="text-link" href="#work">${escapeHtml(text.nav[0])} <span aria-hidden="true">↓</span></a></div>
        </div>
        <aside class="current-work" aria-labelledby="current-title">
          <h2 id="current-title">${escapeHtml(text.currentTitle)}</h2>
          <ul>${current}</ul>
        </aside>
      </div>
    </section>
    <section class="wrap section" id="work">
      <div class="section-heading"><h2>${escapeHtml(text.nav[0])}</h2></div>
      <div class="project-grid">${projects}</div>
    </section>
    <section class="studio section" id="studio">
      <div class="wrap">
        <div class="studio-grid">
          <div><h2>${escapeHtml(text.studioTitle)}</h2><p class="studio-copy">${escapeHtml(text.studio)}</p></div>
          <div><h3 class="stack-title">${escapeHtml(text.stackTitle)}</h3>${tags(identity.stack)}</div>
        </div>
        <section class="product-section" aria-labelledby="products-title">
          <h2 id="products-title">${escapeHtml(text.labTitle)}</h2>
          <ul class="lab-list">${lab}</ul>
        </section>
      </div>
    </section>
    <section class="wrap section" id="milestones">
      <div class="section-heading"><h2>${escapeHtml(text.nav[2])}</h2></div>
      <ul class="milestones">${milestones}</ul>
      <h3 class="challenge-title">${escapeHtml(text.challengeTitle)}</h3>
      <ul class="milestones challenges">${challenges}</ul>
    </section>
    <section class="wrap section" id="contact">
      <div class="contact-panel"><div><h2>${escapeHtml(text.contactTitle)}</h2><p>${escapeHtml(text.contactCopy)}</p></div><div>${contact}<p class="contact-status">${escapeHtml(text.contactStatus)}</p></div></div>
    </section>
  </main>
  <footer class="wrap site-footer">
    <span>${escapeHtml(identity.brand)} · ${escapeHtml(localeName(lang))}</span>
    ${external(text.profile, identity.github)}
    <div class="share" data-share data-title="${escapeHtml(identityLabel)}" data-copied="${escapeHtml(text.share.copied)}">
      <a class="text-link" data-share-link href="${escapeHtml(shareUrl)}">${escapeHtml(text.share.action)}</a>
      <label data-share-manual hidden>${escapeHtml(text.share.manual)}<input type="url" value="${escapeHtml(shareUrl)}" readonly></label>
      <span class="share-status" data-share-status role="status"></span>
    </div>
    <a class="language" href="${alternate}" lang="${alternateLang}">${text.language}</a>
    <a class="icon-credit" href="${sendIconSource}">${escapeHtml(text.iconCredit)}</a>
  </footer>
</body>
</html>
`;
}

function profile(lang, text) {
  const other = lang === "en" ? "README.ru.md" : "README.md";
  const profileLinks = [
    "[" + text.language + "](" + other + ")",
    identity.portfolio ? "[" + text.portfolioLabel + "](" + profileUrl(lang) + ")" : "",
    "[" + text.contact + "](" + telegram(lang) + ")"
  ].filter(Boolean).join(" · ");
  return [
    "<!-- Generated by node scripts/build.mjs from content/profile.mjs. -->",
    "# " + identityLabel,
    "**" + text.role + "**",
    text.intro,
    profileLinks,
    "## " + text.nav[0],
    text.projects.map((project) => [
      "### " + project.title,
      "**" + project.type + "**",
      project.lead + " " + project.detail,
      project.tags.map((tag) => "`" + tag + "`").join(" "),
      work[project.id].href ? "[" + text.projectLink + "](" + work[project.id].href + ")" : "",
      project.id === "orient-logic"
        ? '<img src="docs/assets/' + work[project.id].image.file + '" alt="' + escapeHtml(project.imageAlt) + '" width="680">'
        : ""
    ].filter(Boolean).join("\n\n")).join("\n\n"),
    "## " + text.labTitle,
    text.lab.map((project) => {
      const link = project.link ? " [" + project.link[0] + "](" + project.link[1] + ")." : "";
      const overview = "- **" + project.name + "** · " + project.status + ". " + project.summary + link;
      const story = project.story
        ? "\n\n<details>\n<summary>" + escapeHtml(text.caseLabel + " · " + project.name) + "</summary>\n\n"
          + project.story.map(([heading, detail]) => "**" + heading + "**. " + detail).join("\n\n") + "\n\n</details>"
        : "";
      return overview + story;
    }).join("\n\n"),
    "## " + text.studioTitle,
    text.studio + "\n\n" + identity.stack.map((tag) => "`" + tag + "`").join(" "),
    "## " + text.nav[2],
    text.milestones.map(([name, detail, href]) =>
      "- **" + (href ? "[" + name + "](" + href + ")" : name) + "** · " + detail
    ).join("\n"),
    "<details>\n<summary>" + text.challengeTitle + "</summary>\n\n"
      + text.challenges.map(([name, detail]) => "- **" + name + "** · " + detail).join("\n")
      + "\n\n</details>",
    "## " + text.contactTitle,
    text.contactCopy + "\n\n[" + text.contact + "](" + telegram(lang) + ") · " + text.contactStatus,
    "[" + text.share.action + "](" + profileUrl(lang) + ")"
  ].join("\n\n") + "\n";
}

const output = {
  "README.md": profile("en", copy.en),
  "README.ru.md": profile("ru", copy.ru),
  "docs/index.html": page("en", copy.en),
  "docs/ru/index.html": page("ru", copy.ru)
};

for (const [name, text] of Object.entries(output)) {
  const destination = new URL(name, projectRoot);
  if (check) {
    const existing = await readFile(destination, "utf8").catch(() => null);
    if (existing !== text) {
      console.error(name + " is out of date. Run node scripts/build.mjs.");
      process.exitCode = 1;
    }
  } else {
    await mkdir(new URL(".", destination), { recursive: true });
    await writeFile(destination, text);
  }
}
