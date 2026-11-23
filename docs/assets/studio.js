const ru = document.documentElement.lang === 'ru';
const dialog = document.querySelector('#commands');
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog.open) dialog.close(); else dialog.showModal();
  }
});
dialog.querySelector('nav').addEventListener('click', () => dialog.close());
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const watch=document.querySelector('[data-watch]');
if(watch){
  const scenes=ru?['Какие следующие шаги?','Согласовать объём и срок.','Подготовить прототип.']:['What are the next steps?','Agree on scope and timing.','Prepare a prototype.'];
  let current=0;
  setInterval(()=>{if(!document.hidden && !reduced.matches && !watch.closest('.watch').matches(':hover')) watch.textContent=scenes[++current%scenes.length];},3600);
}
const settings=window.devLarionSettings || {};
if (/^https:\/\/t\.me\/[A-Za-z0-9_]+\/?$/.test(settings.channel)){
  for(const slot of document.querySelectorAll('[data-channel]')){
    const a=document.createElement('a');
    a.href=settings.channel;
    a.textContent=ru?'Telegram-канал':'Telegram channel';
    a.dataset.goal='channel';
    slot.replaceWith(a);
  }
}
const counter=settings.privacyOperator?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.privacyEmail) ? settings.metrika : '';
if (/^[1-9]\d+$/.test(counter)) {
  document.querySelector('[data-preferences]').hidden=false;
  const policyText=document.querySelector('[data-analytics-policy]');
  if(policyText){
    policyText.textContent=ru?'С вашего согласия Яндекс Метрика использует cookies для оценки источников и нажатий. Вебвизор записывает взаимодействия со страницей. Поля калькулятора скрыты от записи. Вы можете изменить решение в настройках аналитики внизу страницы.':'With your consent, Yandex Metrica uses cookies to measure traffic sources and clicks. Webvisor records page interactions. The estimator fields are masked. You can change your choice using Analytics preferences in the footer.';
    const contact=document.createElement('a');
    contact.textContent=settings.privacyEmail;contact.href='mailto:'+settings.privacyEmail;
    document.querySelector('[data-operator]').append((ru?'Оператор — ':'Operator — ')+settings.privacyOperator+' · ',contact);
  }
  const choiceKey='devlarion-analytics';
  const privateMap = document.body.hasAttribute('data-local-growth-maps');
  function load(){
    window.ym=window.ym || function(){(window.ym.a=window.ym.a || []).push(arguments);};
    window.ym.l=Date.now();
    const script=document.createElement('script');script.async=true;script.src='https://mc.yandex.ru/metrika/tag.js';document.head.append(script);
    window.ym(Number(counter),'init',privateMap
      ? {defer:true,webvisor:false,clickmap:false,trackLinks:false,trackHash:false,accurateTrackBounce:false}
      : {webvisor:true,clickmap:true,trackLinks:true,accurateTrackBounce:true});
    if(privateMap)window.ym(Number(counter),'hit',location.origin+location.pathname);
    const goal=name=>window.ym(Number(counter),'reachGoal',name);
    document.addEventListener('click',event=>{const a=event.target.closest('[data-goal],[data-brief]');if(a)goal(a.dataset.goal || 'telegram');});
    document.addEventListener('bureau-goal',event=>goal(event.detail));
  }
  let saved;try{saved=localStorage.getItem(choiceKey);}catch{}
  if(saved==='yes')load();
  function promptConsent(){
    document.querySelector('[data-consent]')?.remove();
    const box=document.createElement('div');box.dataset.consent='';box.className='notice';box.setAttribute('role','region');
    box.textContent=privateMap
      ? (ru?'Разрешить Яндекс Метрику? ':'Allow Yandex Metrica analytics? ')
      : (ru?'Разрешить Яндекс Метрику и запись сеанса Вебвизором? ':'Allow Yandex Metrica analytics and Webvisor session recording? ');
    const policy=document.createElement('a');policy.href=document.body.dataset.privacyUrl;policy.textContent=ru?'Подробнее':'Privacy';box.append(policy);
    for(const [value,label] of [['yes',ru?'Разрешить':'Allow'],['no',ru?'Отклонить':'Decline']]){
      const button=document.createElement('button');button.textContent=label;button.onclick=()=>{try{localStorage.setItem(choiceKey,value);}catch{}box.remove();if(value==='yes' && saved!=='yes')load();if(value==='no' && saved==='yes')location.reload();saved=value;};box.append(button);
    }document.body.append(box);
  }
  if(!saved)promptConsent();
  document.querySelector('[data-preferences]')?.addEventListener('click',promptConsent);
}
document.querySelector('.select-theme')?.addEventListener('click',()=>{
  dialog.close();
  document.querySelector('#theme').click();
});
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      entry.target.classList.add('seen');
      observer.unobserve(entry.target);
    }
  });
  document.querySelectorAll('.service-grid article,.lab article,.case,.steps li').forEach(el=>observer.observe(el));
  const iconObserver = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      target.classList.add('icon-seen');
      iconObserver.unobserve(target);
    }
  }, { threshold: .35 });
  document.querySelectorAll('.service-mark, [data-company-panel] summary > span, [data-solution] > span')
    .forEach(icon => iconObserver.observe(icon));
}
document.querySelector('[data-menu]').addEventListener('click',()=>dialog.showModal());
if(matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced.matches){
  for(const card of document.querySelectorAll('.hero .button')){
    card.addEventListener('pointermove',event=>{
      if(reduced.matches)return;
      const box=card.getBoundingClientRect();
      const x=(event.clientX-box.left)/box.width-.5;
      const y=(event.clientY-box.top)/box.height-.5;
      card.style.transform=`translate(${x*5}px,${y*5}px)`;
    });
    card.addEventListener('pointerleave',()=>card.style.removeProperty('transform'));
  }
}
