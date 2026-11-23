import { esc } from "./site.mjs";

const characters = [
  ["classic", "Классика", "Classic"],
  ["quiet", "Тихий", "Quiet"],
  ["lively", "Живой", "Lively"],
  ["strict", "Строгий", "Strict"],
];

const states = [
  ["idle", "Покой", "Idle"],
  ["voice", "Голос", "Listening"],
  ["processing", "Обработка", "Processing"],
  ["streaming", "Ответ", "Replying"],
  ["stealth", "Скрытно", "Stealth"],
];

const sketches = [
  ["idle", "Покой", "Idle", [
    ["Парящая матрица", "Floating matrix"], ["Дыхание в центре", "Breathing centre"],
    ["Разомкнутые дуги", "Open arcs"], ["Блик по краю", "Edge highlight"],
    ["Два слоя", "Two layers"], ["Волна по матрице", "Matrix wave"],
  ]],
  ["voice", "Голос", "Voice", [
    ["Дуги от голоса", "Voice arcs"], ["Столбцы матрицы", "Matrix columns"],
    ["Линия превращается в волну", "Line to waveform"], ["Шкала громкости", "Volume meter"],
    ["Импульсы слогов", "Syllable pulses"],
  ]],
  ["process", "Обработка", "Processing", [
    ["Волна складывается в строки", "Waveform to lines"], ["Обход матрицы", "Matrix sweep"],
    ["Сборка из трёх групп", "Three groups converge"], ["Подчёркивание фразы", "Phrase underline"],
    ["Микрофон становится цитатой", "Microphone to quotation mark"], ["Водоворот точек", "Dot spiral"],
  ]],
  ["chat", "Переход к чату", "Chat transitions", [
    ["Орб сворачивается в заголовок", "Orb folds into the header"],
    ["Кнопка отправки становится кнопкой остановки", "Send button becomes a stop control"],
    ["Первый фрагмент ответа", "First reply fragment"], ["Возврат к последнему сообщению", "Back to the latest message"],
    ["Источник раскрывается из цитаты", "Quote expands to reveal its source"],
  ]],
  ["attach", "Вложения", "Attachments", [
    ["Раскрывающаяся стопка", "Expanding stack"], ["Из файла в превью", "File to preview"],
    ["Кольцо передачи", "Transfer ring"], ["Счётчик подборки", "Selection count"],
    ["Соседняя карточка встаёт на место", "Adjacent card slides into place"],
  ]],
  ["record", "Запись", "Recording", [
    ["Контур записи", "Recording outline"], ["От часов к первой строке", "Watch to first line"],
    ["Запись встаёт в ленту", "Recording joins the feed"], ["Раскрытие расшифровки", "Transcript expands"],
    ["Отметка синхронизации", "Sync checkmark"],
  ]],
];

export function renderAuraOrb(lang, asset) {
  const l = (ru, en) => lang === "ru" ? ru : en;
  const base = asset + "aurawatch/motion/";
  const initial = "orb/classic-processing";
  const common = states.slice(3).map(([id, ru, en]) => ["orb/" + id, l(ru, en)]);
  const groups = characters.map(([character, ru, en]) => [
    l(ru, en), states.slice(0, 3).map(([state, ru, en]) => [`orb/${character}-${state}`, l(ru, en)]),
  ]);
  groups.push([l("Общие состояния", "Shared states"), common]);
  for (const [prefix, ru, en, items] of sketches) {
    groups.push([
      l("Эскизы · " + ru, "Sketches · " + en),
      items.map(([ru, en], i) => [`archive/${prefix}-${i + 1}`, l(ru, en)]),
    ]);
  }

  return `<section class="aura-orb" id="orb" aria-labelledby="orb-title" data-motion-base="${esc(base)}">
    <h2 id="orb-title">${l("Орб «Матрица»", "The Matrix orb")}</h2>
    <div class="aura-orb-layout">
      <figure class="aura-orb-stage">
        <div><img src="${esc(base + initial)}.svg#still" loading="lazy" width="224" height="224" alt=""></div>
        <figcaption><small>${l("Веб-адаптация · SVG", "Web adaptation · SVG")}</small><strong data-orb-caption aria-live="polite">${l("Классика · Обработка", "Classic · Processing")}</strong></figcaption>
      </figure>
      <div class="aura-orb-controls">
        <p>${l("На экране часов помещаются 37 точек. По их яркости видно, когда ассистент слушает, обдумывает вопрос или уже отвечает. На часах матрицу рисует SwiftUI.", "On the watch face, 37 dots show what the assistant is doing. Their brightness changes as it listens, processes a question and streams a reply. SwiftUI draws the matrix on the watch.")}</p>
        <fieldset hidden data-orb-states><legend>${l("Состояние", "State")}</legend>
          <div>${states.map(([id, ru, en]) => `<label><input type="radio" name="orb-state" value="${id}"${id === "processing" ? " checked" : ""}><span>${l(ru, en)}</span></label>`).join("")}</div>
        </fieldset>
        <button type="button" class="ghost" data-orb-toggle hidden data-play="${l("Запустить анимацию", "Play animation")}" data-stop="${l("Остановить анимацию", "Stop animation")}">${l("Запустить анимацию", "Play animation")}</button>
        <details id="orb-gallery"><summary>${l("SVG-галерея и архив эскизов", "SVG gallery and design archive")}</summary>
          <p>${l("14 вариантов орба в приложении и 32 ранних эскиза движения, от звуковой волны до раскрытия расшифровки.", "Explore 14 versions of the app’s orb and 32 early motion sketches, from a voice waveform to an expanding transcript.")}</p>
          <div data-orb-picker hidden>
            <label for="orb-file">${l("Вариант для просмотра", "Preview selection")}</label>
            <select id="orb-file">${groups.map(([name, items]) => `<optgroup label="${esc(name)}">${items.map(([file, label]) => `<option value="${file}"${file === initial ? " selected" : ""}>${esc(label)}</option>`).join("")}</optgroup>`).join("")}</select>
            <a data-orb-download href="${esc(base + initial)}.svg" download>${l("Скачать SVG", "Download SVG")}</a>
          </div>
          <noscript>${groups.map(([name, items]) => `<p><strong>${esc(name)}</strong></p><ul>${items.map(([file, label]) => `<li><a href="${esc(base + file)}.svg">${esc(label)}</a></li>`).join("")}</ul>`).join("")}</noscript>
        </details>
      </div>
    </div>
  </section>`;
}
