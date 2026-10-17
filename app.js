(() => {
'use strict';
const categories=[
{id:'all',name:'Alles gemischt',icon:'🎲',color:'#9875ff'},
{id:'mix',name:'Allgemeinwissen',icon:'🧠',color:'#9875ff'},
{id:'gaming',name:'Gaming',icon:'🎮',color:'#4dbcec'},
{id:'geography',name:'Geografie',icon:'🌍',color:'#2bcbad'},
{id:'flags',name:'Flaggenquiz',icon:'🚩',color:'#3ed5dc'},
{id:'history',name:'Geschichte',icon:'🏛️',color:'#d8ac5b'},
{id:'science',name:'Wissenschaft',icon:'🔬',color:'#fd84a7'},
{id:'sports',name:'Sport',icon:'⚽',color:'#5bcb8c'},
{id:'movies',name:'Filme & Serien',icon:'🎬',color:'#e882d8'},
{id:'music',name:'Musik',icon:'🎵',color:'#ffae69'},
{id:'nature',name:'Natur & Tiere',icon:'🌿',color:'#7cd36c'},
{id:'technology',name:'Technik',icon:'💻',color:'#729cff'},
{id:'food',name:'Essen & Trinken',icon:'🍕',color:'#ef996b'},
{id:'language',name:'Sprache',icon:'📚',color:'#bf92eb'},
{id:'math',name:'Mathe & Logik',icon:'🔢',color:'#54d5c8'}];
const modeNames={classic:'Klassisch',blitz:'Blitz-Quiz',survival:'Überleben',truefalse:'Wahr oder falsch?'};
const diffNames={all:'Gemischt',easy:'Einfach',medium:'Mittel',hard:'Schwer'};
const $=id=>document.getElementById(id);
const storageKey='quiztsrb-stats-v1';
let settings={mode:'classic',category:'all',difficulty:'all',length:10};
let round=null,timer=null,lock=false,toastTimer=null;
function loadStats(){try{const x=JSON.parse(localStorage.getItem(storageKey)||'{}');return {games:Number(x.games)||0,best:Number(x.best)||0,totalCorrect:Number(x.totalCorrect)||0,totalQuestions:Number(x.totalQuestions)||0,records:x.records&&typeof x.records==='object'?x.records:{}}}catch{return {games:0,best:0,totalCorrect:0,totalQuestions:0,records:{}}}}
let stats=loadStats();
function saveStats(){try{localStorage.setItem(storageKey,JSON.stringify(stats))}catch{notify('Dein Browser verhindert die lokale Speicherung.')}} 
function notify(msg){const x=$('toast');x.textContent=msg;x.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>x.classList.remove('show'),3000)}
function shuffle(a){let b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function getPool(){if(settings.category==='flags')return window.QUIZ_FLAGS.map((f,i)=>({id:10000+i,category:'flags',difficulty:'all',flag:f,question:'Welches Land gehört zu dieser Flagge?',answers:[f.name],correct:0}));return window.QUIZ_QUESTIONS.filter(q=>(settings.mode==='truefalse'?q.category==='tf':q.category!=='tf'&&(settings.category==='all'||q.category===settings.category))&&(settings.difficulty==='all'||q.difficulty===settings.difficulty))}
function getCategory(id){return categories.find(c=>c.id===id)||categories[0]}
function renderCategories(filter=''){
 const grid=$('categories-grid');grid.replaceChildren();
 const normalized=filter.trim().toLocaleLowerCase('de');
 categories.filter(c=>c.name.toLocaleLowerCase('de').includes(normalized)).forEach(c=>{
 const count=c.id==='flags'?window.QUIZ_FLAGS.length:window.QUIZ_QUESTIONS.filter(q=>q.category!=='tf'&&(c.id==='all'||q.category===c.id)).length;
 const btn=document.createElement('button');btn.type='button';btn.className='category-card'+(settings.category===c.id?' active':'');btn.dataset.category=c.id;btn.setAttribute('aria-pressed',String(settings.category===c.id));btn.style.setProperty('--cat-color',c.color);
 const ico=document.createElement('span');ico.className='category-icon';ico.textContent=c.icon;
 const txt=document.createElement('span');const strong=document.createElement('strong');strong.textContent=c.name;const small=document.createElement('small');small.textContent=count+' Fragen';txt.append(strong,small);
 const tick=document.createElement('span');tick.className='category-check';tick.textContent='✓';
 btn.append(ico,txt,tick);btn.addEventListener('click',()=>{settings.category=c.id;if(c.id==='flags'&&settings.mode==='truefalse')settings.mode='classic';if(c.id!=='flags'&&settings.length===195)settings.length=10;renderCategories($('category-search').value);renderSelection();document.querySelector('#einstellungen').scrollIntoView({behavior:'smooth',block:'center'})});grid.append(btn);
 });
 if(!grid.childElementCount){const p=document.createElement('p');p.textContent='Keine Kategorie gefunden.';grid.append(p)}
}
function renderSelection(){
 $('all-flags-option').hidden=settings.category!=='flags';
 document.querySelectorAll('[data-difficulty]').forEach(b=>{b.disabled=settings.category==='flags';b.title=settings.category==='flags'?'Im Flaggenquiz gibt es keine Schwierigkeitsstufen.':''});
 document.querySelector('[data-mode="truefalse"]').disabled=settings.category==='flags';
 document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===settings.mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 document.querySelectorAll('[data-difficulty]').forEach(b=>{const active=b.dataset.difficulty===settings.difficulty;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 document.querySelectorAll('[data-length]').forEach(b=>{const active=Number(b.dataset.length)===settings.length;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 const category=settings.mode==='truefalse'?'Alle Themen':getCategory(settings.category).name;
 $('selection-summary').textContent=modeNames[settings.mode]+' · '+category+' · '+diffNames[settings.difficulty];
 const pool=getPool();const n=Math.min(settings.length,pool.length);
 $('available-count').textContent=pool.length?pool.length+(settings.category==='flags'?' Länderflaggen':' Fragen')+' verfügbar · '+n+' werden gespielt':'Keine passenden Fragen – ändere eine Auswahl';
 $('start-quiz').disabled=!pool.length;$('start-quiz').style.opacity=pool.length?'1':'.45';
}
function renderStats(){$('stat-categories').textContent=categories.length-1;$('stat-questions').textContent=window.QUIZ_QUESTIONS.length+window.QUIZ_FLAGS.length;$('stat-best').textContent=stats.best.toLocaleString('de-DE');$('stat-games').textContent=stats.games}
function showScreen(name){$('home-screen').hidden=name!=='home';$('game-screen').hidden=name!=='game';$('results-screen').hidden=name!=='results';window.scrollTo({top:0,behavior:'instant'})}
function stopTimer(){if(timer!==null){clearInterval(timer);timer=null}}
function startGame(daily=false){
 stopTimer();let pool=getPool();if(!pool.length){notify('Keine Fragen gefunden.');return}
 if(daily){settings={mode:'blitz',category:'all',difficulty:'all',length:10};pool=getPool();renderSelection()}
 // A daily challenge uses seeded deterministic ordering so the same date offers the same questions.
 if(daily){const date=new Date().toLocaleDateString('en-CA');let hash=0;for(const ch of date)hash=(Math.imul(hash,31)+ch.charCodeAt(0))|0;pool=[...pool].sort((a,b)=>{const score=x=>{let n=(x.id^hash)|0;n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0};return score(a)-score(b)})}else pool=shuffle(pool);
 round={questions:pool.slice(0,settings.length).map(q=>({...q,options:q.category==='flags'?[]:q.category==='tf'?[...q.answers]:shuffle(q.answers)})),index:0,score:0,correct:0,streak:0,bestStreak:0,lives:3,answered:0,daily,mode:settings.mode,category:settings.category,finished:false};
 showScreen('game');renderQuestion();
}
function renderQuestion(){
 stopTimer();lock=false;
 if(!round||round.finished)return;
 if(round.index>=round.questions.length||round.lives<=0){endGame();return}
 const q=round.questions[round.index],cat=q.category==='tf'?{name:'Wahr oder falsch?',icon:'✅'}:getCategory(q.category);
 $('game-mode-label').textContent=(round.daily?'TAGES-CHALLENGE · ':'')+modeNames[round.mode].toUpperCase();
 $('game-heading').textContent=q.category==='flags'?'Erkennst du diese Flagge?':round.mode==='truefalse'?'Stimmt das wirklich?':'Teste dein Wissen';
 $('game-score').textContent=round.score.toLocaleString('de-DE');
 $('game-progress-label').textContent='Frage '+(round.index+1)+' von '+round.questions.length;
 $('game-streak').textContent='🔥 '+round.streak+'er-Serie';
 $('game-lives').hidden=round.mode!=='survival';
 $('game-lives').textContent='❤️'.repeat(round.lives)+'🖤'.repeat(3-round.lives);
 $('game-timer').hidden=round.mode!=='blitz';
 $('game-progress-bar').style.width=round.index/round.questions.length*100+'%';
 $('question-category').textContent=cat.icon+' '+cat.name;
 $('question-difficulty').textContent=q.category==='flags'?q.flag.region:diffNames[q.difficulty];
 $('question-text').textContent=q.question;
 $('answer-feedback').hidden=true;$('answer-feedback').textContent='';
 $('next-question').hidden=true;
 $('keyboard-hint').textContent=q.category==='flags'?'Tipp: Enter prüft deine Eingabe.':'Tipp: Antworte mit den Tasten '+(q.options.length===2?'1–2':'1–4');
 $('flag-question').hidden=q.category!=='flags';$('answer-grid').hidden=q.category==='flags';
 if(q.category==='flags'){const img=$('flag-image');$('flag-error').hidden=true;img.hidden=false;img.onload=()=>{if(round&&round.questions[round.index]===q){$('flag-error').hidden=true;img.hidden=false}};img.onerror=()=>{if(round&&round.questions[round.index]===q){img.hidden=true;$('flag-error').hidden=false}};img.src='https://flagcdn.com/w640/'+q.flag.code+'.png';$('flag-input').value='';$('flag-input').disabled=false;$('flag-submit').disabled=false;$('flag-skip').disabled=false;setTimeout(()=>{if(round&&!round.finished&&!lock&&round.questions[round.index]===q)$('flag-input').focus()},0)}
 const grid=$('answer-grid');grid.replaceChildren();
 q.options.forEach((answer,index)=>{const b=document.createElement('button');b.type='button';b.className='answer-btn';b.dataset.answer=String(index);const prefix=document.createElement('span');prefix.textContent=String(index+1);const text=document.createTextNode(answer);b.append(prefix,text);b.addEventListener('click',()=>submitAnswer(index));grid.append(b)});
 if(round.mode==='blitz'){let remaining=15;$('game-timer').textContent='⏱ '+remaining+'s';timer=setInterval(()=>{remaining--;if(!round||round.finished){stopTimer();return}$('game-timer').textContent='⏱ '+remaining+'s';if(remaining<=0)(round.questions[round.index].category==='flags'?submitFlag(true):submitAnswer(-1))},1000)}
}
function normalizeCountry(value){return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLocaleLowerCase('de').replace(/[^a-z0-9]/g,'')}
function submitFlag(skipped=false){
 if(lock||!round||round.finished)return;
 const q=round.questions[round.index];if(!q||q.category!=='flags')return;
 const response=$('flag-input').value.trim();if(!skipped&&!response){$('flag-input').focus();return}
 lock=true;stopTimer();const accepted=[q.flag.name,...q.flag.aliases].map(normalizeCountry);
 const right=!skipped&&accepted.includes(normalizeCountry(response));
 round.answered++;if(right){round.correct++;round.streak++;round.bestStreak=Math.max(round.bestStreak,round.streak);round.score+=100+Math.min((round.streak-1)*20,100)}else{round.streak=0;if(round.mode==='survival')round.lives--}
 $('flag-input').disabled=true;$('flag-submit').disabled=true;$('flag-skip').disabled=true;
 $('flag-input').classList.toggle('correct',right);$('flag-input').classList.toggle('incorrect',!right);
 const feedback=$('answer-feedback');feedback.hidden=false;feedback.textContent=right?'✅ Richtig! '+q.flag.name+' · +'+(100+Math.min((round.streak-1)*20,100))+' Punkte.':skipped?'⏭ Übersprungen. Das war: '+q.flag.name:'❌ Leider falsch. Die richtige Antwort ist: '+q.flag.name;
 $('game-score').textContent=round.score.toLocaleString('de-DE');$('game-streak').textContent='🔥 '+round.streak+'er-Serie';$('game-lives').textContent='❤️'.repeat(round.lives)+'🖤'.repeat(3-round.lives);
 $('game-progress-bar').style.width=(round.index+1)/round.questions.length*100+'%';$('next-question').hidden=false;$('next-question').textContent=round.index===round.questions.length-1||round.lives===0?'Ergebnis ansehen →':'Nächste Flagge →';$('next-question').focus();
}
function submitAnswer(index){
 if(lock||!round||round.finished)return;lock=true;stopTimer();
 const q=round.questions[round.index],correctIndex=q.options.indexOf(q.answers[q.correct]),right=index===correctIndex;
 round.answered++;if(right){round.correct++;round.streak++;round.bestStreak=Math.max(round.bestStreak,round.streak);round.score+=100+Math.min((round.streak-1)*20,100)}else{round.streak=0;if(round.mode==='survival')round.lives--}
 document.querySelectorAll('.answer-btn').forEach((btn,i)=>{btn.disabled=true;if(i===correctIndex)btn.classList.add('correct');else if(i===index)btn.classList.add('incorrect')});
 const feedback=$('answer-feedback');feedback.hidden=false;feedback.textContent=right?'✅ Richtig! +'+(100+Math.min((round.streak-1)*20,100))+' Punkte.':index===-1?'⏰ Die Zeit ist abgelaufen! Richtige Antwort: '+q.answers[q.correct]:'❌ Leider falsch. Richtige Antwort: '+q.answers[q.correct];
 $('game-score').textContent=round.score.toLocaleString('de-DE');$('game-streak').textContent='🔥 '+round.streak+'er-Serie';
 $('game-lives').textContent='❤️'.repeat(round.lives)+'🖤'.repeat(3-round.lives);
 $('game-progress-bar').style.width=(round.index+1)/round.questions.length*100+'%';
 $('next-question').hidden=false;$('next-question').textContent=round.index===round.questions.length-1||round.lives===0?'Ergebnis ansehen →':'Nächste Frage →';
}
function nextQuestion(){if(!round||!lock)return;round.index++;if(round.index>=round.questions.length||round.lives<=0)endGame();else renderQuestion()}
function endGame(){
 stopTimer();if(!round||round.finished)return;round.finished=true;
 const r=round;const rate=r.answered?Math.round(r.correct/r.answered*100):0;const recordKey=r.daily?'daily':r.mode+'-'+r.category;
 const previous=stats.records[recordKey]||0;const record=r.score>previous;
 stats.games++;stats.totalCorrect+=r.correct;stats.totalQuestions+=r.answered;stats.best=Math.max(stats.best,r.score);stats.records[recordKey]=Math.max(previous,r.score);saveStats();renderStats();
 $('result-medal').textContent=rate>=90?'🏆':rate>=60?'🥇':rate>=30?'🥈':'💪';
 $('result-title').textContent=rate>=90?'Unglaublich stark!':rate>=60?'Stark gespielt!':rate>=30?'Gut gemacht!':'Nächste Runde wird besser!';
 $('result-subtitle').textContent=r.daily?'Deine heutige Challenge ist geschafft.':'Deine Runde ist beendet. Hier ist deine Bilanz.';
 $('result-score').textContent=r.score.toLocaleString('de-DE');
 $('result-correct').textContent=r.correct+' / '+r.answered;
 $('result-rate').textContent=rate+' %';
 $('result-streak').textContent=r.bestStreak;
 $('result-record').hidden=!record;showScreen('results');
}
function showScores(){
 const el=$('scores-content');el.replaceChildren();
 const rows=[['Gespielte Runden',stats.games],['Richtig beantwortete Fragen',stats.totalCorrect],['Fragen insgesamt',stats.totalQuestions],['Beste Punktzahl',stats.best.toLocaleString('de-DE')],['Trefferquote insgesamt',stats.totalQuestions?Math.round(stats.totalCorrect/stats.totalQuestions*100)+' %':'–']];
 rows.forEach(([name,value])=>{const row=document.createElement('div');row.className='score-row';const label=document.createElement('span');label.textContent=name;const strong=document.createElement('strong');strong.textContent=value;row.append(label,strong);el.append(row)});
 $('scores-dialog').showModal();
}
function backHome(){stopTimer();round=null;showScreen('home');renderSelection();renderStats();if(location.hash!=='#start')history.replaceState(null,'',location.pathname+location.search+'#start')}
function askExit(){if(round&&!round.finished&&!confirm('Möchtest du das laufende Quiz wirklich verlassen? Dein aktueller Punktestand geht verloren.'))return;backHome()}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{settings.mode=b.dataset.mode;if(settings.mode==='truefalse'&&settings.category==='flags')settings.category='all';renderCategories($('category-search').value);renderSelection();if(settings.mode==='truefalse')notify('Wahr/Falsch nutzt Fragen aus allen Themen.')}));
document.querySelectorAll('[data-difficulty]').forEach(b=>b.addEventListener('click',()=>{settings.difficulty=b.dataset.difficulty;renderSelection()}));
document.querySelectorAll('[data-length]').forEach(b=>b.addEventListener('click',()=>{settings.length=Number(b.dataset.length);renderSelection()}));
$('flag-form').addEventListener('submit',e=>{e.preventDefault();submitFlag()});$('flag-skip').addEventListener('click',()=>submitFlag(true));
$('category-search').addEventListener('input',e=>renderCategories(e.target.value));
$('start-quiz').addEventListener('click',()=>startGame());
$('daily-hero').addEventListener('click',()=>startGame(true));
$('game-exit').addEventListener('click',askExit);
$('brand-link').addEventListener('click',e=>{if(round&&!round.finished){e.preventDefault();askExit()}else backHome()});
document.querySelectorAll('[data-home-link]').forEach(a=>a.addEventListener('click',e=>{if(round&&!round.finished){e.preventDefault();if(confirm('Quiz verlassen? Dein Fortschritt geht verloren.')){backHome();location.hash=a.getAttribute('href')}}}));
$('next-question').addEventListener('click',nextQuestion);
$('play-again').addEventListener('click',()=>startGame(Boolean(round&&round.daily)));
$('back-to-home').addEventListener('click',backHome);
$('scores-open').addEventListener('click',showScores);
$('scores-close').addEventListener('click',()=>$('scores-dialog').close());
$('scores-done').addEventListener('click',()=>$('scores-dialog').close());
$('scores-reset').addEventListener('click',()=>{if(!confirm('Alle deine lokalen Quiz-Rekorde und Statistiken wirklich löschen?'))return;stats={games:0,best:0,totalCorrect:0,totalQuestions:0,records:{}};saveStats();renderStats();showScores();notify('Lokale Statistiken zurückgesetzt.')});
$('theme-toggle').addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('quiztsrb-theme',t)}catch{}updateThemeIcon()});
function updateThemeIcon(){$('theme-toggle').textContent=document.documentElement.dataset.theme==='dark'?'☀':'☾'}
document.addEventListener('keydown',e=>{if(!round||round.finished||$('game-screen').hidden||e.target.closest('input,dialog')||e.altKey||e.ctrlKey||e.metaKey)return;if(round.questions[round.index].category==='flags')return;if(!lock&&/^[1-4]$/.test(e.key)){const idx=Number(e.key)-1;if(idx<round.questions[round.index].options.length)submitAnswer(idx)}else if(lock&&e.key==='Enter')nextQuestion()});
renderCategories();renderSelection();renderStats();updateThemeIcon();
})();