const ru = document.documentElement.lang === 'ru';
const dialog = document.querySelector('#commands');
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog.open) dialog.close(); else dialog.showModal();
  }
});
dialog.querySelector('nav').addEventListener('click', () => dialog.close());
document.querySelector('[data-share]').addEventListener('click', async () => {
  try {
    if (navigator.share) await navigator.share({title:document.title,url:location.href});
    else {
      await navigator.clipboard.writeText(location.href);
      const toast=document.createElement('div');
      toast.className='notice'; toast.role='status';
      toast.textContent=ru?'Ссылка скопирована':'Link copied';
      document.body.append(toast); setTimeout(()=>toast.remove(),2400);
    }
  } catch (e) {if(e.name!=='AbortError') prompt(ru?'Скопируйте ссылку':'Copy link',location.href);}
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const watch=document.querySelector('[data-watch]');
if(watch){
  const scenes=ru?['Какие следующие шаги?','Согласовать объём и срок.','Подготовить прототип.']:['What are the next steps?','Agree on scope and timing.','Prepare a prototype.'];
  let current=0;
  setInterval(()=>{if(!document.hidden && !reduced.matches && !watch.closest('.watch').matches(':hover')) watch.textContent=scenes[++current%scenes.length];},3600);
}
const counter=document.body.dataset.counter;
if (/^[1-9]\d+$/.test(counter)) {
  const choiceKey='devlarion-analytics';
  function load(){
    window.ym=window.ym || function(){(window.ym.a=window.ym.a || []).push(arguments);};
    window.ym.l=Date.now();
    const script=document.createElement('script');script.async=true;script.src='https://mc.yandex.ru/metrika/tag.js';document.head.append(script);
    window.ym(Number(counter),'init',{webvisor:true,clickmap:true,trackLinks:true,accurateTrackBounce:true});
    const goal=name=>window.ym(Number(counter),'reachGoal',name);
    document.addEventListener('click',event=>{const a=event.target.closest('[data-goal],[data-brief]');if(a)goal(a.dataset.goal || 'telegram');});
    document.addEventListener('bureau-goal',event=>goal(event.detail));
  }
  let saved;try{saved=localStorage.getItem(choiceKey);}catch{}
  if(saved==='yes')load();
  if(!saved){
    const box=document.createElement('div');box.className='notice';box.setAttribute('role','region');
    box.textContent=ru?'Разрешить Яндекс Метрику и запись сеанса Вебвизором? ':'Allow Yandex Metrica analytics and Webvisor session recording? ';
    for(const [value,label] of [['yes',ru?'Разрешить':'Allow'],['no',ru?'Отклонить':'Decline']]){
      const button=document.createElement('button');button.textContent=label;button.onclick=()=>{try{localStorage.setItem(choiceKey,value);}catch{}box.remove();if(value==='yes')load();};box.append(button);
    }document.body.append(box);
  }
}
document.querySelector('.select-theme')?.addEventListener('click',()=>{
  dialog.close();
  document.querySelector('#theme').focus();
});
if(!reduced.matches){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      entry.target.classList.add('seen');
      observer.unobserve(entry.target);
    }
  });
  document.querySelectorAll('.service-grid article,.lab article,.case,.steps li').forEach(el=>observer.observe(el));
}
